import { git, execSync, forceExit } from '@percolate/cli-utils'

export const BRANCH_OPT = {
    default: process.env.CIRCLE_BRANCH || git.getCurrBranch(),
    desc: 'Git branch',
    require: true,
    string: true,
}
export const HASH_OPT = {
    default: process.env.CIRCLE_SHA1 || git.getCurrHash(),
    desc: 'Git hash',
    require: true,
}
export const REPO_OPT = {
    default: getRepoName(),
    desc: 'Repository name',
    require: true,
}

function getRepoName() {
    if (process.env.CIRCLE_PROJECT_USERNAME && process.env.CIRCLE_PROJECT_REPONAME) {
        return `${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}`
    }
    const url = execSync('git config --get remote.origin.url')
    const match = url.match(/@github\.com[:/](.*)\.git$/)
    if (!match) return forceExit(`Unable to determine repo from ${url}`)
    return match[1]
}
