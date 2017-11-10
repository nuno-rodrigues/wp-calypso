/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the progress of a backup request
 *
 * @param  {Object}        state  Global state tree
 * @param  {Number|String} siteId The site ID
 * @return {?Object}              Downloadable backup object, null if no data
 */
export default function getBackupReady( state, siteId ) {
	return get( state, [ 'activityLog', 'backupReady', siteId ], null );
}
