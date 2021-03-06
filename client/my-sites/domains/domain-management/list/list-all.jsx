/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { keyBy, keys, times } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import config from 'config';
import { Button } from '@automattic/components';
import canCurrentUserForSites from 'state/selectors/can-current-user-for-sites';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { domainAddNew } from 'my-sites/domains/paths';
import DocumentHead from 'components/data/document-head';
import DomainItem from './domain-item';
import ListHeader from './list-header';
import FormattedHeader from 'components/formatted-header';
import { getAllDomains, getFlatDomainsList } from 'state/sites/domains/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { getCurrentRoute } from 'state/selectors/get-current-route';
import { getDomainManagementPath } from './utils';
import getVisibleSites from 'state/selectors/get-visible-sites';
import isRequestingAllDomains from 'state/selectors/is-requesting-all-domains';
import ListItemPlaceholder from './item-placeholder';
import Main from 'components/main';
import { type as domainTypes } from 'lib/domains/constants';
import QueryAllDomains from 'components/data/query-all-domains';
import QuerySiteDomains from 'components/data/query-site-domains';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { emailManagement } from 'my-sites/email/paths';

/**
 * Style dependencies
 */
import './list-all.scss';

class ListAll extends Component {
	static propTypes = {
		canManageSitesMap: PropTypes.object.isRequired,
		currentRoute: PropTypes.string.isRequired,
		domainsList: PropTypes.array.isRequired,
		sites: PropTypes.object.isRequired,
		user: PropTypes.object.isRequired,
		addDomainClick: PropTypes.func.isRequired,
	};

	clickAddDomain = () => {
		this.props.addDomainClick();
		page( domainAddNew( '' ) );
	};

	handleDomainItemClick = ( domain ) => {
		const { sites, currentRoute } = this.props;
		const site = sites[ domain.blogId ];
		page( getDomainManagementPath( domain.domain, domain.type, site.slug, currentRoute ) );
	};

	handleAddEmailClick = ( domain ) => {
		const { sites, currentRoute } = this.props;
		const site = sites[ domain.blogId ];
		page( emailManagement( site.slug, domain.domain, currentRoute ) );
	};

	headerButtons() {
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			return null;
		}

		return (
			<Button primary compact className="list-all__add-a-domain" onClick={ this.clickAddDomain }>
				{ this.props.translate( 'Add a domain' ) }
			</Button>
		);
	}

	isLoading() {
		const { domainsList, requestingDomains, sites } = this.props;
		return ! sites || ( requestingDomains && domainsList.length === 0 );
	}

	findDomainDetails( domainsDetails = [], domain = {} ) {
		return domainsDetails[ domain?.blogId ]?.find(
			( element ) => element.type === domain.type && element.domain === domain.domain
		);
	}

	renderDomainsList() {
		if ( this.isLoading() ) {
			return times( 3, ( n ) => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}

		const { domainsList, sites, domainsDetails, canManageSitesMap } = this.props;

		const domainListItems = domainsList
			.filter(
				( domain ) => domain.type !== domainTypes.WPCOM && canManageSitesMap[ domain.blogId ]
			) // filter on sites we can manage, that aren't `wpcom` type
			.map( ( domain, index ) => (
				<React.Fragment key={ `${ index }-${ domain.name }` }>
					{ domain?.blogId && <QuerySiteDomains siteId={ domain.blogId } /> }
					<DomainItem
						domain={ domain }
						domainDetails={ this.findDomainDetails( domainsDetails, domain ) }
						site={ sites[ domain?.blogId ] }
						isManagingAllSites={ true }
						showSite={ true }
						onClick={ this.handleDomainItemClick }
						onAddEmailClick={ this.handleAddEmailClick }
					/>
				</React.Fragment>
			) );

		return [ <ListHeader key="list-header" />, ...domainListItems ];
	}

	render() {
		const { translate } = this.props;

		return (
			<Main wideLayout>
				<div className="list-all__heading">
					<FormattedHeader brandFont headerText={ translate( 'All Domains' ) } align="left" />
					<div className="list-all__heading-buttons">{ this.headerButtons() }</div>
				</div>
				<div className="list-all__container">
					<QueryAllDomains />
					<Main wideLayout>
						<SidebarNavigation />
						<DocumentHead title={ translate( 'Domains', { context: 'A navigation label.' } ) } />
						<div className="list-all__items">{ this.renderDomainsList() }</div>
					</Main>
				</div>
			</Main>
		);
	}
}

const addDomainClick = () =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Management', 'Clicked "Add Domain" Button in ListAll' ),
		recordTracksEvent( 'calypso_domain_management_list_all_add_domain_click' )
	);

export default connect(
	( state ) => {
		const sites = keyBy( getVisibleSites( state ), 'ID' );
		return {
			canManageSitesMap: canCurrentUserForSites( state, keys( sites ), 'manage_options' ),
			currentRoute: getCurrentRoute( state ),
			domainsList: getFlatDomainsList( state ),
			domainsDetails: getAllDomains( state ),
			requestingDomains: isRequestingAllDomains( state ),
			sites,
			user: getCurrentUser( state ),
		};
	},
	( dispatch ) => {
		return { addDomainClick: () => dispatch( addDomainClick() ) };
	}
)( localize( ListAll ) );
