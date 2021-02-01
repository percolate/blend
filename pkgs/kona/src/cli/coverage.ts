import { cleanExit, color, execSync, forceExit, git } from '@percolate/cli-utils'
import { resolve } from 'path'
import { CommandModule } from 'yargs'

import { config } from '../config'
import { BIN_DIR, SKIP_COVERAGE } from '../constants'
import { root } from '../root'

const COVERAGE_THRESHOLD = 90
const BRANCH_COVERAGE = 80
const LCOV = 'lcov*.info'

interface ICoverageOpts {
    dir?: string
}

export const coverageCmd: CommandModule<{}, ICoverageOpts> = {
    command: 'coverage',
    describe: `Check diff coverage (bypass with "${SKIP_COVERAGE}" in latest commit message)`,
    builder: args => {
        return args.option('dir', {
            desc: 'Check diff against changes in specific directory',
            type: 'string',
        })
    },
    handler: argv => {
        if (git.isMaster()) return cleanExit("Skipped: 'master' branch")

        console.log('Fetching latest master...')
        git.fetchLatestMaster()

        console.log('Computing coverage on diff...')
        const cmd = [
            `git diff master...${git.getCurrBranch()}`,
            '|',
            resolve(BIN_DIR, 'diff-test-coverage'),
            `--coverage='${root(config.coverageDir, LCOV)}'`,
            '--type=lcov',
            `--line-coverage=${COVERAGE_THRESHOLD}`,
            `--branch-coverage=${BRANCH_COVERAGE}`,
            `--function-coverage=${COVERAGE_THRESHOLD}`,
            '--color=true',
            '--log-template=full',
            ...(argv.dir ? [`--diff-filter="${resolve(argv.dir, '**')}"`] : []),
            '--',
        ].join(' ')
        execSync(cmd, {
            onError: e => {
                if (git.getLastCommitMsg().includes(SKIP_COVERAGE)) {
                    return console.log(color(`${SKIP_COVERAGE} found: reporting without failure\n`, 'yellow'))
                }
                return forceExit(e)
            },
            verbose: true,
        })
    },
}
