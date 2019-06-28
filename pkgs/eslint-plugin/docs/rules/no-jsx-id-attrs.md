# Prevents "id" attribute on DOM elements in JSX (no-jsx-id-attrs)

DOM IDs get assigned to window which can potentially create conflicts (ex. `<div id="foo"></div> === window.foo`)

## Rule Details

Examples of **incorrect** code for this rule:

```js
function Foo() {
    return <div id="foo" />
}
```

Examples of **correct** code for this rule:

```js
function Foo() {
    return <MyComponent id="foo" />
}

// custom html tags do not error
function Foo() {
    return <foo id="foo" />
}
```

## When Not To Use It

If you don't care about overlapping DOM IDs.
