import htmlTags from 'html-tags'
import { Rule } from 'eslint'

export const noJsxIdAttrs: Rule.RuleModule = {
    meta: {
        docs: {
            description: 'Prevents "id" attribute on DOM elements in JSX',
            category: 'Possible Errors',
            recommended: true,
        },
    },

    create: function(context) {
        return {
            JSXAttribute: (node: any) => {
                if (node.name.name !== 'id') return
                if (!htmlTags.includes(node.parent.name.name)) return

                context.report({
                    node,
                    message: 'DOM id attribute is not allowed',
                })
            },
        }
    },
}
