# Enforce React link

This rule enforces the use a React link components instead of `<a href="..." />`. `<a>` tags can still be used as buttons only if `href` is missing or starts with "javascript:" or "#".

It validates that route prop values are passed as string literals (ex. `to="/my/path"`) and optionally match a `routeRegex`.
Parameters inside routes (aka dynamic routes) are identified by `/^:(.*$)/` (anything that starts with a colon between two `/`) and be handled by your link components (ex. `<Link to="/user/:user_id" params={ user_id: 1 } />` routes to "/user/1"). Route params can optionally match a `paramRegex`

Repeating static routes isn't DRY but there are good reasons for doing it:

- Routes are unique by nature which makes them greppable
- Routes are expressive which makes the code easier to reason about when displayed inline
- String literals can be statically analyzed

## Rule Details

Examples of **incorrect** code for this rule:

```jsx
/* eslint react-link: ["error", { modules: [{ import: '/mylink.jsx', props: [{ routePropName: 'to', paramsPropName: 'params' }]}], routeRegex: '^/.*$', skipValidationPropName: 'dangerouslySetRoute' }] */

<a {...props}>link</a>          // Unable to determine value of href because of spread
<a href={url}>link</a>          // <a href /> can only be used as a button
<a href="/foo">link</a>         // <a href /> can only be used as a button
<a href="mailto:...">link</a>   // <a href /> can only be used as a button

import mylink from "/mylink.jsx"

<mylink to={url} />               // "to" property must be a string literal
<mylink {...props} />             // missing required prop: "to", "from"
<mylink to="relative_path" />     // "relative_path" does not match routeRegex /^/.*$/
<mylink to="/foo" dangerouslySetRoute />         // "dangerouslySetRoute" prop is not needed

<mylink to="/:foo" />                             // "params" prop missing
<mylink to="/:foo" params={params} />             // "params" must be an object with keys declared inline
<mylink to="/:foo" params={{ bar: 'bar' }} />     // "params" missing "foo" definition, "to" missing "/:bar" in route
```

Examples of **correct** code for this rule:

```jsx
/* eslint react-link: ["error", { modules: [{ import: '/mylink.jsx', props: [{ routePropName: 'to', paramsPropName: 'params' }]}], routeRegex: '^/.*$', skipValidationPropName: 'dangerouslySetRoute' }] */

<a>button</a>
<a onClick={function () {}}>button</a>
<a href="javascript:void(0)">button</a>
<a href="javascript:void(0)" data-id="button">button</a>
<a href="#">link</a>

import mylink from "/mylink.jsx"

<mylink to={url} dangerouslySetRoute />
<mylink to="/to" />
<mlyink to="/to" {...props} />
<mylink to="/to/:foo/:bar" params={{ foo: 'foo', bar: 'bar' }} />
```

## Options

This rule supports an object with the following properties:

- `modules`: An array of objects defining your link components
    - `import`: The name or filepath of your component which replaces links (ex. `path/to/link.jsx`)
    - `props`: When present, this array of objects will define which props to run static route analysis on
        - `routePropName`: The route prop name (ex. `"to"`)
        - `paramsPropName`: Prop name for route params defined as key/value pairs (ex. `"params"`)
- `routeRegex`: When present, this enforces that all routes match a specific pattern
- `paramRegex`: When present, this enforces that all route params match a specific pattern
- `skipValidationPropName`: When present, this prop bypasses static route analysis
