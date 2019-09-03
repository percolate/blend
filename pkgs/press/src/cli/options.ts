import { git, execSync } from '@percolate/cli-utils'

export const BRANCH_OPT = {
    default: process.env['CIRCLE_BRANCH'] || git.getCurrBranch(),
    desc: 'Git branch',
    require: true,
    string: true,
}
export const HASH_OPT = {
    default: process.env['CIRCLE_SHA1'] || git.getCurrHash(),
    desc: 'Git hash',
    require: true,
}
export const REPO_OPT = {
    default: execSync('git rev-parse --show-toplevel').replace(/^\//, ''),
    desc: 'Repository name',
    require: true,
}
