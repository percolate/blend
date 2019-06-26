import { resolve } from 'path'
import { Config } from '@jest/types'
import { COVERAGE_PATH } from './constants'

const JUNIT = 'junit.xml'
export const jest: Partial<Config.InitialOptions> = {
    clearMocks: true,
    collectCoverageFrom: ['src/**/*.ts'],
    coverageDirectory: COVERAGE_PATH,
    coverageReporters: ['text-summary', 'lcov', 'html'],
    globals: {
        TEST: true,
    },
    reporters: process.env['CI']
        ? [
              'default',
              ['jest-junit', { output: resolve(COVERAGE_PATH, JUNIT), suiteNameTemplate: '{filepath}' }],
          ]
        : undefined,
    testMatch: ['**/*.spec.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/tmp/'],
    watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
}
