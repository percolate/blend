import * as mm from 'micromatch'
import * as fs from 'fs'
import fsReadDirRecursive = require('fs-readdir-recursive')
import { resolve, isAbsolute } from 'path'

export function isFile(path: string): boolean {
    try {
        return fs.statSync(path).isFile()
    } catch (e) {
        return false
    }
}

export function isDir(path: string): boolean {
    try {
        return fs.statSync(path).isDirectory()
    } catch (e) {
        return false
    }
}

export function getAbsFilePaths(dir: string, opts: { filterPaths?: string[]; cwds?: string[] } = {}) {
    const { cwds = [process.cwd()], filterPaths = [] } = opts
    if (filterPaths && filterPaths.length) {
        const output: string[] = []

        filterPaths.forEach(path => {
            const absPaths = isAbsolute(path) ? [path] : cwds.map(cwd => resolve(cwd, path))

            // iterate until we find a path that exists
            absPaths.some(absPath => {
                try {
                    const stats = fs.statSync(absPath)
                    if (stats.isDirectory()) {
                        output.push(...readDir(absPath).map(file => resolve(absPath, file)))
                        return true
                    } else if (stats.isFile()) {
                        output.push(absPath)
                        return true
                    }
                } catch (e) {
                    /* not found */
                }
                return false
            })
        })
        return output.filter(file => mm.isMatch(file, `${dir}/**`, { dot: true }))
    }

    return readDir(dir).map(file => resolve(dir, file))
}

export function readDir(root: string): string[] {
    return fsReadDirRecursive(
        root,
        (file: string) =>
            file === '.github' ||
            file === '.circleci' ||
            file === '.prettierrc' ||
            !(file[0] === '.' || file === 'node_modules' || file === 'tmp')
    )
}
