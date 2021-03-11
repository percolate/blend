import { cleanExit, execSync } from '@percolate/cli-utils'
import * as fs from 'fs'
import * as path from 'path'

// prevent force exiting of tests
// prevent fetching remote
jest.mock('@percolate/cli-utils', () => {
    const cliUtils2 = jest.requireActual('@percolate/cli-utils')
    return {
        ...cliUtils2,
        cleanExit: jest.fn(),
        forceExit: jest.fn(),
        git: {
            ...cliUtils2.git,
            fetchLatestMaster: () => {},
        },
    }
})

// set the fixture folder as project root
const fixturePath = path.resolve(__dirname, '__fixtures__', 'coverage')
process.chdir(fixturePath)
jest.mock('../../../root.ts', () => ({
    root: (...resolvePaths: string[]) => {
        const path2 = jest.requireActual('path')
        const root = path2.resolve(__dirname, '__fixtures__', 'coverage')
        return resolvePaths.length ? `${path2.resolve(root, ...resolvePaths)}` : root
    },
}))

let mockOutput: string[] = []
console.log = (...args: string[]) => {
    mockOutput.push(args[0])
}

// eslint-disable-next-line import/no-commonjs
const { coverageCmd } = require('../coverage')

const generateLcov = () => execSync(`npx kona test --coverage`)

const branchExists = (branch: string) => {
    let exists: boolean
    exists = !!execSync(`git branch --list ${branch}`, {
        onError: () => {
            exists = false
        },
    })
    return exists
}

const commitChanges = () => {
    execSync('git add -A')
    execSync('git commit -m "changes"')
}

const resetBranches = () => {
    if (!branchExists('feature')) return
    execSync('git checkout master')
    execSync('git branch -D feature')
    execSync('git stash')
}

const removeVersionControl = () => {
    if (!fs.existsSync(`${fixturePath}/.git`)) return
    execSync(`rm -rf ${fixturePath}/.git`)
}

const resetVersionControl = () => {
    removeVersionControl()
    execSync('git init')
    commitChanges()
}

const cmd = async () => {
    const res = await coverageCmd.handler({ silent: true } as any)
    // eslint-disable-next-line no-control-regex
    return res ? res.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '') : res
}

// eslint-disable-next-line no-control-regex
const getOutput = () => mockOutput.join('\n').replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')

beforeAll(() => {
    resetVersionControl()
})

beforeEach(() => {
    mockOutput = []
    resetBranches()
    execSync('git branch feature')
    execSync('git checkout feature')
})

afterEach(() => {
    jest.clearAllMocks()
    resetBranches()
})

afterAll(() => {
    removeVersionControl()
})

it('should not run on master', () => {
    execSync('git checkout master')
    const cleanExitMock = cleanExit as jest.MockedFunction<any>
    cmd()
    expect(cleanExitMock.mock.calls[0][0]).toBe("Skipped: 'master' branch")
})

it('should not report if nothing changes', async () => {
    generateLcov()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should not report deletions', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 + num2
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    commitChanges()
    generateLcov()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should report new lines', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 + num2
export const subtract = (num1: number, num2: number) => num1 - num2
export const math = { add, subtract }
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    commitChanges()
    generateLcov()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should report new functions', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 + num2
export const subtract = (num1: number, num2: number) => num1 - num2
export const divide = (num1: number, num2: number) => num1 / num2
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    commitChanges()
    generateLcov()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should report new branches', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 ? num1 + num2 : num1
export const subtract = (num1: number, num2: number) => num1 - num2
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    commitChanges()
    generateLcov()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should report all three', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 ? num1 + num2 : num1
export const subtract = (num1: number, num2: number) => num1 - num2
export const divide = (num1: number, num2: number) => num1 / num2
export const math = { add, divide, subtract }
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    commitChanges()
    generateLcov()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should report changes across multiple files', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 ? num1 + num2 : num1
export const subtract = (num1: number, num2: number) => num1 - num2
export const divide = (num1: number, num2: number) => num1 / num2
export const math = { add, divide, subtract }
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    execSync(`touch ${fixturePath}/util1.ts`)
    fs.writeFileSync(`${fixturePath}/util1.ts`, changes, 'utf8')
    commitChanges()
    generateLcov()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})
