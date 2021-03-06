import { resolve } from 'path'

// eslint-disable-next-line import/no-commonjs
const findUp = require('find-up') // outdated @type/find-up

let _root: string
export function root(...resolvePaths: string[]) {
    if (!_root) {
        const gitDir = findUp.sync('.git', { type: 'directory' })
        if (!gitDir) throw new Error('Project must be in a git repo')
        _root = resolve(gitDir, '..')
    }
    return resolvePaths.length ? resolve(_root, ...resolvePaths) : _root
}
