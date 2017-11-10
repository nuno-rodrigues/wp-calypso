/** @format */
/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getRewindBackups } from 'state/activity-log/actions';

class QueryRewindBackups extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	componentWillMount() {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.getRewindBackups( siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, {
	getRewindBackups,
} )( QueryRewindBackups );
