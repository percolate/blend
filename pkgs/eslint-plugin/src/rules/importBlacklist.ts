import { Rule } from 'eslint'

interface IOptions {
    allowAllExcept?: string[]
    import: string
    reason?: string
}

export const importBlacklist: Rule.RuleModule = {
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
                    requires: ['import'],
                    properties: {
                        import: {
                            type: 'string',
                            description: "The import name or path of the module that can't be imported",
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
            ImportDeclaration: function(node: any) {
                const options: IOptions[] = context.options[0] || []

                if (!options.length) {
                    return context.report({
                        node,
                        message: 'At least one option is required (ex. [{ import: "jquery" }]',
                    })
                }

                options.forEach(module => {
                    const { allowAllExcept = [], reason } = module

                    // ignore if import source doesn't match module
                    if (module.import !== node.source.value) return

                    // ignore when none of the specifiers match the allowAllExcept
                    if (
                        allowAllExcept.length &&
                        node.specifiers.length &&
                        node.specifiers.every(
                            (specifier: any) =>
                                specifier.type === 'ImportSpecifier' &&
                                !allowAllExcept.some(exportName => exportName === specifier.imported.name)
                        )
                    ) {
                        return
                    }

                    const message = [
                        allowAllExcept.length
                            ? `{ ${allowAllExcept.join(', ')} } from "${module.import}" is blackedlisted`
                            : `"${module.import}" is blackedlisted`,
                        ...(reason ? [`(${reason})`] : []),
                    ].join(' ')

                    context.report({ node, message })
                })
            },
        }
    },
}
