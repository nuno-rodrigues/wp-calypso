/**
 * External dependencies
 *
 * @format
 */

import { pick, get, isInteger } from 'lodash';

/**
 * Internal dependencies
 */
import { REWIND_BACKUP, REWIND_BACKUP_LIST } from 'state/action-types';
import {
	rewindBackupUpdateError,
	getRewindBackupProgress,
	updateRewindBackups,
} from 'state/activity-log/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

const createBackup = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				method: ! action.rewindId ? 'GET' : 'POST',
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ action.siteId }/rewind/downloads`,
				body: {
					rewindId: action.rewindId,
				},
			},
			action
		)
	);
};

export const receiveBackupSuccess = ( { dispatch }, { siteId }, apiData ) => {
	if ( apiData.downloadId && isInteger( apiData.downloadId ) ) {
		dispatch( getRewindBackupProgress( siteId, apiData.downloadId ) );
	} else {
		const lastBackupCreated = get( apiData, [ '0', 'downloadId' ], null );
		if ( isInteger( lastBackupCreated ) ) {
			dispatch( updateRewindBackups( siteId, lastBackupCreated, get( apiData, [ '0' ], {} ) ) );
		} else {
			dispatch(
				rewindBackupUpdateError( siteId, {
					status: 'finished',
					error: 'missing_download_id',
					message: 'Bad response. No download ID provided.',
				} )
			);
		}
	}
};

export const receiveBackupError = ( { dispatch }, { siteId }, error ) => {
	dispatch( rewindBackupUpdateError( siteId, pick( error, [ 'error', 'status', 'message' ] ) ) );
};

export default {
	[ REWIND_BACKUP ]: [ dispatchRequest( createBackup, receiveBackupSuccess, receiveBackupError ) ],
	[ REWIND_BACKUP_LIST ]: [
		dispatchRequest( createBackup, receiveBackupSuccess, receiveBackupError ),
	],
};
