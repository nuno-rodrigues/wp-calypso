/**
 * External dependencies
 */
import ReactDomServer from 'react-dom/server';
import superagent from 'superagent';
import Lru from 'lru';
import { isEmpty, pick } from 'lodash';
import debugFactory from 'debug';
import qs from 'qs';

/**
 * Internal dependencies
 */
import config from 'config';
import { isDefaultLocale } from 'lib/i18n-utils';
import { isSectionIsomorphic } from 'state/ui/selectors';
import {
	getDocumentHeadFormattedTitle,
	getDocumentHeadMeta,
	getDocumentHeadLink,
} from 'state/document-head/selectors';
import isRTL from 'state/selectors/is-rtl';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import { reducer } from 'state';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';
import stateCache from 'state-cache';
import { createReduxStore } from 'state';

const debug = debugFactory( 'calypso:server-render' );
const HOUR_IN_MS = 3600000;
const markupCache = new Lru( {
	max: 3000,
	maxAge: HOUR_IN_MS,
} );

function bumpStat( group, name ) {
	const statUrl = `http://pixel.wp.com/g.gif?v=wpcom-no-pv&x_${ group }=${ name }&t=${ Math.random() }`;

	if ( config( 'env' ) === 'production' ) {
		superagent.get( statUrl ).end();
	}
}

export function getCacheKey( context ) {
	const pathname = context.pathname;

	if ( isEmpty( context.query ) || isEmpty( context.cacheQueryKeys ) ) {
		return pathname;
	}

	const cachedQueryParams = pick( context.query, context.cacheQueryKeys );

	if ( isEmpty( cachedQueryParams ) ) {
		return pathname;
	}

	return pathname + '?' + qs.stringify( cachedQueryParams, { sort: ( a, b ) => a.localCompare( b ) } );
}

/**
* Render and cache supplied React element to a markup string.
* Cache is keyed by stringified element by default.
*
* @param {object} context - React element to be rendered to html
* @param {string} key - (optional) custom key
* @return {string} The rendered Layout
*/
export function renderLayout( context ) {
	try {
		const startTime = Date.now();
		const isIsomorphic = isSectionIsomorphic( context.store.getState() );
		const key = isIsomorphic ? getCacheKey( context ) : JSON.stringify( context.layout );

		debug( 'cache access for key', key );

		let renderedLayout = markupCache.get( key );
		if ( ! renderedLayout ) {
			bumpStat( 'calypso-ssr', 'loggedout-design-cache-miss' );
			debug( 'cache miss for key', key );
			renderedLayout = ReactDomServer.renderToString( context.layout );
			markupCache.set( key, renderedLayout );

			// save the state of the store with the same key as the layout
			if ( context.store ) {
				let reduxSubtrees = [ 'documentHead' ];

				if ( isIsomorphic ) {
					reduxSubtrees = reduxSubtrees.concat( [ 'ui', 'themes' ] );
				}

				// Send state to client
				context.initialReduxState = pick( context.store.getState(), reduxSubtrees );
				const serverState = reducer( context.initialReduxState, { type: SERIALIZE } );
				stateCache.set( key, serverState );
			}
		} else {
			const serializedServerState = stateCache.get( key );
			if ( serializedServerState ) {
				context.initialReduxState = reducer( serializedServerState, { type: DESERIALIZE } );
				context.store = createReduxStore( context.initialReduxState );
			}
		}
		const rtsTimeMs = Date.now() - startTime;
		debug( 'Server render time (ms)', rtsTimeMs );

		if ( rtsTimeMs > 100 ) {
			// Server renders should probably never take longer than 100ms
			bumpStat( 'calypso-ssr', 'over-100ms-rendertostring' );
		}

		context.renderedLayout = renderedLayout;
	} catch ( ex ) {
		if ( config( 'env' ) === 'development' ) {
			throw ex;
		}
	}
}

export function serverRender( req, res ) {
	const context = req.context;

	if ( ! isDefaultLocale( context.lang ) ) {
		context.i18nLocaleScript = '//widgets.wp.com/languages/calypso/' + context.lang + '.js';
	}

	if (
		config.isEnabled( 'server-side-rendering' ) &&
		context.layout &&
		! context.user &&
		isDefaultLocale( context.lang )
	) {
		renderLayout( context );
	}

	const title = getDocumentHeadFormattedTitle( context.store.getState() );
	const metas = getDocumentHeadMeta( context.store.getState() );
	const links = getDocumentHeadLink( context.store.getState() );

	context.isRTL = isRTL( context.store.getState() );
	context.lang = getCurrentLocaleSlug( context.store.getState() );

	context.head = { title, metas, links };
	context.config = config.ssrConfig;

	if ( config.isEnabled( 'desktop' ) ) {
		res.render( 'desktop.jade', context );
	} else {
		res.render( 'index.jade', context );
	}
}

export function serverRenderError( err, req, res, next ) {
	if ( err ) {
		if ( config( 'env' ) !== 'production' ) {
			console.error( err );
		}
		req.error = err;
		res.status( err.status || 500 );
		res.render( '500.jade', req.context );
		return;
	}

	next();
}
