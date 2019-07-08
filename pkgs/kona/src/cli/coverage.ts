import { CommandModule } from 'yargs'
import { SKIP_COVERAGE, BIN_DIR } from '../constants'
import { forceExit } from '../utils/forceExit'
import { getCurrBranch, isMaster, getLastCommitMsg, fetchLatestMaster } from '../utils/git'
import { cleanExit } from '../utils/cleanExit'
import { execSync } from '../utils/execSync'
import { resolve } from 'path'
import { color } from '../utils/color'
import { config } from '../config'
import { root } from '../root'

const COVERAGE_THRESHOLD = 90
const BRANCH_COVERAGE = 80
const LCOV = 'lcov.info'

interface ICoverageOpts {
    dir?: string
}

export const coverageCmd: CommandModule<{}, ICoverageOpts> = {
    command: 'coverage',
    describe: 'Report test coverage on git diff',
    builder: args => {
        return args
            .option('dir', {
                desc: 'Check diff against changes in specific directory',
                type: 'string',
            })
            .epilog(`Include "${SKIP_COVERAGE}" in the latest commit message to bypass`)
    },
    handler: argv => {
        if (isMaster()) return cleanExit("Skipped: 'master' branch")

        console.log('Fetching latest master...')
        fetchLatestMaster()

        console.log('Computing coverage on diff...')
        const cmd = [
            `git diff master...${getCurrBranch()}`,
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
                if (getLastCommitMsg().includes(SKIP_COVERAGE)) {
                    return console.log(color(`${SKIP_COVERAGE} found: reporting without failure\n`, 'yellow'))
                }
                return forceExit(e)
            },
            verbose: true,
        })
    },
}
