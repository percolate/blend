import { Rule } from 'eslint'

const message = 'React.PropTypes is deprecated. Please import "prop-types" module.'
export const noReactPropTypes: Rule.RuleModule = {
    meta: {
        deprecated: true,
        docs: {
            description: 'Prevents use of React.PropTypes',
            category: 'Possible Errors',
            recommended: true,
        },
    },

    create: function (context) {
        return {
            ImportSpecifier: (node: any) => {
                if (node.imported.name === 'PropTypes') {
                    context.report({
                        node,
                        message,
                    })
                }
            },
            MemberExpression: (node: any) => {
                if (node.object.name === 'React' && node.property.name === 'PropTypes') {
                    context.report({
                        node,
                        message,
                    })
                }
            },
        }
    },
}
