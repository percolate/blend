import { MergedCoverageResults } from './coverage_merger'

export type CoverageResult = ReturnType<typeof calculateCoverage>

export function calculateCoverage(coverageByFile: { [key: string]: MergedCoverageResults }) {
    const coverageArray = Object.entries(coverageByFile).map(entry => entry[1])
    return {
        lines: calculateTotal(coverageArray, 'lines'),
        branches: calculateTotal(coverageArray, 'branches'),
        functions: calculateTotal(coverageArray, 'functions'),
    }
}

function calculateTotal(coverageArray: MergedCoverageResults[], type: 'lines' | 'branches' | 'functions') {
    const found = coverageArray.reduce((finds, coverage) => finds + coverage[type].found, 0)
    const hit = coverageArray.reduce((hits, coverage) => hits + coverage[type].hit, 0)
    const percentage = calculatePercentage({ found, hit })
    return {
        found,
        hit,
        percentage,
    }
}

export function calculatePercentage(coverageItem: { found: number; hit: number }) {
    return coverageItem.found ? Math.floor((coverageItem.hit / coverageItem.found) * 100) : 100
}
