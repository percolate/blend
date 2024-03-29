import format from '@commitlint/format'
import lint from '@commitlint/lint'
import load from '@commitlint/load'
import { LintOutcome } from '@commitlint/types'
import { cleanExit, forceExit, git } from '@percolate/cli-utils'
import { readFileSync } from 'fs'
import * as mm from 'micromatch'
import { CommandModule } from 'yargs'

import { PROJECT_CONFIG, SKIP_COVERAGE } from '../constants'
import pMap = require('p-map')
import { join, resolve } from 'path'

import { config } from '../config'
import { root } from '../root'

// no @types
/* eslint-disable import/no-commonjs */
const { bootstrap } = require('commitizen/dist/cli/git-cz')

interface ICommitArgs {
    files?: string[]
}

const COMMIT_CMD = 'commit'
export const commitCmd: CommandModule<{}, ICommitArgs> = {
    command: `${COMMIT_CMD} [files..]`,
    describe: 'Commit message prompter (commitizen)',
    builder: args => {
        return args
            .command({
                command: 'validate',
                describe: 'Validate commit messages of current branch',
                builder: a => a,
                handler: async () => {
                    const commitLintPaths = config.commitLintPaths
                    if (commitLintPaths.length === 0)
                        return console.log(
                            `Add "commitLintPaths" to ${PROJECT_CONFIG} to enable (ex. commitLintPaths: ['**'])`
                        )

                    const commitMessages = git.getCommitMessages(git.getCurrBranch(), config.commitLintPaths)
                    await validate(commitMessages)
                },
            })
            .command({
                aliases: 'pre',
                command: 'preCommit',
                describe: 'Pre-commit hook validation',
                builder: a => a,
                handler: async () => {
                    const commitLintPaths = config.commitLintPaths
                    if (commitLintPaths.length === 0) return

                    const stagedFiles = git.getStagedFiles()
                    const matchLintPaths = stagedFiles.some(stagedFile => {
                        return mm.any(stagedFile, commitLintPaths, { dot: true })
                    })
                    if (!matchLintPaths) return

                    // note: paths.root guarantees .git exists
                    const message = readFileSync(root(join('.git', 'COMMIT_EDITMSG')), 'utf8')
                    await validate([message])
                },
            })
            .command({
                aliases: ['skip', 'coverage'],
                command: 'skipCoverage',
                describe: `Shortcut to commit message ${SKIP_COVERAGE}`,
                builder: a => a,
                handler: () => {
                    git.commit(`chore: ${SKIP_COVERAGE}`, ['--allow-empty'])
                },
            })
            .epilog('https://www.conventionalcommits.org')
    },
    handler: () => {
        // remove the command name so it's not confused for a file
        process.argv = process.argv.filter(arg => arg !== COMMIT_CMD)
        bootstrap({
            cliPath: resolve(require.resolve('commitizen'), join('..', '..')),
            config: { path: 'cz-conventional-changelog' },
        })
    },
}

interface IReport {
    errorCount: number
    results: LintOutcome[]
    valid: boolean
    warningCount: number
}

async function validate(messages: string[]) {
    if (!messages.length) return

    const { rules } = await load({ extends: ['@commitlint/config-conventional'] }).catch(forceExit)
    const results = await pMap(messages, m => lint(m, rules)).catch(forceExit)
    const report = results.reduce(
        (info: IReport, result) => {
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
