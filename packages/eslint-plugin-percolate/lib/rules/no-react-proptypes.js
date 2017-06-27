const Exports = require("eslint-plugin-import/lib/ExportMap").default
const message = 'React.PropTypes is deprecated. Please import "prop-types" module.'
module.exports = {
    meta: {
        docs: {
            description: "Prevents use of React.PropTypes",
            category: "Possible Errors",
            recommended: true,
        },
        fixable: false,
    },

    create: function(context) {
        return {
            ImportSpecifier: function(node) {
                if (node.imported.name === 'PropTypes') {
                    context.report({
                        node,
                        message,
                    })
                }
            },
            MemberExpression: function (node) {
                if (node.object.name === 'React' && node.property.name === 'PropTypes') {
                    context.report({
                        node,
                        message,
                    })
                }
            }
        }
    },
}
