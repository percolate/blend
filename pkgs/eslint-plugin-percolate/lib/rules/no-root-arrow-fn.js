module.exports = {
    meta: {
        docs: {
            description: 'No arrow functions in root',
            category: 'Best Practices',
            recommended: true,
        },
    },

    create: function(context) {
        const verify = (parentNode, node) => {
            if (node.type === 'ArrowFunctionExpression') {
                context.report({
                    node: parentNode,
                    message: 'No arrow functions in root',
                })
            }
        }

        const verifyVariableDeclaration = (parentNode, node) => {
            if (
                node.declarations[0] &&
                node.declarations[0].type === 'VariableDeclarator' &&
                node.declarations[0].init
            ) {
                verify(parentNode, node.declarations[0].init)
            }
        }

        return {
            ExportNamedDeclaration: node => {
                if (node.parent.type !== 'Program') return
                if (!node.declaration) return
                if (node.declaration.type !== 'VariableDeclaration') return
                verifyVariableDeclaration(node, node.declaration)
            },
            ExpressionStatement: node => {
                if (node.parent.type !== 'Program') return
                if (node.expression.type !== 'AssignmentExpression') return
                if (node.expression.right.type === 'ObjectExpression') {
                    node.expression.right.properties.forEach(node => {
                        if (node.type === 'Property') verify(node, node.value)
                    })
                } else {
                    verify(node, node.expression.right)
                }
            },
            VariableDeclaration: node => {
                if (node.parent.type !== 'Program') return
                verifyVariableDeclaration(node, node)
            },
        }
    },
}
