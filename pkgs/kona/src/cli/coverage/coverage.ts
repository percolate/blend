import { cleanExit, color, execSync, forceExit, git } from '@percolate/cli-utils'
import { resolve } from 'path'
import { CommandModule } from 'yargs'

import { config } from '../../config'
import { SKIP_COVERAGE } from '../../constants'
import { root } from '../../root'
import { IRunOpts, run } from './application'
import { report } from './console_reporter'

const COVERAGE_THRESHOLD = 90
const BRANCH_COVERAGE = 80
const LCOV = 'lcov*.info'

interface ICoverageOpts {
    dir?: string
    silent?: boolean
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
    handler: async argv => {
        if (git.isMaster()) return cleanExit("Skipped: 'master' branch")

        console.log('Fetching latest master...')
        git.fetchLatestMaster()

        console.log('Computing coverage on diff...')

        const options: IRunOpts = {
            coverageReports: {
                baseDir: root(),
                globs: [root(config.coverageDir, LCOV)],
                types: ['lcov'],
            },
            diff: {
                text: execSync(`git diff master...${git.getCurrBranch()}`),
                baseDir: root(),
                filterGlobs: argv.dir ? [resolve(argv.dir, '**')] : [],
            },
            coverageThresholds: {
                lines: COVERAGE_THRESHOLD,
                branches: BRANCH_COVERAGE,
                functions: COVERAGE_THRESHOLD,
            },
            consoleReport: {
                baseDir: root(),
                templates: ['full'],
            },
        }

        try {
            const { additionsByFile, coverageByFile, totals } = await run(options)

            console.log(report({ coverageByFile, additionsByFile, totals, options }))

            if (
                totals.lines.percentage < options.coverageThresholds.lines ||
                totals.branches.percentage < options.coverageThresholds.branches ||
                totals.functions.percentage < options.coverageThresholds.functions
            ) {
                if (git.getLastCommitMsg().includes(SKIP_COVERAGE)) {
                    return console.log(color(`${SKIP_COVERAGE} found: reporting without failure\n`, 'yellow'))
                }

                return forceExit()
            }
        } catch (error) {
            console.log(color(`An unexpected error occurred: ${error.stack}`, 'red'))
            return forceExit()
        }
    },
}
