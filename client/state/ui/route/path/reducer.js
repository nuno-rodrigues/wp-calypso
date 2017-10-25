/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
import { createReducer, combineReducers } from 'state/utils';
import { ROUTE_SET } from 'state/action-types';

const initial = createReducer(
	false,
	{
		[ ROUTE_SET ]: ( state, { path } ) => ( state === false ? path : state ),
	},
	{ type: 'string' }
);

const current = createReducer(
	false,
	{
		[ ROUTE_SET ]: ( state, { path } ) => path,
	},
	{ type: 'string' }
);

export default combineReducers( {
	initial,
	current,
} );
