/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { ROUTE_SET } from 'state/action-types';

export default createReducer( '/', {
	[ ROUTE_SET ]: ( state, { path } ) => path,
} );
