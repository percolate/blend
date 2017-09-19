const BLACKLIST = ['promiseRespond', 'respondTo', 'promiseRespondTo', 'respond']

module.exports = {
    meta: {
        docs: {
            description: 'Sinon fake server rules',
            category: 'Best Practices',
            recommended: false,
        },
        fixable: true,
    },

    create: function(context) {
        return {
            CallExpression: node => {
                let calleeName
                if (
                    node.callee.type === 'MemberExpression' &&
                    (calleeName = BLACKLIST.find(name => node.callee.property.name === name)) &&
                    ((node.callee.object.type === 'Identifier' && node.callee.object.name === 'fakeServer') ||
                        (node.callee.object.type === 'MemberExpression' &&
                            node.callee.object.property.name === 'fakeServer'))
                ) {
                    context.report({
                        node,
                        message:
                            calleeName === 'respond'
                                ? 'fakeServer.respond is no longer synchronous'
                                : `fakeServer.${calleeName}() is deprecated in favor of respondWith`,
                    })
                }
            },
            AssignmentExpression: node => {
                if (node.left.type === 'MemberExpression' && node.left.property.name === 'autoRespond') {
                    const isTrue = node.right.type === 'Literal' && node.right.value === true
                    context.report({
                        node,
                        message: isTrue
                            ? 'fakeServer.autoRespond is on by default'
                            : 'should always be true because fakeServer.respond() is no longer async',
                        fix: isTrue
                            ? fixer => {
                                  const ancestors = context.getAncestors()
                                  return fixer.remove(ancestors[ancestors.length - 1])
                              }
                            : undefined,
                    })
                }
            },
        }
    },
}
