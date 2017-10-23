/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';
import route from '../reducer';

describe( 'reducer', () => {
	it( 'should set the current route to the value of the path attribute of the ROUTE_SET action', () => {
		const state = route( undefined, {
			type: ROUTE_SET,
			path: '/themes',
		} );

		expect( state ).to.be.eql( '/themes' );
	} );
} );
