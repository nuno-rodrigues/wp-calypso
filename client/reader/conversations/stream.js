/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import ConversationsIntro from './intro';
import ConversationsEmptyContent from 'blocks/conversations/empty';
import DocumentHead from 'components/data/document-head';
import Stream from 'reader/stream';

export default function( props ) {
	const isInternal = get( props, 'store.id' ) === 'conversations-a8c';
	const emptyContent = <ConversationsEmptyContent />;
	const intro = <ConversationsIntro isInternal={ isInternal } />;
	return (
		<Stream
			postsStore={ props.store }
			key="conversations"
			shouldCombineCards={ false }
			className="conversations__stream"
			followSource="conversations"
			useCompactCards={ true }
			trackScrollPage={ props.trackScrollPage }
			emptyContent={ emptyContent }
			intro={ intro }
		>
			<DocumentHead title={ props.title } />
		</Stream>
	);
}
