/**
 * Eternal dependencies
 *
 * @format
 */

import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import getCurrentRoute from './get-current-route';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';

/**
 * Checks if the current route against a pathname and a query object
 * @param {Object} state - global redux state
 * @param {string} pathname - pathname of the page
 * @param {Object} query - parsed object containing query parameters
 * @return {Boolean} result of the check
 */
export const isCurrentRoute = ( state, pathname, query = {} ) =>
	pathname === getCurrentRoute( state ) && isEqual( query, getCurrentQueryArguments( state ) );

export default isCurrentRoute;
