/** @format */
/**
 * External dependencies
 */
import { get, map } from 'lodash';

/**
 * Internal dependencies
 */
import { makeParser } from 'state/data-layer/wpcom-http/utils';
import apiResponseSchema from './schema';

/**
 * Module constants
 */
export const DEFAULT_GRAVATAR_URL = 'https://www.gravatar.com/avatar/0';
export const DEFAULT_GRIDICON = 'info-outline';

/**
 * Transforms API response into array of activities
 *
 * @param  {object} apiResponse                      API response body
 * @param  {array}  apiResponse.current.orderedItems Array of item objects
 * @return {array}                                   Array of proccessed item objects
 */
export function transformer( apiResponse ) {
	const orderedItems = get( apiResponse, [ 'current', 'orderedItems' ], [] );
	return map( orderedItems, processItem );
}

const getActivityDescription = item => {
	const { actor, generator, object } = item;

	switch ( item.name ) {
		case 'post__published':
			return (
				`<em>${ actor.name }</em> published post ` +
				`<a href="/read/blogs/${ generator.blog_id }/posts/` +
				`${ object.object_id }">${ object.name }</a>`
			);

		case 'plugin__deleted':
			return (
				`<em>${ actor.name }</em> deleted plugin ` +
				`<a href="/plugins/${ object.name }/${ generator.blog_id }">${ object.name }</a>`
			);

		case 'plugin__installed':
			return (
				`<em>${ actor.name }</em> installed plugin ` +
				`<a href="/plugins/${ object.name }/${ generator.blog_id }">${ object.name }</a> (${ object.object_version })`
			);

		case 'user__deleted':
			return (
				`<em>${ actor.name }</em> removed ` +
				`<a href="/people/edit/${ generator.blog_id }/${ object.name }">` +
				`${ object.name }</a> from site.`
			);

		case 'user__registered':
			return (
				`<em>${ actor.name }</em> added user ` +
				`<a href="/people/edit/${ generator.blog_id }/${ object.name }">` +
				`${ object.name }</a> to site.`
			);

		case 'user__updated':
			return (
				`<em>${ actor.name }</em> modified user ` +
				`<a href="/people/edit/${ generator.blog_id }/${ object.name }">` +
				`${ object.name }</a> to site.`
			);

		default:
			return item.summary || '';
	}
};

/**
 * Takes an Activity item in the API format and returns a processed Activity item for use in UI
 *
 * @param  {object}  item Validated Activity item
 * @return {object}       Processed Activity item ready for use in UI
 */
export function processItem( item ) {
	const published = item.published;
	const actor = item.actor;

	return {
		/* activity actor */
		actorAvatarUrl: get( actor, 'icon.url', DEFAULT_GRAVATAR_URL ),
		actorName: get( actor, 'name', '' ),
		actorRemoteId: get( actor, 'external_user_id', 0 ),
		actorRole: get( actor, 'role', '' ),
		actorType: get( actor, 'type', '' ),
		actorWpcomId: get( actor, 'wpcom_user_id', 0 ),

		/* base activity info */
		activityDate: published,
		activityGroup: ( item.name || '' ).split( '__', 1 )[ 0 ], // split always returns at least one item
		activityIcon: get( item, 'gridicon', DEFAULT_GRIDICON ),
		activityId: item.activity_id,
		activityIsRewindable: item.is_rewindable,
		rewindId: item.rewind_id,
		activityName: item.name,
		activityStatus: item.status,
		activityTargetTs: get( item, 'object.target_ts', undefined ),
		activityTitle: get( item, 'summary', '' ),
		activityTs: Date.parse( published ),
		activityDescription: getActivityDescription( item ),
	};
}

// fromApi default export
export default makeParser( apiResponseSchema, {}, transformer );
