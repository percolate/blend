const Exports = require('eslint-plugin-import/lib/ExportMap').default

module.exports = {
    meta: {
        docs: {
            description: 'Verifies that commonJS `require(...).default` and export default are in sync',
            category: 'Possible Errors',
            recommended: true,
        },
        fixable: true,
    },

    create: function (context) {
        return {
            CallExpression: function (node) {
                // verify `require()` with one argument
                if (node.callee.name !== 'require' || node.arguments.length !== 1) return null

                // verify require path must be a string with a value
                if (node.arguments[0].type !== 'Literal' || !node.arguments[0].value) return null
                var srcPath = node.arguments[0].value

                // get import source from path
                var imports = Exports.get(srcPath, context)
                if (!imports) return null

                // report parse errors for imported file
                if (imports.errors.length) {
                    var message = `Parse errors in imported module '${srcPath}':` +
                        `${imports.errors
                            .map(e => `${e.message} (${e.lineNumber}:${e.column})`)
                            .join(', ')}`
                    return context.report({
                        message,
                        node,
                    })
                }

                var exportHasDefault = imports.get('default')
                var requireHasDefault = node.parent.type === 'MemberExpression'
                    && node.parent.property.name === 'default'

                if (exportHasDefault && !requireHasDefault) {
                    context.report({
                        message: 'requiring ES module must reference default',
                        node,
                        fix: function (fixer) {
                            return fixer.insertTextAfter(node, '.default')
                        }
                    })
                } else if (requireHasDefault && !exportHasDefault) {
                    context.report({
                        message: 'No default export found in module.',
                        node,
                    })
                }
            },
        }
    },
}
