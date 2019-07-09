import { execSync } from './execSync'

export function getCurrBranch() {
    return execSync('git rev-parse --abbrev-ref HEAD')
}

export function getCurrHash() {
    return execSync('git rev-parse HEAD')
}

export function fetchLatestMaster() {
    // --force in case the local master is out of sync/conflicts with remote
    return execSync('git fetch origin master:master --force --quiet -n')
}

export function getLastCommitMsg() {
    return execSync('git log -1 --pretty=%B')
}

const SEPARATOR = '__PRCLT_SEPARATOR__'
export function getCommitMessages(branch: string, filterPaths: string[]) {
    let cmd = `git log ${branch} --not origin/master --no-merges --format="format:%B${SEPARATOR}"`
    if (filterPaths && filterPaths.length) {
        cmd += ` -- ${filterPaths.join(' ')}`
    }
    return execSync(cmd)
        .split(SEPARATOR)
        .filter(message => !!message)
        .map(message => message.trimLeft())
}

export function getStagedFiles() {
    return execSync('git diff --name-only --cached')
        .split('\n')
        .filter(file => !!file)
}

export function isMaster(branch = getCurrBranch()) {
    return branch === 'master'
}

export function isLatestHash(hash: string, branch: string) {
    const latestHash = execSync(`git fetch --quiet -n > /dev/null && git show-ref origin/${branch} --hash`)
    return hash === latestHash
}

export function commit(message: string, flags: string[] = []) {
    return execSync(`git commit ${[`--message ${JSON.stringify(message)}`, ...flags].join(' ')}`)
}
