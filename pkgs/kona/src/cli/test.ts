import { CommandModule, Options } from 'yargs'
import * as jest from 'jest-cli/build/cli/args'
import * as _ from 'lodash'
import { execSync, fs, getMaxCpus } from '@percolate/cli-utils'
import { resolve } from 'path'
import { BIN_DIR } from '../constants'
import { root } from '../root'

type JestKey = keyof typeof jest.options

const JEST_CONFIG = 'jest.config.js'
const PROXIED_JEST_ARGS: JestKey[] = [
    'all',
    'changedFilesWithAncestor',
    'changedSince',
    'coverage',
    'debug',
    'onlyChanged',
    'runInBand',
    'updateSnapshot',
    'verbose',
    'watch',
    'watchAll',
]

export const testCmd: CommandModule = {
    command: 'test [TestPathPattern]',
    describe: 'Jest (simplified)',
    builder: args => {
        const options: { [key: string]: Options } = {}
        _.each(jest.options, (opt, key: JestKey) => {
            options[key] = {
                ...opt,
                hidden: !PROXIED_JEST_ARGS.includes(key),
            }
        })
        return args
            .options({
                ...options,
                config: {
                    ...options.config,
                    // remove 'c' alias
                    alias: undefined,
                },
                watchAll: {
                    ...options.watchAll,
                    // -c legacy support
                    alias: 'c',
                },
            })
            .showHidden('jest', "Show all of Jest's options")
            .implies('jest', 'help')
            .epilog(jest.docs)
    },
    handler: () => {
        const jestArgv = process.argv.slice(3).map(arg => (arg === '-c' ? '--watchAll' : arg))
        if (process.env['CI']) jestArgv.push(...['--ci', '--maxWorkers', getMaxCpus().toString()])

        // Jest must be run alongside jest.config.js (and .babelrc)
        // This breaks monorepos with a single jest.config.js in the root when run inside pkgs/*
        const cwdConfig = resolve(process.cwd(), JEST_CONFIG)
        const cwd = fs.isFile(cwdConfig) ? undefined : root()

        execSync(`${resolve(BIN_DIR, 'jest')} ${jestArgv.join(' ')}`, {
            cwd,
            verbose: true,
        })
    },
}
