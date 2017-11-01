/**
 * Eternal dependencies
 *
 * @format
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Gets the initial query parameters set by a ROUTE_SET action
 * @param {Object} state - global redux state
 * @return {Object} current state value
 */
export const getInitialQueryArguments = createSelector( state =>
	get( state, 'ui.route.query.initial', null )
);

export default getInitialQueryArguments;
