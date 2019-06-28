import { Rule } from 'eslint'

const IS_SPEC = /\.spec\.js$/
export const noAsync: Rule.RuleModule = {
    meta: {
        docs: {
            description: 'Prevents the use of async function declaration',
            category: 'Possible Errors',
            recommended: true,
        },
    },

    create: function(context) {
        const verify = function(node: any) {
            if (IS_SPEC.test(context.getFilename())) return
            if (!node.async) return

            context.report({
                node,
                message: 'no async function declaration',
            })
        }

        return {
            FunctionDeclaration: verify,
            FunctionExpression: verify,
        }
    },
}
