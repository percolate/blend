import * as fastGlob from 'fast-glob'
import * as lcov from 'lcov-parse'
import * as path from 'path'

interface IParseGlobsOpts {
    baseDir?: string
    filter?: (item: lcov.LcovResults) => boolean
    globOptions?: fastGlob.Options
    pathMode?: string
    type?: string
    parser?: string
}

export async function parseDiffs(globs: string[], options: IParseGlobsOpts) {
    const files = (await fastGlob(globs, { absolute: true, ...options.globOptions })) as string[]
    return parseFiles(files, options)
}

async function parseFiles(files: string[], options: IParseGlobsOpts) {
    const filesResults = await Promise.all(files.map(file => parseFile(file, options)))
    return filesResults.reduce((arr, file) => arr.concat(file), [])
}

async function parseFile(file: string, options: IParseGlobsOpts) {
    options = {
        baseDir: process.cwd(),
        pathMode: 'absolute',
        ...options,
    }

    const parsed = await new Promise<lcov.LcovResults[]>((resolve, reject) => {
        lcov(file, (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
    const normalized = normalizePaths(parsed, options)
    return options.filter ? normalized.filter(options.filter) : normalized
}

function normalizePaths(results: lcov.LcovResults[], options: IParseGlobsOpts) {
    switch (options.pathMode) {
        case 'absolute':
            results.forEach(result => (result.file = path.resolve(options.baseDir!, result.file)))
            break

        case 'relative':
            results.forEach(
                result =>
                    (result.file = path.isAbsolute(result.file)
                        ? path.relative(options.baseDir!, result.file)
                        : result.file)
            )
            break

        case 'unmodified':
            break
    }
    return results
}
