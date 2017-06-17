# Enforce React link

This rule enforces the use a React link component over `<a href="..." />` links.

It also enforces that route props are declared with static values (ex. `path="/my/path"`). Dynamic routes should be handled by your component (ex. `<Link path="/user/:user_id" params={ user_id: 1 } />` routes to "/user/1").

Repeating static routes isn't DRY but there are good reasons for doing it:

- Routes are unique by nature which makes them greppable
- Routes are expressive which makes the code easier to reason about when displayed inline
- String literals are enforceable while variables or route manifests are not (ex. `<link path="/static/url" />` vs `<Link path={constantUrlFromManifest} />` or `<Link path={arbitraryComputedUrl} />`)

`<a>` tags can still be used as buttons only if `href` is missing or starts with the following: "javascript:", "#".

## Rule Details

Examples of **incorrect** code for this rule:

```jsx
/* eslint react-link: ["error", [{ source: '/mylink.jsx', routePropNames: ['to', 'from'], skipValidationPropName: 'dangerouslySetExternalUrl'}]] */

<a {...props}>link</a>          // Unable to determine value of href because of spread
<a href={url}>link</a>          // <a href="#" /> must be a button otherwise use "/mylink.jsx"
<a href="/foo">link</a>         // <a href="#" /> must be a button otherwise use "/mylink.jsx"
<a href="mailto:...">link</a>   // <a href="#" /> must be a button otherwise use "/mylink.jsx"


import mylink from "/mylink.jsx"

<mylink to={url} />               // "to" property must be a string literal
<mylink {...props} />             // missing required prop: "to", "from"
<mylink to="/from" from={to} />   // "from" property must be a string literal
```

Examples of **correct** code for this rule:

```jsx
/* eslint react-link: ["error", [{ source: '/mylink.jsx', routePropNames: ['to', 'from'], skipValidationPropName: 'dangerouslySetExternalUrl'}]] */

<a>button</a>
<a onClick={function () {}}>button</a>
<a href="javascript:void(0)">button</a>
<a href="javascript:void(0)" data-id="button">button</a>
<a href="#">link</a>

import mylink from "/mylink.jsx"

<mylink to={`mailto:${email}`} dangerouslySetExternalUrl />
<mylink to="/to" />
<mylink to="/to" from="/from" />
<mlyink to="/to" {...props} />
<mylink to="/to" from="/from" {...props} />

```

## Options

This rule supports an array of options, each defining your React component:

- `source`: The name or file path of your react component (ex. `/path/to/link.jsx`)
- `routePropNames`: Prop names to enforce static routes [default: `['path']`]
- `skipValidationPropName`: The prop name that bypasses static route validation [default: `dangerouslySetExternalUrl`]
