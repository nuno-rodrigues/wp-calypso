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
 * @return {String} current state value
 */
const getCurrentRoute = createSelector( state => get( state, 'ui.route', null ) );

export default getCurrentRoute;
