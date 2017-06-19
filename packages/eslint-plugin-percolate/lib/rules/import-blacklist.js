module.exports = {
    meta: {
        docs: {
            description: 'Disallow imports',
            category: 'Best Practices',
        },
        schema: [
            {
                type: 'array',
                minItems: 1,
                items: {
                    type: 'object',
                    requires: ['module'],
                    properties: {
                        module: {
                            type: 'string',
                            description: "The name or path of the module that can't be imported",
                            example: 'react-router',
                        },
                        allowAllExcept: {
                            description: 'Specifies a list of export keys that are blacklisted',
                            type: 'array',
                            items: {
                                type: 'string',
                                description: 'Blacklist specific keys',
                                example: 'Link',
                            },
                        },
                        reason: {
                            type: 'string',
                            description: 'The reason why ',
                            example: 'Replaced with "/path/to/link.jsx"',
                        },
                    },
                },
            },
        ],
    },

    create: function(context) {
        return {
            ImportDeclaration: function(node) {
                const options = context.options[0] || []

                if (!options.length) {
                    return context.report({
                        node,
                        message: 'At least one option is required (ex. [{ module: "jquery" }]',
                    })
                }

                options.forEach(opt => {
                    const { module, allowAllExcept = [], reason } = opt

                    // ignore if import source doesn't match module
                    if (module !== node.source.value) return

                    // ignore when none of the specifiers match the allowAllExcept
                    if (
                        allowAllExcept.length &&
                        node.specifiers.length &&
                        node.specifiers.every(
                            specifier =>
                                specifier.type === 'ImportSpecifier' &&
                                !allowAllExcept.some(exportName => exportName === specifier.imported.name)
                        )
                    ) {
                        return
                    }

                    const message = []
                        .concat(
                            allowAllExcept.length
                                ? `{ ${allowAllExcept.join(', ')} } from "${module}" is blackedlisted`
                                : `"${module}" is blackedlisted`,
                            reason ? `(${reason})` : []
                        )
                        .join(' ')

                    context.report({ node, message })
                })
            },
        }
    },
}
