import { color } from '@percolate/cli-utils'
import * as fs from 'fs'
import { join, relative, resolve } from 'path'
import template = require('lodash.template')

import { IRunOpts, RunResult } from './application'
import { calculatePercentage } from './coverage_calculator'

interface IReportOpts extends RunResult {
    options: IRunOpts
}

type CoverageResult = IReportOpts['coverageByFile'][0]
type CoverageSection = IReportOpts['coverageByFile'][0]['lines']
type CoverageDetails = IReportOpts['coverageByFile'][0]['lines']['details']
type CoverageTypes = 'branches' | 'functions' | 'lines'
type Templates = IRunOpts['consoleReport']['templates'][0]

export const templates: Templates[] = [
    'diff-files',
    'coverage-files-line',
    'coverage-files-complete',
    'coverage-lines-line',
    'coverage-lines-branches',
    'coverage-lines-complete',
    'totals-line',
    'totals-complete',
    'errors',
    'full',
]

const templateSets: { [key: string]: Templates[] } = {
    full: ['diff-files', 'coverage-lines-complete', 'coverage-files-complete', 'totals-complete', 'errors'],
}

const templateDir = resolve(__dirname, './templates')

export function report({ coverageByFile, additionsByFile, totals, options }: IReportOpts) {
    const templateNames = getTemplatesNames(options)
    const res = templateNames
        .map(templateName => {
            return getLogMessage({ templateName, coverageByFile, additionsByFile, totals, options })
        })
        .join('\n')
        .trim()

    return res
}

function getTemplatesNames(options: IReportOpts['options']) {
    return options.consoleReport.templates
        .map<Templates[]>(templateName => {
            if (templateName in templateSets) return templateSets[templateName]
            return [templateName]
        })
        .reduce<Templates[]>((acc, val) => acc.concat(val), [])
}

function getLogMessage({
    templateName,
    coverageByFile,
    additionsByFile,
    totals,
    options,
}: IReportOpts & { templateName: Templates }) {
    const templateFile = join(templateDir, templateName + '.template')
    const templateString = fs.readFileSync(templateFile, 'utf8')
    const templateFunc = template(templateString)
    let currentFile: string | null = null
    let previousLineNumber: number | null = null

    return templateFunc({
        coverageByFile,
        additionsByFile,
        totals,
        options,
        color,
        getRelativePath: (file: string) => relative(options.consoleReport.baseDir, file),
        isError: (coverageResult: CoverageResult, type: CoverageTypes) =>
            isError(coverageResult, type, options),
        displayLineCoverageLine: (file: string, lineNumber: string, line: string) => {
            const linesCoverageDetails = coverageByFile?.[file]?.lines?.details
            const message = displayLineCoverageLine(lineNumber, line, linesCoverageDetails)
            return separateNonSubsequentLines(file, lineNumber, message)
        },
        displayBranchCoverageLine: (file: string, lineNumber: string, line: string) => {
            const branchesCoverageDetails = coverageByFile?.[file]?.branches?.details
            const message = displayBranchCoverageLine(lineNumber, line, branchesCoverageDetails)
            return separateNonSubsequentLines(file, lineNumber, message)
        },
        displayCompleteCoverageLine: (file: string, lineNumber: string, line: string) => {
            const fileCoverage = coverageByFile[file]
            const message = displayCompleteCoverageLine(lineNumber, line, fileCoverage)
            return separateNonSubsequentLines(file, lineNumber, message)
        },
        displayCoverage: (coverageResult: CoverageResult, type: CoverageTypes, usePadding: boolean) =>
            displayCoverage(coverageResult, type, usePadding, options),
    })

    function separateNonSubsequentLines(file: string, lineNumber: string, message: string) {
        if (currentFile !== file) {
            currentFile = file
            previousLineNumber = null
        }
        const nextLineNumber = parseInt(lineNumber, 10)
        const _previousLineNumber = previousLineNumber
        previousLineNumber = nextLineNumber
        if (!_previousLineNumber) {
            return message
        }
        return _previousLineNumber === nextLineNumber - 1 ? message : '\n' + message
    }
}

function displayLineCoverageLine(lineNumber: string, line: string, linesCoverageDetails: CoverageDetails) {
    const isCovered = isLineCovered(linesCoverageDetails, lineNumber)
    return colorMessage(lineNumber.padEnd(4) + line + '\n', isCovered)
}

function displayBranchCoverageLine(
    lineNumber: string,
    line: string,
    branchesCoverageDetails: CoverageDetails
) {
    const coverage = getLineBranchesCoverage(branchesCoverageDetails, lineNumber)
    const isCovered = areLineBranchesCovered(coverage)
    const coveredStatistics = coverage.found ? `(${coverage.hit}/${coverage.found})` : ''
    return colorMessage(`${lineNumber} ${coveredStatistics}`.padEnd(9) + line + '\n', isCovered)
}

function displayCompleteCoverageLine(lineNumber: string, line: string, fileCoverage: CoverageResult) {
    const isLineFunctionCovered = isLineCovered(fileCoverage.functions.details, lineNumber)
    const isLineLineCovered = isLineCovered(fileCoverage.lines.details, lineNumber)
    const branchesCoverage = getLineBranchesCoverage(fileCoverage.branches.details, lineNumber)
    const areBranchesCovered = areLineBranchesCovered(branchesCoverage)

    const markings = [
        isLineFunctionCovered !== null ? colorMessage('F', isLineFunctionCovered) : null,
        isLineLineCovered !== null ? colorMessage('L', isLineLineCovered) : null,
        areBranchesCovered !== null
            ? colorMessage(`B(${branchesCoverage.hit}/${branchesCoverage.found})`, areBranchesCovered)
            : null,
    ]

    const message = markings.filter(marking => marking).join(' | ')
    return padEnd(lineNumber, 4) + padEnd(message, 14) + line + '\n'
}

function isLineCovered(coverageDetails: CoverageDetails, lineNumber: string) {
    const lineCoverage = coverageDetails.find(detail => detail?.line?.toString() === lineNumber.toString())
    return lineCoverage ? lineCoverage.hit! > 0 : null
}

function getLineBranchesCoverage(branchesCoverageDetails: CoverageDetails, lineNumber: string) {
    const branchCoverageList = branchesCoverageDetails.filter(
        detail => detail?.line?.toString() === lineNumber.toString()
    )
    return {
        found: branchCoverageList.length,
        hit: branchCoverageList.reduce((hits, branchCoverage) => (hits + branchCoverage.taken! ? 1 : 0), 0),
    }
}

function areLineBranchesCovered(branchesLineCoverage: ReturnType<typeof getLineBranchesCoverage>) {
    return branchesLineCoverage.found === 0 ? null : branchesLineCoverage.found === branchesLineCoverage.hit
}

function displayCoverage(
    coverageResult: CoverageResult,
    type: CoverageTypes,
    usePadding: boolean,
    options: IRunOpts
) {
    return (
        displayPercentage(coverageResult, type, usePadding, options) +
        ' ' +
        displayNumbers(coverageResult, type, usePadding)
    )
}

function displayPercentage(
    coverageResult: CoverageResult,
    type: CoverageTypes,
    usePadding: boolean,
    options: IRunOpts
) {
    const coverageItem = coverageResult[type] as CoverageSection
    const percentage = calculatePercentage(coverageItem)
    const percentageString = usePadding ? `${percentage}%`.padStart(4) : `${percentage}%`
    const isSuccess = !isError(coverageResult, type, options)
    return colorMessage(percentageString, isSuccess)
}

function displayNumbers(coverageResult: CoverageResult, type: CoverageTypes, usePadding: boolean) {
    const coverageItem = coverageResult[type] as CoverageSection
    const numberString = `(${coverageItem.hit}/${coverageItem.found})`
    return usePadding ? numberString.padEnd(9) : numberString
}

function isError(coverageResult: CoverageResult, type: CoverageTypes, options: IRunOpts) {
    const percentage = calculatePercentage(coverageResult[type] as CoverageSection)
    return percentage < options.coverageThresholds[type]
}

function padEnd(message: string, length: number) {
    // eslint-disable-next-line no-control-regex
    const stripped = message.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')
    const colorLength = message.length - stripped.length
    return message.padEnd(length + colorLength)
}

function colorMessage(message: string, isSuccess: boolean | null) {
    return isSuccess === null ? message : color(message, isSuccess ? 'green' : 'red')
}
