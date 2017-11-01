/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { identity, noop } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';
import { getHappychatAuth } from 'state/happychat/utils';
import { hasUnreadMessages } from 'state/happychat/selectors';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';
import { initConnection } from 'state/happychat/connection/actions';
import { openChat } from 'state/happychat/ui/actions';
import Button from 'components/button';

export class HappychatButton extends Component {
	static propTypes = {
		allowMobileRedirect: PropTypes.bool,
		borderless: PropTypes.bool,
		getAuth: PropTypes.func,
		isChatActive: PropTypes.bool,
		isChatAvailable: PropTypes.bool,
		isConnectionUninitialized: PropTypes.bool,
		onClick: PropTypes.func,
		onInitConnection: PropTypes.func,
		onOpenChat: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		allowMobileRedirect: false,
		borderless: true,
		getAuth: noop,
		isChatActive: false,
		isChatAvailable: false,
		isConnectionUninitialized: false,
		onClick: noop,
		onInitConnection: noop,
		onOpenChat: noop,
		translate: identity,
	};

	onClick = event => {
		if ( this.props.allowMobileRedirect && viewport.isMobile() ) {
			// For mobile clients, happychat will always use the
			// page componet instead of the sidebar
			page( '/me/chat' );
		} else {
			this.props.onOpenChat();
		}

		this.props.onClick( event );
	};

	componentDidMount() {
		if ( this.props.isConnectionUninitialized ) {
			this.props.onInitConnection( this.props.getAuth() );
		}
	}

	render() {
		const {
			translate,
			children,
			className,
			primary,
			borderless,
			hasUnread,
			isChatAvailable,
			isChatActive,
		} = this.props;
		const showButton = isChatAvailable || isChatActive;
		const classes = classnames( 'happychat__button', className, {
			'has-unread': hasUnread,
		} );

		if ( ! showButton ) {
			return null;
		}

		return (
			<Button
				className={ classes }
				primary={ primary }
				borderless={ borderless }
				onClick={ this.onClick }
				title={ translate( 'Support Chat' ) }
			>
				{ children || <Gridicon icon="chat" /> }
			</Button>
		);
	}
}

export default connect(
	state => ( {
		hasUnread: hasUnreadMessages( state ),
		getAuth: getHappychatAuth( state ),
		isChatAvailable: isHappychatAvailable( state ),
		isChatActive: hasActiveHappychatSession( state ),
		isConnectionUninitialized: isHappychatConnectionUninitialized( state ),
	} ),
	{
		onOpenChat: openChat,
		onInitConnection: initConnection,
	}
)( localize( HappychatButton ) );
