/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const getDayOfWeekString = date => {
	const today = moment().startOf( 'day' );
	const dayOffset = today.diff( date.startOf( 'day' ), 'days' );

	switch ( dayOffset ) {
		case 0:
			return 'Today';
		case -1:
			return 'Tomorrow';
	}
	return date.format( 'dddd' );
};

class CalendarStep extends Component {
	static propTypes = {
		date: PropTypes.string.isRequired,
		onSubmit: PropTypes.func.isRequired,
		options: PropTypes.array.isRequired,
	};

	renderHeader = () => {
		const date = moment( this.props.date );

		return (
			<div className="concierge__calendar-card-header">
				<Gridicon icon="calendar" className="concierge__calendar-card-header-icon" />
				<span>
					<b>{ getDayOfWeekString( date ) } —</b> { date.format( ' MMMM D' ) }
				</span>
			</div>
		);
	};

	render() {
		const { options } = this.props;

		return (
			<FoldableCard
				className="concierge__calendar-card"
				clickableHeader={ ! isEmpty( options ) }
				compact
				disabled={ isEmpty( options ) }
				summary={ isEmpty( options ) ? 'No sessions available' : null }
				header={ this.renderHeader() }
			>
				<form>
					<FormFieldset>
						<FormLabel htmlFor="concierge-start-time">Choose a starting time</FormLabel>
						<FormSelect id="concierge-start-time">
							{ options.map( time => (
								<option value={ time } key={ time }>
									{ time }
								</option>
							) ) }
						</FormSelect>
						<FormSettingExplanation>Sessions are 30 minutes long.</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<Button primary onClick={ this.props.onSubmit }>
							Book this session
						</Button>
					</FormFieldset>
				</form>
			</FoldableCard>
		);
	}
}

export default CalendarStep;
