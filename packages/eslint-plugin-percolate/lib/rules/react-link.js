const PARAM_REGEX = /:\w+/g

module.exports = {
    meta: {
        docs: {
            description: 'Enforce React link',
            category: 'Best Practices',
            recommended: true,
        },
        fixable: false,
        schema: [
            {
                type: 'object',
                required: ['modules'],
                properties: {
                    modules: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'object',
                            required: ['import'],
                            properties: {
                                import: {
                                    type: 'string',
                                    description: 'The name or path your react component',
                                    example: '/path/to/custom/link.jsx',
                                },
                                props: {
                                    type: 'array',
                                    minLength: 1,
                                    required: ['routePropName', 'paramsPropName'],
                                    items: {
                                        type: 'object',
                                        properties: {
                                            routePropName: {
                                                type: 'string',
                                                description: 'Prop name to enforce',
                                                example: 'to',
                                            },
                                            paramsPropName: {
                                                type: 'string',
                                                description: 'Prop name for related params',
                                                example: 'params',
                                            },
                                        },
                                        additionalProperties: false,
                                    },
                                },
                                validate: {
                                    type: 'boolean',
                                    description: 'Whether to validate or not',
                                    default: true,
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                    skipValidationPropName: {
                        type: 'string',
                        description: 'The prop name that bypasses route validation',
                    },
                    routeRegex: {
                        type: 'string',
                        description: 'A regex pattern route props must match',
                    },
                },
                additionalProperties: false,
            },
        ],
    },

    create: function(context) {
        const specifierLookup = {}
        const { modules = [] } = context.options[0] || {}

        return {
            ImportDeclaration: function(node) {
                // ensure options exist
                if (!modules.length) {
                    context.report({
                        node,
                        message:
                            'At least one option is required (ex. { modules: [{ import: "/path/to/link.jsx" }]}',
                    })
                }

                // ignore import without specifiers (ex. `import 'hello'`)
                if (!node.specifiers.length) return

                // ignore if source doesn't match any custom modules
                const matchingModule = modules.find(module => module.import === node.source.value)
                if (!matchingModule) return

                // create specifier lookup
                const firstSpecifier = node.specifiers[0]
                if (firstSpecifier.type === 'ImportDefaultSpecifier') {
                    specifierLookup[firstSpecifier.local.name] = matchingModule
                }
            },
            'JSXElement:exit': function(node) {
                // <a href /> used as a link is forbidden
                if (isLink(context, node)) {
                    return context.report({
                        node,
                        message: `<a href /> can only be used as a button`,
                    })
                }

                validateCustomModule(context, node, specifierLookup)
            },
        }
    },
}

function getOptions(context) {
    return context.options[0] || {}
}

function validateCustomModule(context, node, specifierLookup) {
    const module = specifierLookup[node.openingElement.name.name]

    // ignore if tag doesn't match any import specifier (ex. <div> !== <Link>)
    if (!module) return

    const { props = [] } = module
    const { routeRegex, skipValidationPropName } = getOptions(context)

    const shouldSkipValidation =
        skipValidationPropName &&
        node.openingElement.attributes.some(
            attr => attr.type === 'JSXAttribute' && attr.name.name === skipValidationPropName
        )

    let totalMissingAttrs = 0
    let totalDynRouteAttrs = 0
    props.forEach(({ routePropName, paramsPropName }) => {
        const routeAttr = node.openingElement.attributes.find(
            attr => attr.type === 'JSXAttribute' && attr.name.name === routePropName
        )

        // record missing route prop and exit
        if (!routeAttr) return totalMissingAttrs++

        // route attribute can only be a string (ex. <Link to="/path">)
        if (routeAttr.value.type !== 'Literal') {
            if (!shouldSkipValidation) {
                context.report({
                    node,
                    message: `"${routeAttr.name.name}" property must be a string literal`,
                })
            }
            // the following validation only works on string literals
            return totalDynRouteAttrs++
        }

        // matches route regex
        if (routeRegex && !routeAttr.value.value.match(new RegExp(routeRegex))) {
            context.report({
                node,
                message: `"${routeAttr.value.value}" does not match routeRegex /${routeRegex}/`,
            })
        }

        const matches = (routeAttr.value.value.match(PARAM_REGEX) || []).map(name => name.replace(':', ''))
        const paramsAttr = node.openingElement.attributes.find(
            attr => attr.type === 'JSXAttribute' && attr.name.name === paramsPropName
        )

        // route has no params and no params prop is specified (ex. <Link to="/static/url" />)
        if (!matches.length && !paramsAttr) return

        // route has params (ex. <Link to="/user/:user_id" />)
        if (matches.length && !paramsAttr) {
            return context.report({ node, message: `"${paramsPropName}" prop missing` })
        }

        // params prop is not an object (ex. params={var})
        if (
            paramsAttr.value.type !== 'JSXExpressionContainer' ||
            paramsAttr.value.expression.type !== 'ObjectExpression'
        ) {
            return context.report({
                node,
                message: `"${paramsPropName}" must be an object with keys declared inline`,
            })
        }

        const params = paramsAttr.value.expression.properties.map(prop => prop.key.name)
        matches.forEach(match => {
            if (!params.some(param => param === match)) {
                context.report({ node, message: `"${paramsPropName}" missing "${match}" definition` })
            }
        })
        params.forEach(param => {
            if (!matches.some(match => match === param)) {
                context.report({ node, message: `"${routePropName}" missing "/:${param}" in route` })
            }
        })
    })

    // check that skip validation is needed
    if (totalDynRouteAttrs === 0 && shouldSkipValidation) {
        context.report({ node, message: `"${skipValidationPropName}" prop is not needed` })
    }

    // no route props found
    if (totalMissingAttrs > 0 && totalMissingAttrs === props.length) {
        context.report({
            node,
            message: `missing required prop: ${props.map(prop => `"${prop.routePropName}"`).join(', ')}`,
        })
    }
}

function isLink(context, node) {
    // only applies to <a>
    if (node.openingElement.name.name !== 'a') return

    const href = node.openingElement.attributes.find(
        attr => attr.type === 'JSXAttribute' && attr.name.name === 'href'
    )

    // <a {...props}> missing href with spread is not allowed
    if (!href && node.openingElement.attributes.find(attr => attr.type === 'JSXSpreadAttribute')) {
        context.report({
            node,
            message: 'Unable to determine value of href because of spread',
        })

        // returning true because we're not sure
        return true
    }

    // <a> without href is allowed
    if (!href) return

    // href must be a string and start with "javascript:" or "#"
    if (
        href.value.type === 'Literal' &&
        (href.value.value.indexOf('javascript:') === 0 || href.value.value.indexOf('#') === 0)
    ) {
        return
    }

    return true
}
