# Enforce React link

This rule enforces the use a React link component over `<a href="..." />` links. `<a>` tags can still be used as buttons only if `href` is missing or starts with the following: "javascript:", "#".

It also enforces that route prop values are passed as string literals (ex. `to="/my/path"`).
Routes params must match `/:\w+/` and be converted by your component (ex. `<Link to="/user/:user_id" params={ user_id: 1 } />` routes to "/user/1").

Repeating static routes isn't DRY but there are good reasons for doing it:

- Routes are unique by nature which makes them greppable
- Routes are expressive which makes the code easier to reason about when displayed inline
- String literals can be statically analyzed

## Rule Details

Examples of **incorrect** code for this rule:

```jsx
/* eslint react-link: ["error", { modules: [{ import: '/mylink.jsx', props: [{ routePropName: 'to', paramsPropName: 'params' }]}], routeRegex: '^/.*$' }] */

<a {...props}>link</a>          // Unable to determine value of href because of spread
<a href={url}>link</a>          // <a href="#" /> must be a button otherwise use "/mylink.jsx"
<a href="/foo">link</a>         // <a href="#" /> must be a button otherwise use "/mylink.jsx"
<a href="mailto:...">link</a>   // <a href="#" /> must be a button otherwise use "/mylink.jsx"

import mylink from "/mylink.jsx"

<mylink to={url} />               // "to" property must be a string literal
<mylink {...props} />             // missing required prop: "to", "from"
<mylink to="relative_path" />     // "relative_path" does not match routeRegex /^/.*$/

<mylink to="/:foo" />                               // "params" prop missing
<mylink to="/:foo" params={params} />             // "params" must be an object with keys declared inline
<mylink to="/:foo" params={{ bar: 'bar' }} />     // "params" missing "foo" definition, "to" missing "/:bar" in route
```

Examples of **correct** code for this rule:

```jsx
/* eslint react-link: ["error", { modules: [{ import: '/mylink.jsx', props: [{ routePropName: 'to', paramsPropName: 'params' }]}], routeRegex: '^/.*$' }] */

<a>button</a>
<a onClick={function () {}}>button</a>
<a href="javascript:void(0)">button</a>
<a href="javascript:void(0)" data-id="button">button</a>
<a href="#">link</a>

import mylink from "/mylink.jsx"

<mylink to={`mailto:${email}`} dangerouslySetExternalUrl />
<mylink to="/to" />
<mlyink to="/to" {...props} />
<mylink to="/to/:foo/:bar" params={{ foo: 'foo', bar: 'bar' }} />

```

## Options

This rule supports an object with the following properties:

- `modules`: An array of objects defining your link components
    - `import`: The name or file path of your component (ex. `path/to/link.jsx`)
    - `props`: An array of objects defining route props and params [default: `[{ routePropName: 'to', paramsPropName: 'params' }]`]
        - `routePropName`: Prop names to enforce static route (ex. `"to"`)
        - `paramsPropName`: Prop name for related params (ex. `"params"`)
    - `skipValidationPropName`: The prop name that bypasses static analysis of route [default: `dangerouslySetExternalUrl`]
- `routeRegex`: A regex pattern route props must match (optional)
