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
 * Gets the last route set by a ROUTE_SET action
 * @param {Object} state - global redux state
 * @return {Object} current state value
 */
export const getCurrentRoute = createSelector( state =>
	get( state, 'ui.route.path.current', null )
);

export default getCurrentRoute;
