module.exports = {
    meta: {
        docs: {
            description: 'Forbids calling `this.allowConsole()`',
            category: 'Best Practices',
            recommended: false,
        },
        fixable: true,
    },

    create: function(context) {
        return {
            MemberExpression: node => {
                const hasError =
                    (node.property.type === 'Identifier' && node.property.name === 'allowConsole') ||
                    (node.object.type === 'Identifier' && node.object.name === 'allowConsole')

                if (!hasError) return

                context.report({
                    node,
                    message: 'allowConsole is forbidden',
                    fix: fixer => fixer.remove(node),
                })
            },
        }
    },
}
