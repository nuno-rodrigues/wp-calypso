Query Backups
===========================

`QueryRewindBackups` is a React component which dispatches actions for querying the backups available for download.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryRewindBackups from 'components/data/query-rewind-backups';

export default function MyComponent( props ) {
	return (
		<div>
			<QueryRewindBackups siteId={ siteId } />
		</div>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which terms should be requested.

