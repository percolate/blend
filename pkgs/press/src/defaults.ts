import { git, execSync, forceExit } from '@percolate/cli-utils'

export function getBranch() {
    if (process.env.GITHUB_ACTIONS && process.env.GITHUB_REF) {
        // GITHUB_REF=refs/heads/branch_name
        const ref = process.env.GITHUB_REF
        const match = ref.match(/refs\/heads\/(.*)$/)
        if (!match) return forceExit(`Unable to determine branch name in ${ref}`)
        return match[1]
    }
    return process.env.CIRCLE_BRANCH || git.getCurrBranch()
}

export function getHash() {
    if (process.env.GITHUB_ACTIONS && process.env.GITHUB_SHA) {
        return process.env.GITHUB_SHA
    }
    return process.env.CIRCLE_SHA1 || git.getCurrHash()
}

export function getRepoName() {
    if (process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY) {
        return process.env.GITHUB_REPOSITORY
    }
    if (process.env.CIRCLE_PROJECT_USERNAME && process.env.CIRCLE_PROJECT_REPONAME) {
        return `${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}`
    }
    const url = execSync('git config --get remote.origin.url')
    const match = url.match(/@github\.com[:/](.*)\.git$/)
    if (!match) return forceExit(`Unable to determine repo from ${url}`)
    return match[1]
}
