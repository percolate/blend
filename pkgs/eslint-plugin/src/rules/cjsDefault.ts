const Exports = require('eslint-plugin-import/lib/ExportMap').default
import { Linter, Rule } from 'eslint'

export const cjsDefault: Rule.RuleModule = {
    meta: {
        docs: {
            description: 'Verifies that commonJS `require(...).default` and export default are in sync',
            category: 'Possible Errors',
            recommended: true,
        },
        fixable: 'code',
    },

    create: function (context) {
        return {
            CallExpression: function (node: any) {
                // verify `require()` with one argument
                if (node.callee.name !== 'require' || node.arguments.length !== 1) return null

                // verify require path must be a string with a value
                if (node.arguments[0].type !== 'Literal' || !node.arguments[0].value) return null
                const srcPath = node.arguments[0].value

                // get import source from path
                const imports = Exports.get(srcPath, context)
                if (!imports) return null

                // report parse errors for imported file
                if (imports.errors.length) {
                    const message =
                        `Parse errors in imported module '${srcPath}':` +
                        `${imports.errors
                            .map((e: Linter.LintMessage) => `${e.message} (${e.line}:${e.column})`)
                            .join(', ')}`
                    return context.report({
                        message,
                        node,
                    })
                }

                const exportHasDefault = imports.get('default')
                const requireHasDefault =
                    node.parent.type === 'MemberExpression' && node.parent.property.name === 'default'

                if (exportHasDefault && !requireHasDefault) {
                    context.report({
                        message: 'requiring ES module must reference default',
                        node,
                        fix: function (fixer) {
                            return fixer.insertTextAfter(node, '.default')
                        },
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
