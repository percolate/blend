import * as fs from 'fs'
import * as mm from 'micromatch'
import fsReadDirRecursive = require('fs-readdir-recursive')
import { dirname, isAbsolute, posix, resolve, sep } from 'path'

// ensures paths used with mm work cross platform
// https://github.com/micromatch/micromatch#backslashes
export function pathToGlob(path: string) {
    return path.split(sep).join(posix.sep)
}

// https://github.com/substack/node-mkdirp/blob/f2003bbcffa80f8c9744579fabab1212fc84545a/index.js#L55
export function ensureDir(p: string, made?: boolean): boolean {
    if (!made) made = false
    p = resolve(p)

    try {
        fs.mkdirSync(p)
        made = made || !!p
    } catch (err0) {
        switch (err0.code) {
            case 'ENOENT':
                made = ensureDir(dirname(p), made)
                ensureDir(p, made)
                break
            default:
                let stat
                try {
                    stat = fs.statSync(p)
                } catch (err1) {
                    throw err0
                }
                if (!stat.isDirectory()) throw err0
                break
        }
    }

    return made
}

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
        return output.filter(file => mm.isMatch(file, `${pathToGlob(dir)}/**`, { dot: true }))
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
