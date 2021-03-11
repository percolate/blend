import * as lcov from 'lcov-parse'
import * as parse from 'parse-diff'
import { resolve } from 'path'

import { calculateCoverage } from './coverage_calculator'
import { mergeCoverage, MergedCoverageResults } from './coverage_merger'
import { filterAndMergeDiffAdditions } from './diff_addition_filter_merge'
import { filterDiffCoverage } from './diff_coverage_filter'
import { parseDiffs } from './diff_parser'

/**
 * TS version of https://github.com/Connected-Information-systems/diff-test-coverage
 */

export interface IRunOpts {
    coverageReports: {
        baseDir: string
        globs: string[]
        types: 'lcov'[]
    }
    diff: {
        text: string
        baseDir: string
        filterGlobs: string[]
    }
    coverageThresholds: {
        lines: number
        branches: number
        functions: number
    }
    consoleReport: {
        baseDir: string
        templates: (
            | 'diff-files'
            | 'coverage-files-line'
            | 'coverage-files-complete'
            | 'coverage-lines-line'
            | 'coverage-lines-branches'
            | 'coverage-lines-complete'
            | 'totals-line'
            | 'totals-complete'
            | 'full'
            | 'errors'
        )[]
    }
}

type Await<T> = T extends PromiseLike<infer U> ? U : T
export type RunResult = Await<ReturnType<typeof run>>

export async function run({ coverageReports, diff }: IRunOpts) {
    const fileDiffs = parse(diff.text).map(item => {
        if (item.to) item.to = resolve(diff.baseDir, item.to)
        if (item.from) item.from = resolve(diff.baseDir, item.from)
        return item
    })
    const additionsByFile = filterAndMergeDiffAdditions(fileDiffs, diff)

    const diffFiles = Object.keys(additionsByFile)
    const parsedDiffs = await Promise.all(
        coverageReports.globs.map((glob, index) =>
            parseDiffs([glob], {
                type: coverageReports.types[index] || coverageReports.types[coverageReports.types.length - 1],
                baseDir: coverageReports.baseDir,
                pathMode: 'unmodified',
                filter: item => diffFiles.some(file => file.endsWith(item.file)),
            })
        )
    )
    const flattenedDiffs = parsedDiffs.reduce<lcov.LcovResults[]>((arr, file) => arr.concat(file), [])
    const filteredDiffs = filterDiffCoverage(flattenedDiffs, additionsByFile)

    const coverageByFile = Object.entries(filteredDiffs).reduce<{ [key: string]: MergedCoverageResults }>(
        (obj, entry) => ({
            ...obj,
            [entry[0]]: mergeCoverage(entry[1]),
        }),
        {}
    )

    const totals = calculateCoverage(coverageByFile)

    return {
        additionsByFile,
        coverageByFile,
        totals,
    }
}
