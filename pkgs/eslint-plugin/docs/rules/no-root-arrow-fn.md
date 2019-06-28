# Forbids arrow functions in the root

Using arrow functions in the root binds context to the module namespace which adds no value.
It also affects editors "jump to definition" and React displayNames of inline functions.

## Rule Details

Examples of **incorrect** code for this rule:

```js
const MyComponent = () => {}
export const MyComponent = () => {}
exports.MyComponent = () => {}
module.exports = { MyComponent: () => {}, myComp: function() {} }
```

Examples of **correct** code for this rule:

```js
function MyComponent() { return 'hello' }
export function MyComponent() { return 'hello' }
module.exports = function MyComponent() { return 'hello' }
[].forEach(() => {})
```
