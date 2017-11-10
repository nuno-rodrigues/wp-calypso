/** @format */
/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { conversations, conversationsA8c } from './controller';
import config from 'config';
import { initAbTests, preloadReaderBundle, sidebar, updateLastRoute } from 'reader/controller';

export default function() {
	if ( config.isEnabled( 'reader/conversations' ) ) {
		page(
			'/read/conversations',
			preloadReaderBundle,
			updateLastRoute,
			initAbTests,
			sidebar,
			conversations
		);

		page(
			'/read/conversations/a8c',
			preloadReaderBundle,
			updateLastRoute,
			initAbTests,
			sidebar,
			conversationsA8c
		);
	} else {
		page( '/read/conversations', '/' );
		page( '/read/conversations/a8c', '/' );
	}
}
