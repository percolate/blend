import { CommandModule } from 'yargs'
import { SKIP_COVERAGE, BIN_DIR, COVERAGE_PATH } from '../constants'
import { forceExit } from '../utils/forceExit'
import { getCurrBranch, isMaster, getLastCommitMsg, fetchLatestMaster } from '../utils/git'
import { cleanExit } from '../utils/cleanExit'
import { execSync } from '../utils/execSync'
import { resolve } from 'path'
import { color } from '../utils/color'

const COVERAGE_THRESHOLD = 90
const BRANCH_COVERAGE = 80
const LCOV = 'lcov.info'

export const coverageCmd: CommandModule = {
    command: 'coverage',
    describe: 'Report test coverage on git diff',
    builder: args => {
        return args.epilog(`Include "${SKIP_COVERAGE}" in the latest commit message to bypass`)
    },
    handler: () => {
        if (isMaster()) return cleanExit("Skipped: 'master' branch")

        console.log('Fetching latest master...')
        fetchLatestMaster()

        console.log('Computing coverage on diff...')
        const cmd = [
            `git diff master...${getCurrBranch()}`,
            '|',
            resolve(BIN_DIR, 'diff-test-coverage'),
            `--coverage='${resolve(COVERAGE_PATH, LCOV)}'`,
            '--type=lcov',
            `--line-coverage=${COVERAGE_THRESHOLD}`,
            `--branch-coverage=${BRANCH_COVERAGE}`,
            `--function-coverage=${COVERAGE_THRESHOLD}`,
            '--color=true',
            '--log-template=full',
            `--diff-filter="${process.cwd()}/**"`,
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
