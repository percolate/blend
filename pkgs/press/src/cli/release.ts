import { CommandModule } from 'yargs'
import { BRANCH_OPT, REPO_OPT, HASH_OPT } from './options'
import { execSync, git, cleanExit } from '@percolate/cli-utils'
import { basename, resolve } from 'path'

interface IReleaseOpts {
    branch: string
    repo: string
    version: string
}

const SENTRY_CLI = resolve(__dirname, '../../node_modules/.bin/sentry-cli')

export const releaseCmd: CommandModule<{}, IReleaseOpts> = {
    command: 'release',
    describe: 'Creates a Sentry release',
    builder: argv => {
        return argv
            .version(false)
            .option('branch', BRANCH_OPT)
            .option('version', { ...HASH_OPT, desc: 'Release version' })
            .option('repo', REPO_OPT)
    },
    handler: argv => {
        const { branch, repo, version } = argv

        if (!git.isMaster(branch)) return cleanExit('releases only run on master')

        const project = basename(repo)
        execSync(`${SENTRY_CLI} releases --project ${project} set-commits "${version}" --auto`, {
            verbose: true,
        })
    },
}
