/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender, notFound } from 'controller';
import { navigation, siteSelection } from 'my-sites/controller';
import { setScroll, siteSettings } from 'my-sites/site-settings/settings-controller';
import isJetpackSectionEnabledForSite from 'state/selectors/is-jetpack-section-enabled-for-site';
import { getSelectedSiteId } from 'state/ui/selectors';
import { jetpack } from './controller';

const notFoundIfNotEnabled = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );

	if ( ! showJetpackSection ) {
		return notFound( context, next );
	}

	next();
};

export default function () {
	page(
		'/settings/jetpack/:site_id',
		siteSelection,
		navigation,
		setScroll,
		siteSettings,
		jetpack,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);
}
