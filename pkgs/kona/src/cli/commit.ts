import { CommandModule } from 'yargs'
import { SKIP_COVERAGE } from '../constants'
import { forceExit } from '../utils/forceExit'
import { getStagedFiles, getCurrBranch, getCommitMessages, commit } from '../utils/git'
import * as mm from 'micromatch'
import { readFileSync } from 'fs'
import format from '@commitlint/format'
import Bluebird from 'bluebird'
import { cleanExit } from '../utils/cleanExit'
import { config } from '../config'
import { root } from '../root'

// no @types
/* eslint-disable import/no-commonjs */
const lint = require('@commitlint/lint')
const load = require('@commitlint/load')
const { bootstrap } = require('commitizen/dist/cli/git-cz')

export const commitCmd: CommandModule = {
    command: 'commit',
    describe: 'Commit message',
    builder: args => {
        return args
            .command({
                command: 'validate',
                describe: 'Validate commit messages of current branch',
                builder: a => a,
                handler: async () => {
                    const commitMessages = getCommitMessages(getCurrBranch(), config.commitLintPaths)
                    await validate(commitMessages)
                },
            })
            .command({
                command: 'pre-commit',
                describe: 'Pre-commit hook validation',
                builder: a => a,
                handler: async () => {
                    const commitLintPaths = config.commitLintPaths
                    console.log(commitLintPaths)
                    if (commitLintPaths.length === 0) return

                    const stagedFiles = getStagedFiles()
                    const matchLintPaths = stagedFiles.some(stagedFile => {
                        return mm.any(stagedFile, commitLintPaths, { dot: true })
                    })
                    if (!matchLintPaths) return

                    // note: paths.root guarantees .git exists
                    const message = readFileSync(root('.git/COMMIT_EDITMSG'), 'utf8')
                    await validate([message])
                },
            })
            .command({
                command: 'skip-coverage',
                describe: `Shortcut to commit message ${SKIP_COVERAGE}`,
                builder: a => a,
                handler: () => {
                    commit(`chore: ${SKIP_COVERAGE}`, ['--allow-empty'])
                },
            })
            .epilog('https://www.conventionalcommits.org')
    },
    handler: () => {
        bootstrap({
            cliPath: root(),
            config: { path: 'cz-conventional-changelog' },
        })
    },
}

async function validate(messages: string[]) {
    if (!messages.length) return

    const { rules } = await load({ extends: ['@commitlint/config-conventional'] }).catch(forceExit)
    const results = await Bluebird.map(messages, m => lint(m, rules)).catch(forceExit)
    const report = results.reduce(
        (info, result) => {
            info.errorCount += result.errors.length
            info.results.push(result)
            info.valid = result.valid ? info.valid : false
            info.warningCount += result.warnings.length

            return info
        },
        {
            errorCount: 0,
            results: [],
            valid: true,
            warningCount: 0,
        }
    )

    console.log(format(report, { color: true }))
    return report.valid ? cleanExit() : forceExit()
}

export default module
