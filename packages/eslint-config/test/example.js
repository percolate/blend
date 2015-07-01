var _ = require('lodash')

var MY_CONTSTANT = 'A constant!'

var mySmallNumber = 1
var myLargeNumber = 1e3
var mySmallArray = [ 1 ]
var myLargeArray = [
    1,
    2,
]
var mySmallObject = { a: 1 }
var myLargeObject = {
    a: 1,
    b: 2,
}
var myResult = _.chain(myLargeArray)
    .map(function (n) {
        return n*2
    })
    .filter(myFunction)
    .value()

exports.MY_CONTSTANT = MY_CONTSTANT
exports.mySmallNumber = mySmallNumber
exports.myLargeNumber = myLargeNumber
exports.mySmallArray = mySmallArray
exports.myLargeArray = myLargeArray
exports.mySmallObject = mySmallObject
exports.myLargeObject = myLargeObject
exports.myResult = myResult
exports.MyConstructor = MyConstructor
exports.myInstance = new MyConstructor(1)

function MyConstructor (n) {
    this.myOwnProperty = n
}

_.extend(MyConstructor, {

    myStaticMethod: function (n) {
        return myFunction(n)
    },

})

_.extend(MyConstructor.prototype, {

    myMethod: function () {
        return this.myOwnProperty*2
    },

})

function myFunction (n) {
    return (n%2 === 0)
}
