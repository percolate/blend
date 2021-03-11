import { Detail } from 'lcov-parse'

import { FilterCoverageResult } from './diff_coverage_filter'

interface IMergeSectionOpts {
    coverageResults: FilterCoverageResult[]
    sectionKey: 'lines' | 'functions' | 'branches'
    hitKey: Partial<KeysMatching<Detail, number>>
    grouper: string | ((detail: Detail) => string)
    merger: (details: Detail[]) => Partial<Detail>
}

type KeysMatching<T, V> = NonNullable<{ [K in keyof T]: T[K] extends V ? K : never }[keyof T]>

export type MergedCoverageResults = ReturnType<typeof mergeCoverage>

export function mergeCoverage(coverageResults: FilterCoverageResult[]) {
    const lastResult = coverageResults[coverageResults.length - 1]
    return {
        title: lastResult.title,
        file: lastResult.file,
        lines: mergeSections({
            coverageResults,
            sectionKey: 'lines',
            hitKey: 'hit',
            grouper: 'line',
            merger: mergeLinesDetails,
        }),
        functions: mergeSections({
            coverageResults,
            sectionKey: 'functions',
            hitKey: 'hit',
            grouper: 'line',
            merger: mergeFunctionsDetails,
        }),
        branches: mergeSections({
            coverageResults,
            sectionKey: 'branches',
            hitKey: 'taken',
            grouper: getBranchDetailGroup,
            merger: mergeBranchesDetails,
        }),
    }
}

function mergeSections({ coverageResults, sectionKey, hitKey, grouper, merger }: IMergeSectionOpts) {
    const sectionDetails = coverageResults
        .map(coverage => coverage[sectionKey].details)
        .reduce<Detail[]>((arr, file) => arr.concat(file), [])
    const mergedDetails = mergeDetails(sectionDetails, grouper, merger)
    return createSection(mergedDetails, hitKey)
}

function mergeDetails(
    details: Detail[],
    grouper: IMergeSectionOpts['grouper'],
    merger: IMergeSectionOpts['merger']
) {
    const groupedDetails = details.reduce<{ [key: string]: Detail[] }>((obj, detail) => {
        const key = typeof grouper === 'function' ? grouper(detail) : detail[grouper as keyof Detail]
        return {
            ...obj,
            [key]: (obj[key] || []).concat([detail]),
        }
    }, {})

    return Object.entries(groupedDetails).map(entry => merger(entry[1]))
}

function createSection(details: Partial<Detail>[], hitKey: IMergeSectionOpts['hitKey']) {
    return {
        found: details.length,
        hit: details.reduce((hits, detail) => (hits + detail[hitKey]! ? 1 : 0), 0),
        details,
    }
}

function getBranchDetailGroup(detail: Detail) {
    return `${detail.line}_${detail.block || 0}_${detail.branch}`
}

function mergeFunctionsDetails(details: Detail[]) {
    const lastDetail = details[details.length - 1]
    return {
        name: lastDetail.name,
        line: lastDetail.line,
        hit: details.reduce((hits, detail) => hits + detail.hit, 0),
    }
}

function mergeLinesDetails(details: Detail[]) {
    const lastDetail = details[details.length - 1]
    return {
        line: lastDetail.line,
        hit: details.reduce((hits, detail) => hits + detail.hit, 0),
    }
}

function mergeBranchesDetails(details: Detail[]) {
    const lastDetail = details[details.length - 1]
    return {
        line: lastDetail.line,
        block: lastDetail.block || 0,
        branch: lastDetail.branch,
        taken: details.reduce((takens, detail) => takens + detail.taken, 0),
    }
}
