import * as api from '../entry'

describe('pkgs/eslint-plugin/src/__tests__/entry.spec.ts', function () {
    it('should export configs', function () {
        expect(api.configs).toBeInstanceOf(Object)
    })

    it('should export rules', function () {
        expect(api.rules).toBeInstanceOf(Object)
    })
})
