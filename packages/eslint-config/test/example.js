const _ = require('lodash')

const MY_CONTSTANT = 'A constant!'

const mySmallNumber = 1
const myLargeNumber = 1e3
const mySmallArray = [1]
const myLargeArray = [
    1,
    2,
]
const mySmallObject = { a: 1 }
const myLargeObject = {
    a: 1,
    b: 2,
}
const myResult = _.chain(myLargeArray)
    .map(function (n) {
        return n * 2
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

    myStaticMethod (n) {
        return myFunction(n)
    },

})

_.extend(MyConstructor.prototype, {

    myMethod () {
        return this.myOwnProperty * 2
    },

})

function myFunction (n) {
    return (n % 2 === 0)
}

if (mySmallNumber) {
    // do something
}


switch (mySmallNumber) {
    case 1:
        break
    case 2:
        break
    default:
        break
}
