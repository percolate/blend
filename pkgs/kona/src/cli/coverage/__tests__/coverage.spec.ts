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
    execSync(`mkdir ${fixturePath}/tmp`)
    execSync(`mkdir ${fixturePath}/tmp/reports`)
})

afterEach(() => {
    jest.clearAllMocks()
    resetBranches()
    execSync(`rm -rf ${fixturePath}/tmp`)
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
    const coverage = `
TN:
SF:util.ts
FN:1,(anonymous_0)
FN:2,(anonymous_1)
FNF:2
FNH:1
FNDA:1,(anonymous_0)
FNDA:0,(anonymous_1)
DA:1,1
DA:2,1
LF:2
LH:2
BRF:0
BRH:0
end_of_record    
`
    fs.writeFileSync(`${fixturePath}/tmp/reports/lcov.info`, coverage, 'utf8')
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should not report deletions', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 + num2
`

    const coverage = `
TN:
SF:util.ts
FN:1,(anonymous_0)
FN:2,(anonymous_1)
FNF:2
FNH:1
FNDA:1,(anonymous_0)
FNDA:0,(anonymous_1)
DA:1,1
DA:2,1
LF:2
LH:2
BRF:0
BRH:0
end_of_record    
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    fs.writeFileSync(`${fixturePath}/tmp/reports/lcov.info`, coverage, 'utf8')
    commitChanges()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should report new lines', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 + num2
export const subtract = (num1: number, num2: number) => num1 - num2
export const math = { add, subtract }
`

    const coverage = `
TN:
SF:util.ts
FN:1,(anonymous_0)
FN:2,(anonymous_1)
FNF:2
FNH:1
FNDA:1,(anonymous_0)
FNDA:0,(anonymous_1)
DA:1,1
DA:2,1
LF:2
LH:2
BRF:0
BRH:0
end_of_record    
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    fs.writeFileSync(`${fixturePath}/tmp/reports/lcov.info`, coverage, 'utf8')
    commitChanges()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should report new functions', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 + num2
export const subtract = (num1: number, num2: number) => num1 - num2
export const divide = (num1: number, num2: number) => num1 / num2
`

    const coverage = `
TN:
SF:util.ts
FN:1,(anonymous_0)
FN:2,(anonymous_1)
FN:3,(anonymous_2)
FNF:3
FNH:1
FNDA:1,(anonymous_0)
FNDA:0,(anonymous_1)
FNDA:0,(anonymous_2)
DA:1,1
DA:2,1
DA:3,1
LF:3
LH:3
BRF:0
BRH:0
end_of_record
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    fs.writeFileSync(`${fixturePath}/tmp/reports/lcov.info`, coverage, 'utf8')
    commitChanges()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should report new branches', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 ? num1 + num2 : num1
export const subtract = (num1: number, num2: number) => num1 - num2
`
    const coverage = `
TN:
SF:util.ts
FN:1,(anonymous_0)
FN:2,(anonymous_1)
FNF:2
FNH:1
FNDA:1,(anonymous_0)
FNDA:0,(anonymous_1)
DA:1,1
DA:2,1
LF:2
LH:2
BRDA:1,0,0,1
BRDA:1,0,1,0
BRF:2
BRH:1
end_of_record
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    fs.writeFileSync(`${fixturePath}/tmp/reports/lcov.info`, coverage, 'utf8')
    commitChanges()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should report all three', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 ? num1 + num2 : num1
export const subtract = (num1: number, num2: number) => num1 - num2
export const divide = (num1: number, num2: number) => num1 / num2
export const math = { add, divide, subtract }
`

    const coverage = `
TN:
SF:util.ts
FN:1,(anonymous_0)
FN:2,(anonymous_1)
FN:3,(anonymous_2)
FNF:3
FNH:1
FNDA:1,(anonymous_0)
FNDA:0,(anonymous_1)
FNDA:0,(anonymous_2)
DA:1,1
DA:2,1
DA:3,1
DA:4,1
LF:4
LH:4
BRDA:1,0,0,1
BRDA:1,0,1,0
BRF:2
BRH:1
end_of_record
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    fs.writeFileSync(`${fixturePath}/tmp/reports/lcov.info`, coverage, 'utf8')
    commitChanges()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})

it('should report changes across multiple files', async () => {
    const changes = `export const add = (num1: number, num2: number) => num1 ? num1 + num2 : num1
export const subtract = (num1: number, num2: number) => num1 - num2
export const divide = (num1: number, num2: number) => num1 / num2
export const math = { add, divide, subtract }
`

    const coverage = `
TN:
SF:util.ts
FN:1,(anonymous_0)
FN:2,(anonymous_1)
FN:3,(anonymous_2)
FNF:3
FNH:1
FNDA:1,(anonymous_0)
FNDA:0,(anonymous_1)
FNDA:0,(anonymous_2)
DA:1,1
DA:2,1
DA:3,1
DA:4,1
LF:4
LH:4
BRDA:1,0,0,1
BRDA:1,0,1,0
BRF:2
BRH:1
end_of_record
TN:
SF:util1.ts
FN:1,(anonymous_0)
FN:2,(anonymous_1)
FN:3,(anonymous_2)
FNF:3
FNH:0
FNDA:0,(anonymous_0)
FNDA:0,(anonymous_1)
FNDA:0,(anonymous_2)
DA:1,0
DA:2,0
DA:3,0
DA:4,0
LF:4
LH:0
BRDA:1,0,0,0
BRDA:1,0,1,0
BRF:2
BRH:0
end_of_record
`

    fs.writeFileSync(`${fixturePath}/util.ts`, changes, 'utf8')
    execSync(`touch ${fixturePath}/util1.ts`)
    fs.writeFileSync(`${fixturePath}/util1.ts`, changes, 'utf8')
    fs.writeFileSync(`${fixturePath}/tmp/reports/lcov.info`, coverage, 'utf8')
    commitChanges()
    await cmd()
    expect(getOutput()).toMatchSnapshot()
})
