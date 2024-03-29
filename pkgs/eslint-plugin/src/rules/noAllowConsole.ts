import { Rule } from 'eslint'

export const noAllowConsole: Rule.RuleModule = {
    meta: {
        docs: {
            description: 'Forbids calling `this.allowConsole()`',
            category: 'Best Practices',
            recommended: false,
        },
    },

    create: function (context) {
        return {
            MemberExpression: (node: any) => {
                const hasError =
                    (node.property.type === 'Identifier' && node.property.name === 'allowConsole') ||
                    (node.object.type === 'Identifier' && node.object.name === 'allowConsole')

                if (!hasError) return

                context.report({
                    node,
                    message: 'Console output should be handled or mocked',
                })
            },
        }
    },
}
