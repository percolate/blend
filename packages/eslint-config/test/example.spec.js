import { expect } from 'chai'
import sinon from 'sinon'

describe('the thing', function () {
    var sandbox

    beforeEach(function () {
        sandbox = sinon.sandbox.create()
        sandbox.spy()
        sandbox.stub()
        sandbox.mock()
    })
    afterEach(function () {
        sandbox.resotre()
    })

    it('should do stuff', function () {
        expect(2 * 2).to.equal(4)
        expect(true).to.be.true
    })
})
