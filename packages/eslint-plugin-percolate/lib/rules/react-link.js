const DEFAULT_SKIP_VALIDATION_PROP_NAME = 'dangerouslySetExternalUrl'
const DEFAULT_PATH_PROP_NAMES = ['path']

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
                type: 'array',
                minItems: 1,
                items: {
                    type: 'object',
                    require: ['source'],
                    properties: {
                        source: {
                            type: 'string',
                            description: 'The name or path your react component',
                            example: '/path/to/custom/link.jsx',
                        },
                        routePropNames: {
                            description: 'Prop names to enforce',
                            example: ['from', 'to'],
                            type: 'array',
                            default: DEFAULT_PATH_PROP_NAMES,
                            items: [{ type: 'string' }],
                        },
                        skipValidationPropName: {
                            type: 'string',
                            description: 'The prop name that bypasses path validation',
                            default: DEFAULT_SKIP_VALIDATION_PROP_NAME,
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
    },

    create: function(context) {
        const specifierLookup = {}

        return {
            ImportDeclaration: function(node) {
                const customModules = getOptions(context)

                // ensure options exist
                if (!customModules.length) {
                    context.report({
                        node,
                        message: 'At least one option is required (ex. [{ source: "/path/to/link.jsx" }]',
                    })
                }

                // ignore import without specifiers (ex. `import 'hello'`)
                if (!node.specifiers.length) return

                // ignore if source doesn't match any custom modules
                const matchingModule = customModules.find(module => module.source === node.source.value)
                if (!matchingModule) return

                // create specifier lookup
                const firstSpecifier = node.specifiers[0]
                if (firstSpecifier.type === 'ImportDefaultSpecifier') {
                    specifierLookup[firstSpecifier.local.name] = matchingModule
                }
            },
            'JSXElement:exit': function(node) {
                // <a href="..." used as a link is forbidden
                if (isLink(context, node)) {
                    const sources = getOptions(context).map(module => `"${module.source}"`).join(', ')
                    return context.report({
                        node,
                        message: `<a href="#" /> must be a button otherwise use ${sources}`,
                    })
                }

                validateCustomModule(context, node, specifierLookup)
            },
        }
    },
}

function getOptions(context) {
    return context.options[0] || []
}

function validateCustomModule(context, node, specifierLookup) {
    const module = specifierLookup[node.openingElement.name.name]

    // ignore if tag doesn't match any import specifier (ex. <div> !== <Link>)
    if (!module) return

    const skipValidationAttr = node.openingElement.attributes.find(
        attr =>
            attr.type === 'JSXAttribute' &&
            attr.name.name === (module.skipValidationPropName || DEFAULT_SKIP_VALIDATION_PROP_NAME)
    )

    const routePropNames = module.routePropNames || DEFAULT_PATH_PROP_NAMES
    const pathAttrs = node.openingElement.attributes.filter(
        attr => attr.type === 'JSXAttribute' && routePropNames.some(name => name === attr.name.name)
    )

    if (!pathAttrs.length) {
        return context.report({
            node,
            message: `missing required prop: ${routePropNames.map(name => `"${name}"`).join(', ')}`,
        })
    }

    pathAttrs.forEach(pathAttr => {
        // dangerouslySetExternalUrl is present allow anything
        if (skipValidationAttr) return

        // path attribute can only be a string (ex. <Link path="/path">)
        if (pathAttr.value.type === 'Literal') return

        context.report({
            node,
            message: `"${pathAttr.name.name}" property must be a string literal`,
        })
    })
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
