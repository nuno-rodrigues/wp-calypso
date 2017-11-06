/*eslint-disable*/
/*




Notes:
- inputFocus on Error



 */
/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React, { Component, createElement } from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import has from 'lodash/has';
import get from 'lodash/get';
import deburr from 'lodash/deburr';
import kebabCase from 'lodash/kebabCase';
import pick from 'lodash/pick';
import head from 'lodash/head';
import isEqual from 'lodash/isEqual';
import reduce from 'lodash/reduce';
import camelCase from 'lodash/camelCase';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RegionAddressFieldsets from 'my-sites/domains/components/domain-form-fieldsets/region-address-fieldsets';
import { CountrySelect, StateSelect, Input, HiddenInput } from 'my-sites/domains/components/form';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import FormButton from 'components/forms/form-button';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import { countries } from 'components/phone-input/data';
import { forDomainRegistrations as countriesListForDomainRegistrations } from 'lib/countries-list';
import formState from 'lib/form-state';
import analytics from 'lib/analytics';
import { toIcannFormat } from 'components/phone-input/phone-number';
const countriesList = countriesListForDomainRegistrations();

class ContactDetailsFormFields extends Component {
	/*	static propTypes = {
		fieldValues: PropTypes.shape( {
			firstName: PropTypes.string,
			lastName: PropTypes.string,
			organization: PropTypes.string,
			email: PropTypes.string,
			phone: PropTypes.string,
			address1: PropTypes.string,
			address2: PropTypes.string,
			city: PropTypes.string,
			state: PropTypes.string,
			postalCode: PropTypes.string,
			countryCode: PropTypes.string,
			fax: PropTypes.string,
		} ),
		fieldValues: PropTypes.object.isRequired,
		countriesList: PropTypes.object.isRequired,
		disabled: PropTypes.bool,
		eventFormName: PropTypes.string,
		isFieldInvalid: PropTypes.func,
		onFieldChange: PropTypes.func,
		isFieldDisabled: PropTypes.func,
		getFieldErrorMessages: PropTypes.func,
		className: PropTypes.string,
	};

	static defaultProps = {
		fieldValues: {
			firstName: '',
			lastName: '',
			organization: '',
			email: '',
			phone: '',
			address1: '',
			address2: '',
			city: '',
			state: '',
			postalCode: '',
			countryCode: '',
			fax: '',
		},
		disabled: false,
		eventFormName: '',
		className: '',
		isFieldInvalid: noop,
		getFieldErrorMessages: noop,
		isFieldDisabled: noop,
		onFieldChange: noop,
	};*/

	constructor( props, context ) {
		super( props, context );

		this.state = {
			phoneCountryCode: 'US',
			form: null,
			submissionCount: 0
		};
		this.fieldNames = [
			'firstName',
			'lastName',
			'organization',
			'email',
			'phone',
			'address1',
			'address2',
			'city',
			'state',
			'postalCode',
			'countryCode',
			'fax',
		];
		this.inputRefs = {};
		this.inputRefCallbacks = {};
		this.formStateController = null;
		this.shouldAutoFocusAddressField = false;
	}

	shouldComponentUpdate( nextProps, nextState ) {
		if ( ! isEqual( nextState.form, this.state.form, ) ) {
			return true;
		}
		return false;
	}

	componentWillMount() {
		const { contactDetails } = this.props;
		// eslint-disable-next-line
		console.log( 'componentWillMount ContactDetailsFormFields', contactDetails );

		const initialFields =  pick( this.props.contactDetails, this.fieldNames );

		this.formStateController = formState.Controller( {
			//fieldNames: this.fieldNames,
			initialFields,
			//loadFunction: this.loadFormStateFromProps,
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
		} );
// eslint-disable-next-line
console.log( this.formStateController.getInitialState() );
		this.setState( {
			form: this.formStateController.getInitialState()
		});

	}

	// loadFormStateFromProps = fn => {
	// 	fn( null, pick( this.props.contactDetails, this.fieldNames ) );
	// };

	getMainFieldValues() {
		const mainFieldValues = formState.getAllFieldValues( this.state.form );
		return {
			...mainFieldValues,
			phone: toIcannFormat( mainFieldValues.phone, countries[ this.state.phoneCountryCode ] ),
		};
	}

	setFormState = form => {
		this.setState( { form } );
	};

	handleFormControllerError = error => {
		throw error;
	};

	sanitize = ( fieldValues, onComplete ) => {
		const sanitizedFieldValues = Object.assign( {}, fieldValues );

		this.fieldNames.forEach( fieldName => {
			if ( typeof fieldValues[ fieldName ] === 'string' ) {
				// TODO: Deep
				sanitizedFieldValues[ fieldName ] = deburr( fieldValues[ fieldName ].trim() );
				// TODO: Do this on submit. Is it too annoying?
				if ( fieldName === 'postalCode' ) {
					sanitizedFieldValues[ fieldName ] = sanitizedFieldValues[ fieldName ].toUpperCase();
				}
			}
		} );

		if ( this.props.onSanitize ) {
			this.props.onSanitize( fieldValues, onComplete );
		} else {
			onComplete( sanitizedFieldValues );
		}

	};

	validate = ( fieldValues, onComplete ) => {
		this.props.onValidate( this.getMainFieldValues(), onComplete );
	};

	// We want to cache the functions to avoid triggering unnecessary rerenders
	getRefCallbackProp( name, refAttributeName ) {
		if ( ! this.inputRefCallbacks[ name ] ) {
			this.inputRefCallbacks[ name ] = el => ( this.inputRefs[ name ] = el );
		}
		return {
			[ refAttributeName ]: this.inputRefCallbacks[ name ]
		};
	}


	recordSubmit() {
		const { form } = this.state;
		const errors = formState.getErrorMessages( form );

		const tracksEventObject = formState.getErrorMessages( form ).reduce(
			( result, value, key ) => {
				result[ `error_${ key }` ] = value;
				return result;
			},
			{
				errors_count: ( errors && errors.length ) || 0,
				submission_count: this.state.submissionCount + 1,
			}
		);

		analytics.tracks.recordEvent( 'calypso_contact_information_form_submit', tracksEventObject );
		this.setState( { submissionCount: this.state.submissionCount + 1 } );
	}

	focusFirstError() {
		const { form } = this.state;
		// eslint-disable-next-line
		console.log( ' formState.getInvalidFields( form )',  formState.getInvalidFields( form ) );
		const firstErrorName = head( formState.getInvalidFields( form ) ).name;
		// eslint-disable-next-line
		console.log( 'firstErrorName', firstErrorName, this.inputRefs );
		const firstErrorRef =  this.inputRefs[ firstErrorName ] || null;
		// eslint-disable-next-line
		console.log( 'firstErrorRef', firstErrorRef );
		firstErrorRef && firstErrorRef.focus();
	}

	fieldRefFocusCallback( field ) {
		field && field.focus();
	}

	focusAddressField() {
		const inputRef = this.inputRefs[ 'address1' ] || null;
		
		// eslint-disable-next-line
		console.log( this.inputRefs );

		if ( inputRef ) {
			inputRef.focus();
		} else {
			// The preference is to fire an inputRef callback
			// when the previous and next countryCodes don't match,
			// rather than set a flag.
			// Multiple renders triggered by formState via `this.setFormState`
			// prevent it.
			this.shouldAutoFocusAddressField = true;
		}
	}

	handleSubmitButtonClick = event => {
		event.preventDefault();
		this.formStateController.handleSubmit( hasErrors => {
			this.recordSubmit();
			if ( hasErrors ) {
				//this.focusFirstError();
				return;
			}
			this.props.onSubmit();
		} );
	};

	handleFieldChange = ( event ) => {
		const { name, value } = event.target;
		const { onFieldChange, contactDetails } = this.props;

		if ( name === 'countryCode' ) {

			this.formStateController.handleFieldChange( {
				name: 'state',
				value: '',
				hideError: true,
			} );


			// If the phone number is unavailable, set the phone prefix to the current country
			if ( value && ! contactDetails.phone ) {
				this.setState( {
					phoneCountryCode: value,
				} );
			}
			this.focusAddressField();
		}

		this.formStateController.handleFieldChange( {
			name,
			value,
		} );

		onFieldChange( this.getMainFieldValues() );
	};

	handlePhoneChange = ( { value, countryCode } ) => {
		const { onFieldChange } = this.props;

		this.formStateController.handleFieldChange( {
			name: 'phone',
			value,
		} );

		this.setState( {
			phoneCountryCode: countryCode,
		} );

		onFieldChange( this.getMainFieldValues() );
	};

	getFieldProps = ( name, needsChildRef = false ) => {
		// if we're referencing a DOM object in a child component we need to add the `inputRef` prop
		const ref = this.getRefCallbackProp( name, needsChildRef ? 'inputRef' : 'ref' );
		const { eventFormName } = this.props;
		const { form } = this.state;

		return {
			labelClass: 'contact-details-form-fields__label',
			additionalClasses: 'contact-details-form-fields__field',
			disabled: formState.isFieldDisabled( form, name ),
			isError: formState.isFieldInvalid( form, name ),
			errorMessage: ( formState.getFieldErrorMessages( form, camelCase( name ) ) || [] )
				.join( '\n' ),
			onChange: this.handleFieldChange,
			value: formState.getFieldValue( form, name ) || '',
			name,
			eventFormName,
			...ref,
		}
	};

	createField = ( name, componentClass, additionalProps ) => {
		// const { contactDetails,  eventFormName } = this.props;
		// const { form } = this.state;

		return (
			<div className={ `contact-details-form-fields__container ${ kebabCase( name ) }` }>
				{ createElement(
					componentClass,
					Object.assign(
						{},
						{ ...this.getFieldProps( name ) },
						{ ...additionalProps }
					)
				) }
			</div>
		);
/*		return has( contactDetails, name ) ? (
			<div className={ `contact-details-form-fields__container ${ kebabCase( name ) }` }>
				{ createElement(
					componentClass,
					Object.assign(
						{},
						...this.getFieldProps( name ),
						additionalProps
					)
				) }
			</div>
		) : null;*/
	};

	shouldDisplayAddressFieldset() {
		const { form } = this.state;
		return !! get( form, 'countryCode.value', '' );
	}

	render() {
		const { translate, className, contactDetails } = this.props;
		const countryCode = ( contactDetails || {} ).countryCode;

		const { phoneCountryCode } = this.state;
		// eslint-disable-next-line
		console.log( 'RENDER ME SEYMOUR CONTACT', countryCode );
		return (
			<FormFieldset className={ `contact-details-form-fields ${ className }` }>
				{ this.createField( 'firstName', Input, {
					autoFocus: true,
					label: translate( 'First Name' ),
				} ) }

				{ this.createField( 'lastName', Input, {
					label: translate( 'Last Name' ),
				} ) }

				{ this.createField( 'organization', HiddenInput, {
					label: translate( 'Organization' ),
					text: translate( "+ Add your organization's name" ),
				} ) }

				{ this.createField( 'email', Input, {
					label: translate( 'Email' ),
				} ) }

				{ this.createField( 'fax', Input, {
					label: translate( 'Fax' ),
				} ) }

				{ this.createField( 'phone', FormPhoneMediaInput, {
					label: translate( 'Phone' ),
					onChange: this.handlePhoneChange,
					countriesList,
					countryCode: phoneCountryCode,
				} ) }
				{ this.shouldDisplayAddressFieldset() && (
					<div className="contact-details-form-fields__address-fields">
						{ this.createField( 'address1', Input, {
							maxLength: 40,
							label: translate( 'Address' ),
							//ref: this.shouldAutoFocusAddressField ? this.fieldRefFocusCallback : noop,
						} ) }

						{ this.createField( 'address2', HiddenInput, {
							maxLength: 40,
							label: translate( 'Address Line 2' ),
							text: translate( '+ Add Address Line 2' ),
						} ) }

						{ this.createField( 'city', Input, {
							label: translate( 'City' ),
						} ) }

						{ this.createField( 'state', StateSelect, {
							label: translate( 'State' ),
							countryCode,
						} ) }

						{ this.createField( 'postalCode', Input, {
							label: translate( 'Postal Code' ),
						} ) }
					</div>
				) }
{/*				{ countryCode && (
					<RegionAddressFieldsets
						getFieldProps={ this.getFieldProps }
						countryCode={ countryCode }
						shouldAutoFocusAddressField={ this.shouldAutoFocusAddressField }
					/>
				) }*/}

				{ this.createField( 'countryCode', CountrySelect, {
					label: translate( 'Country' ),
					countriesList,
				} ) }

				{ this.props.children }

				<FormFooter>
					<FormButton
						className="checkout__domain-details-form-submit-button"
						disabled={ false }
						onClick={ this.handleSubmitButtonClick }
					>
						Help
					</FormButton>
					<FormButton
						type="button"
						isPrimary={ false }
						disabled={ false }
						onClick={ noop }
					>
						{ translate( 'Cancel' ) }
					</FormButton>
				</FormFooter>
			</FormFieldset>
		);
	}
}

export default localize( ContactDetailsFormFields );
