import { Rule } from 'eslint'

export const noRootArrowFn: Rule.RuleModule = {
    meta: {
        docs: {
            description: 'No arrow functions in root',
            category: 'Best Practices',
            recommended: true,
        },
    },

    create: function (context) {
        const verify = (parentNode: any, node: any) => {
            if (node.type === 'ArrowFunctionExpression') {
                context.report({
                    node: parentNode,
                    message: 'No arrow functions in root',
                })
            }
        }

        const verifyVariableDeclaration = (parentNode: any, node: any) => {
            if (
                node.declarations[0] &&
                node.declarations[0].type === 'VariableDeclarator' &&
                node.declarations[0].init
            ) {
                verify(parentNode, node.declarations[0].init)
            }
        }

        return {
            ExportNamedDeclaration: (node: any) => {
                if (node.parent.type !== 'Program') return
                if (!node.declaration) return
                if (node.declaration.type !== 'VariableDeclaration') return
                verifyVariableDeclaration(node, node.declaration)
            },
            ExpressionStatement: (node: any) => {
                if (node.parent.type !== 'Program') return
                if (node.expression.type !== 'AssignmentExpression') return
                if (node.expression.right.type === 'ObjectExpression') {
                    node.expression.right.properties.forEach((n: any) => {
                        if (n.type === 'Property') verify(n, n.value)
                    })
                } else {
                    verify(node, node.expression.right)
                }
            },
            VariableDeclaration: (node: any) => {
                if (node.parent.type !== 'Program') return
                verifyVariableDeclaration(node, node)
            },
        }
    },
}
