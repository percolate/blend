const { basename, dirname, join, relative } = require('path')

module.exports = {
    meta: {
        docs: {
            description: 'Enforces a test suite name matches the filename',
            category: 'Best Practices',
            recommended: true,
        },
        fixable: true,
        schema: [
            {
                type: 'object',
                required: ['basePaths'],
                properties: {
                    basePaths: {
                        description: 'An array of basePaths',
                        type: 'array',
                        minItems: 1,
                        Items: {
                            type: 'string',
                        },
                    },
                },
            },
        ],
    },

    create: function(context) {
        const { basePaths = ['/'] } = context.options[0] || {}
        return {
            ExpressionStatement: node => {
                if (node.expression.type !== 'CallExpression') return
                if (node.expression.callee.name !== 'describe') return
                if (node.expression.arguments.length < 1) return

                const ancestors = context.getAncestors()
                if (ancestors[ancestors.length - 1].type !== 'Program') return

                const filename = context.getFilename()
                const basePath = basePaths.find(path => filename.indexOf(path) === 0)
                const relativePath = basePath
                    ? relative(basePath, join(dirname(filename), basename(filename)))
                    : null
                const suiteName = node.expression.arguments[0]
                if (suiteName.type === 'Literal' && relativePath === suiteName.value) {
                    return
                }

                context.report({
                    node: node.expression.arguments[0],
                    message: 'The suit name must match the filename',
                    fix: fixer => fixer.replaceText(suiteName, `'${relativePath}'`),
                })
            },
        }
    },
}
