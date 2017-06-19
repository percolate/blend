# Disallow imports

This rule disallows importing specific modules or specific keys from their export object.

## Rule Details

Examples of **incorrect** code for this rule:

```jsx
/* eslint react-link: ["error", [{ module: 'jquery' }, { module: 'react-router', allowAllExcept: ['Link', 'Redirect'], reason: 'Use /our/router.jsx instead' }]] */


import "jquery" // jquery" is blackedlisted

// { Link, Redirect } from "react-router" is blackedlisted (Use /our/router.jsx instead)
import * as router from "react-router"
import { Router, Route, Link } from "react-router"
import { Link } from "react-router"
```

Examples of **correct** code for this rule:

```jsx
/* eslint react-link: ["error", [{ module: 'react-router', allowAllExcept: ['Link', 'Redirect'], reason: 'Use /our/router.jsx instead' }]] */

import { Router } from "react-router"
import { Router, Route } from "react-router"
```

## Options

This rule supports an array of options, each defining a module to blacklist:

- `module`: The name or path of the module that can't be imported (ex. `react-router`)
- `allowAllExcept`: A list of export keys to blacklist from the `module` import (ex. `['Link']`)
- `reason`: The reason why this module is blacklisted (ex. `Use /our/router.jsx instead`)
