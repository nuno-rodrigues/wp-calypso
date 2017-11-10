/**
 * /* eslint-disable no-console
 *
 * @format
 */

let warn;

/* eslint-disable no-console */
if ( process.env.NODE_ENV === 'production' ) {
	warn = () => {};
} else {
	warn = ( ...args ) => console.warn( ...args );
}

export default warn;
