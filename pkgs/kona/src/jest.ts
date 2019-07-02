import { resolve } from 'path'
import { Config } from '@jest/types'
import { COVERAGE_PATH } from './constants'

const JUNIT = 'junit.xml'
/**
 * Jest base config with sensible defaults and CI setup
 *
 * ```js
 *  module.exports = {
 *    ...require('@percolate/kona').jest,
 *    // your project's config
 *  }
 * ```
 * */
export const jest: Partial<Config.InitialOptions> = {
    clearMocks: true,
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
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
