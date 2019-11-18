import { CommandModule } from 'yargs'
import * as mm from 'micromatch'
import { color, fs, forceExit, parallelize, IParallelizeOpts } from '@percolate/cli-utils'
import { root } from '../root'
import { config } from '../config'

interface ILintArgs {
    cache?: boolean
    files?: string[]
    fix?: boolean
    warn?: boolean
}

const PARALLELIZATION: Partial<IParallelizeOpts> = {
    maxChunkSize: 2500, // split large code bases
    maxCpus: 12, // best performance in CI
}

export const lintCmd: CommandModule<{}, ILintArgs> = {
    command: 'lint [files..]',
    describe: 'Apply ESLint and Prettier',
    builder: args => {
        return args
            .command<ILintArgs>({
                builder: a => a,
                command: 'prettier [files..]',
                describe: 'Lint using prettier only',
                handler: async argv => {
                    const exitCode = await prettierHandler(argv)
                    if (exitCode) forceExit('prettier exited with error')
                },
            })
            .command<ILintArgs>({
                builder: a => a,
                command: 'eslint [files..]',
                describe: 'Lint using eslint only',
                handler: async argv => {
                    const exitCode = await eslintHandler(argv)
                    if (exitCode) forceExit('eslint exited with error')
                },
            })
            .option('cache', {
                default: true,
                desc: 'Only check changed files',
                type: 'boolean',
            })
            .option('fix', {
                default: !process.env['CI'],
                desc: 'Disable fixing of errors',
                type: 'boolean',
            })
            .option('warn', {
                desc: 'Display warnings',
                type: 'boolean',
            })
    },
    handler: async argv => {
        const eslintCode = await eslintHandler(argv)
        const prettierCode = await prettierHandler(argv)
        if (prettierCode || eslintCode) {
            const linters = []
            if (prettierCode) linters.push('Prettier')
            if (eslintCode) linters.push('Eslint')
            forceExit(linters.join(', ') + ' linter(s) exited with errors')
        }
    },
}

function getFiles(argv: ILintArgs) {
    return fs.getAbsFilePaths(process.cwd(), {
        cwds: [process.cwd(), root()],
        filterPaths: argv.files,
    })
}

async function eslintHandler(argv: ILintArgs) {
    console.log(color(`eslint: ${config.eslintPattern}`, 'cyan'))
    const cmd = ['npx', 'eslint', '--cache-location', root('tmp/.eslintcache')]
    if (!argv.warn) cmd.push('--quiet')
    if (argv.cache) cmd.push('--cache')
    if (argv.fix) cmd.push('--fix')

    const eslintCode = await parallelize({
        cwd: root(),
        cmd: cmd.join(' '),
        files: getFiles(argv).filter(file => mm.isMatch(file, config.eslintPattern)),
        ...PARALLELIZATION,
    }).catch(forceExit)
    return eslintCode
}

async function prettierHandler(argv: ILintArgs) {
    console.log(color(`prettier: ${config.prettierPattern}`, 'cyan'))
    const outputs: string[] = []
    const prettierCode = await parallelize({
        cwd: root(),
        cmd: ['npx', 'prettier', argv.fix ? '--write' : '--list-different'].join(' '),
        files: getFiles(argv).filter(file => mm.isMatch(file, config.prettierPattern, { dot: true })),
        outputs,
        ...PARALLELIZATION,
    }).catch(forceExit)
    const filteredOutput = outputs.filter(output => !!output)
    if (filteredOutput.length && !argv.fix) {
        console.log('Prettier needs to be run on:')
        console.log(color(filteredOutput.join('\n'), 'red'))
    }
    return prettierCode
}
