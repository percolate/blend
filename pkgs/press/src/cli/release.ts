import { CommandModule } from 'yargs'
import { execSync, git, cleanExit } from '@percolate/cli-utils'
import { basename } from 'path'
import { getHash, getBranch, getRepoName } from '../defaults'
import { SENTRY_CLI } from '../constants'

interface IReleaseOpts {
    branch: string
    project: string
    version: string
}

export const releaseCmd: CommandModule<{}, IReleaseOpts> = {
    command: 'release',
    describe: 'Create and finalize a Sentry release',
    builder: argv => {
        return argv
            .version(false)
            .option('branch', {
                default: getBranch(),
                desc: 'Git branch',
                require: true,
            })
            .option('version', {
                default: getHash(),
                desc: 'Release version',
                require: true,
            })
            .option('project', {
                default: basename(getRepoName()),
                desc: 'Repository name',
                require: true,
            })
    },
    handler: argv => {
        const { branch, project, version } = argv

        if (!git.isMaster(branch)) return cleanExit('releases only run on master')

        execSync(`${SENTRY_CLI} releases --project ${project} set-commits "${version}" --auto`, {
            verbose: true,
        })
        execSync(`${SENTRY_CLI} releases --project ${project} finalize "${version}"`, {
            verbose: true,
        })
    },
}
