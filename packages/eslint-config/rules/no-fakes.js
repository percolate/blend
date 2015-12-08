module.exports = function (context) {
    var fakeFunctions = [
        'spy',
        'stub',
        'mock',
    ]

    function matchesSinon (object) {
        return object && object.name === 'sinon'
    }

    function isFake (property) {
        return property && fakeFunctions.indexOf(property.name) > -1
    }

    function isCallToSpyOnSinon (callee) {
        return callee.type === 'MemberExpression' &&
           matchesSinon(callee.object) &&
           isFake(callee.property)
    }

    function createAutofixFunction (callee) {
        var rangeToReplace = callee.object.range

        return function useSinonSandbox (fixer) {
            return fixer.replaceText({ range: rangeToReplace }, "this.sandbox");
        }
    }

    return {
        CallExpression: function (node) {
            var callee = node.callee

            if (callee && isCallToSpyOnSinon(callee)) {
                context.report({
                    node: callee.property,
                    message: 'Unexpected use of sinon fakes. Please use sandbox instead.',
                    fix: createAutofixFunction(callee),
                })
            }
        }
    }
}
