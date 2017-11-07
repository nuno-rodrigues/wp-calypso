/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import { getSelectedDomain } from 'lib/domains';
import Header from 'my-sites/domains/domain-management/components/header';
import IcannVerificationCard from 'my-sites/domains/domain-management/components/icann-verification/icann-verification-card';
import { localize } from 'i18n-calypso';
import Main from 'components/main';
import MaintenanceCard from 'my-sites/domains/domain-management/components/domain/maintenance-card';
import MappedDomain from './mapped-domain';
import paths from 'my-sites/domains/paths';
import RegisteredDomain from './registered-domain';
import { registrar as registrarNames } from 'lib/domains/constants';
import SiteRedirect from './site-redirect';
import Transfer from './transfer';
import { transferStatus } from 'lib/domains/constants';
import { type as domainTypes } from 'lib/domains/constants';
import WpcomDomain from './wpcom-domain';

class Edit extends React.Component {
	render() {
		const domain = this.props.domains && getSelectedDomain( this.props ),
			Details = this.getDetailsForType( domain && domain.type );

		if ( ! domain || ! Details ) {
			return <DomainMainPlaceholder goBack={ this.goToDomainManagement } />;
		}

		return (
			<Main className="domain-management-edit">
				<Header
					onClick={ this.goToDomainManagement }
					selectedDomainName={ this.props.selectedDomainName }
				>
					{ this.props.translate( 'Domain Settings' ) }
				</Header>
				{ this.renderEmailNotice() }
				{ this.renderDetails( domain, Details ) }
			</Main>
		);
	}

	renderEmailNotice = () => {
		const domain = this.props.domains && getSelectedDomain( this.props );
		const isPendingVerification =
			transferStatus.PENDING_OWNER === ( domain && domain.transferStatus );

		if ( ! isPendingVerification ) {
			return null;
		}

		return (
			<div>
				<IcannVerificationCard
					hideAddressChangeButton={ true }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSiteSlug={ this.props.selectedSite.slug }
				/>
			</div>
		);
	};

	getDetailsForType = type => {
		switch ( type ) {
			case domainTypes.MAPPED:
				return MappedDomain;

			case domainTypes.REGISTERED:
				return RegisteredDomain;

			case domainTypes.SITE_REDIRECT:
				return SiteRedirect;

			case domainTypes.TRANSFER:
				return Transfer;

			case domainTypes.WPCOM:
				return WpcomDomain;

			default:
				return null;
		}
	};

	renderDetails = ( domain, Details ) => {
		const { MAINTENANCE } = registrarNames;

		if ( domain.type === domainTypes.REGISTERED && domain.registrar === MAINTENANCE ) {
			return <MaintenanceCard { ...this.props } />;
		}

		return (
			<Details
				domain={ domain }
				selectedSite={ this.props.selectedSite }
				settingPrimaryDomain={ this.props.domains.settingPrimaryDomain }
			/>
		);
	};

	goToDomainManagement = () => {
		page( paths.domainManagementList( this.props.selectedSite.slug ) );
	};
}

export default localize( Edit );
