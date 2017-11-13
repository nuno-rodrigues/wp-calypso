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
 * Normalize timestamp values
 *
 * Some timestamps are in seconds instead
 * of in milliseconds and this will make
 * sure they are all reported in ms
 *
 * The chosen comparison date is older than
 * WordPress so no backups should already
 * exist prior to that date 😉
 *
 * @param {Number} ts timestamp in 's' or 'ms'
 * @returns {Number} timestamp in 'ms'
 */
const ms = ts =>
	ts < 946702800000 // Jan 1, 2001 @ 00:00:00
		? ts * 1000 // convert s -> ms
		: ts;

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
	const { generator = {}, items = [], object = {}, target = {} } = item;
	const { blog_id: blogId } = generator;
	const { name, object_version: version } = object;
	const { post_id: postId } = target;

	const makePart = ( type, data ) => text => [ type, data( item ), text ];

	const comment = makePart( 'comment', () => ( { blogId, postId, commentId: object.object_id } ) );
	const commentPost = makePart( 'post', () => ( { blogId, postId } ) );
	const firstPlugin = makePart( 'plugin', () => ( { blogId, name: items[ 0 ].name } ) );
	const person = makePart( 'person', () => ( { blogId, name } ) );
	const plugin = makePart( 'plugin', () => ( { blogId, name } ) );
	const post = makePart( 'post', () => ( { blogId, postId: object.object_id } ) );
	const theme = makePart( 'theme', () => ( { url: object.id, name, version } ) );

	switch ( item.name ) {
		case 'comment__approved':
			return [
				'Comment approved',
				'approved a ',
				comment( 'comment' ),
				` on ${ target.post_type } `,
				commentPost( target.name ),
			];

		case 'comment__published':
			return [
				'Comment published',
				comment( 'commented' ),
				` on ${ target.post_type } `,
				commentPost( target.name ),
			];

		case 'comment__published_awaiting_approval':
			return [
				'Comment awaiting approval',
				comment( 'commented' ),
				` on ${ target.post_type } `,
				commentPost( target.name ),
				' and it is awaiting approval',
			];

		case 'comment__spammed':
			return [
				'Comment spammed',
				'marked ',
				comment( 'a comment' ),
				` as spam on ${ target.post_type } `,
				commentPost( target.name ),
			];

		case 'comment__trashed':
			return [
				'Comment trashed',
				'trashed ',
				comment( 'a comment' ),
				` on ${ target.post_type } `,
				commentPost( target.name ),
			];

		case 'monitor__site_down':
			return [ 'Jetpack monitor', 'site unreachable' ];

		case 'monitor__site_up':
			return [ 'Jetpack monitor', 'site is back online' ];

		case 'post__published':
			return [ 'Post published', post( name ) ];

		case 'post__updated':
			return [ 'Post updated', post( name ) ];

		case 'plugin__activated':
			return [ 'Plugin activated', 'activated plugin ', post( name ) ];

		case 'plugin__autoupdated':
			return [
				'Plugin updated',
				firstPlugin( items[ 0 ].name ),
				` autoupdated to version ${ items[ 0 ].object_version }`,
			];

		case 'plugin__update_available':
			return [
				'Plugin update available',
				firstPlugin( items[ 0 ].name ),
				' plugin has an update available',
			];

		case 'plugin__deleted':
			return [ 'Plugin deleted', plugin( name ) ];

		case 'plugin__installed':
			return [ 'Plugin installed', plugin( name ), ` (${ version }) ` ];

		case 'rewind__backup_complete_full':
			return [ 'Full backup', 'successfully synced' ];

		case 'rewind__complete':
			return [
				'Site restore',
				'successfully restored to ',
				[ 'time', { format: 'LLL', time: ms( object.target_ts ) }, [] ],
			];

		case 'rewind__error':
			return [ 'Site restore', 'failed to restore' ];

		case 'rewind__scan_result_found':
			return [
				'Threat found',
				`(${ object.signature }) found in file `,
				[ 'filepath', {}, object.file ],
			];

		case 'theme__installed':
			return [ 'Theme installed', 'installed theme ', theme( name ) ];

		case 'theme__switched':
			return [ 'Theme switched', 'switched theme to ', theme( name ) ];

		case 'user__deleted':
			return [ 'User removed', person( name ) ];

		case 'user__registered':
			return [ 'User added', person( name ) ];

		case 'user__updated':
			return [ 'User modified', person( name ), ' is now an Administrator ' ];

		default:
			return [ item.name, item.summary ];
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
