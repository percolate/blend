import { LcovResults, Section } from 'lcov-parse'

import { Addition } from './diff_addition_filter_merge'
import cloneDeep = require('lodash.clonedeep')

export type FilterCoverageResult = LcovResults & {
    absoluteFile?: string
}

export function filterDiffCoverage(
    coverageResults: LcovResults[],
    additionsByFile: { [key: string]: Addition }
) {
    const additionFiles = Object.keys(additionsByFile)
    const filteredCoverageResults = filterCoverageResults(coverageResults, additionFiles)
    const clonedFiltered = cloneDeep(filteredCoverageResults)
    const filteredFileCoverage = clonedFiltered.map(fileCoverage =>
        filterFileCoverage(fileCoverage, additionsByFile[fileCoverage.absoluteFile!])
    )

    const filesWithLines = filteredFileCoverage.filter(fileCoverage => fileCoverage.lines.found > 0)
    const coverageByFile = filesWithLines.reduce<{ [key: string]: FilterCoverageResult[] }>(
        (obj, file) => ({
            ...obj,
            [file.absoluteFile!]: (obj[file.absoluteFile!] || []).concat([file]),
        }),
        {}
    )

    return coverageByFile
}

function filterCoverageResults(coverageResults: LcovResults[], additionFiles: string[]) {
    const filteredCoverage = coverageResults.filter(fileCoverage =>
        coverageFileInDiffFiles(fileCoverage.file, additionFiles)
    )
    return filteredCoverage.map(fileCoverage => ({
        ...fileCoverage,
        absoluteFile: getMatchingDiffFile(fileCoverage.file, additionFiles),
    }))
}

function coverageFileInDiffFiles(coverageFile: string, additionFiles: string[]) {
    return additionFiles.some(additionFile => coverageFileMatchesDiffFile(coverageFile, additionFile))
}

function getMatchingDiffFile(coverageFile: string, additionFiles: string[]) {
    return additionFiles.find(additionFile => coverageFileMatchesDiffFile(coverageFile, additionFile))
}

function coverageFileMatchesDiffFile(coverageFile: string, additionFile: string) {
    return additionFile.endsWith(coverageFile)
}

function filterFileCoverage(fileCoverage: FilterCoverageResult, fileAdditions: Addition) {
    return {
        ...fileCoverage,
        functions: filterCoverageSection(fileCoverage.functions, fileAdditions.additions, 'hit'),
        lines: filterCoverageSection(fileCoverage.lines, fileAdditions.additions, 'hit'),
        branches: filterCoverageSection(fileCoverage.branches, fileAdditions.additions, 'taken'),
    }
}

function filterCoverageSection(coverageSection: Section, addedLines: number[], hitKey: 'hit' | 'taken') {
    const details = coverageSection.details.filter(detail => addedLines.includes(detail.line))
    return {
        found: details.length,
        hit: details.reduce((hits, detail) => hits + (detail[hitKey] ? 1 : 0), 0),
        details,
    }
}
