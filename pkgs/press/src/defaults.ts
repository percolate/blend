import { git, execSync, forceExit } from '@percolate/cli-utils'

export function getBranch() {
    return process.env.CIRCLE_BRANCH || git.getCurrBranch()
}

export function getHash() {
    return process.env.CIRCLE_SHA1 || git.getCurrHash()
}

export function getRepoName() {
    if (process.env.CIRCLE_PROJECT_USERNAME && process.env.CIRCLE_PROJECT_REPONAME) {
        return `${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}`
    }
    const url = execSync('git config --get remote.origin.url')
    const match = url.match(/@github\.com[:/](.*)\.git$/)
    if (!match) return forceExit(`Unable to determine repo from ${url}`)
    return match[1]
}
