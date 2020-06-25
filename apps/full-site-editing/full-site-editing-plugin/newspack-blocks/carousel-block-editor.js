/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { settings } from './synced-newspack-blocks/blocks/carousel/index';

/**
 * Internal dependencies
 */
import { getCategoryWithFallbacks } from '../block-helpers';

/**
 * Block name in the A8C\FSE context.
 */
const blockName = 'a8c/posts-carousel';

function setBlockTransformationName( name ) {
	return name !== 'newspack-blocks/carousel' ? name : blockName;
}

addFilter(
	'blocks.transforms_from_name',
	'set-transformed-block-name',
	setBlockTransformationName
);

registerBlockType( blockName, {
	...settings,
	category: getCategoryWithFallbacks( 'widgets', 'layout' ),
} );
