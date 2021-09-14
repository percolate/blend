import { cleanExit, execSync, git } from '@percolate/cli-utils'
import { basename } from 'path'
import { CommandModule } from 'yargs'

import { SENTRY_CLI } from '../constants'
import { getBranch, getRepoName } from '../defaults'

export const sentryCliCmd: CommandModule = {
    command: 'sentry-cli',
    describe: 'sentry-cli proxy with master gating and project injection',
    builder: args => {
        return args.strict(false).help(false).version(false)
    },
    handler: () => {
        if (!git.isMaster(getBranch())) return cleanExit('sentry-cli only runs on master')

        execSync([SENTRY_CLI, ...process.argv.slice(3)].join(' '), {
            env: {
                SENTRY_PROJECT: basename(getRepoName()),
                ...process.env,
            },
            verbose: true,
        })
    },
}
