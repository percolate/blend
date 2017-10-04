const IS_SPEC = /\.spec\.js$/
module.exports = {
    meta: {
        docs: {
            description: 'Prevents the use of async function declaration',
            category: 'Possible Errors',
            recommended: true,
        },
    },

    create: function(context) {
        const verify = function(node) {
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
