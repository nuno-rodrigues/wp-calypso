/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

class FollowingEmptyContent extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_search_on_empty' );
		recordGaEvent( 'Clicked Search on EmptyContent' );
		recordTrack( 'calypso_reader_search_on_empty_stream_clicked' );
	};

	render() {
		const action = (
				<a
					className="empty-content__action button is-primary"
					onClick={ this.recordAction }
					href="/read/search"
				>
					{ this.props.translate( 'Find Sites to Follow' ) }
				</a>
			),
			secondaryAction = null;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<EmptyContent
				className="stream__empty"
				title={ this.props.translate( 'Welcome to Reader' ) }
				line={ this.props.translate( 'Recent posts from sites you follow will appear here.' ) }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration={ '/calypso/images/reader/reader-welcome-illustration.svg' }
				illustrationWidth={ 380 }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( FollowingEmptyContent );
