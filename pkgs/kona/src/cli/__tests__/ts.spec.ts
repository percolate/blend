import * as childProcess from 'child_process'
import * as path from 'path'

jest.mock('child_process', () => ({
    spawn: jest.fn(() => ({
        on: (e: string, cb: (code: number, abortSignal: string) => void) => cb(1, ''),
    })),
}))

// prevent force exiting of tests
jest.mock('@percolate/cli-utils', () => {
    const cliUtils2 = jest.requireActual('@percolate/cli-utils')
    return {
        ...cliUtils2,
        forceExit: jest.fn(),
    }
})

// set the fixture folder as project root
process.chdir(path.resolve(__dirname, '__fixtures__'))
jest.mock('../../root.ts', () => ({
    root: (...resolvePaths: string[]) => {
        const path2 = jest.requireActual('path')
        const root = path2.resolve(__dirname, '__fixtures__')
        return resolvePaths.length ? `${path2.resolve(root, ...resolvePaths)}` : root
    },
}))

// silence console
console.log = jest.fn()

// need to require so that cwd is changed before tsCmd tries to find configs
// eslint-disable-next-line import/no-commonjs
const { tsCmd } = require('../ts')

afterEach(() => {
    jest.clearAllMocks()
})

it('should run all tsconfigs found matching pattern', async () => {
    await tsCmd.handler({} as any)
    const spawn = childProcess.spawn as jest.MockedFunction<any>
    expect(spawn).toHaveBeenCalledTimes(2)
    expect(
        spawn.mock.calls[0][1][2].includes('pkgs/kona/src/cli/__tests__/__fixtures__/pkg1/tsconfig.json')
    ).toBe(true)
    expect(
        spawn.mock.calls[1][1][2].includes('pkgs/kona/src/cli/__tests__/__fixtures__/pkg2/tsconfig.json')
    ).toBe(true)
})

it('should filter tsconfigs when passed a dir path', async () => {
    await tsCmd.handler({ path: ['pkg1/'] } as any)
    const spawn = childProcess.spawn as jest.MockedFunction<any>
    expect(spawn).toHaveBeenCalledTimes(1)
    expect(
        spawn.mock.calls[0][1][2].includes('pkgs/kona/src/cli/__tests__/__fixtures__/pkg1/tsconfig.json')
    ).toBe(true)
})

it('should use specified tsconfig when passed a filepath', async () => {
    await tsCmd.handler({ path: ['tsconfig.custom.json'] } as any)
    const spawn = childProcess.spawn as jest.MockedFunction<any>
    expect(spawn).toHaveBeenCalledTimes(1)
    expect(
        spawn.mock.calls[0][1][2].includes('pkgs/kona/src/cli/__tests__/__fixtures__/tsconfig.custom.json')
    ).toBe(true)
})
