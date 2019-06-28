import { resolve } from 'path'

export const BIN_DIR = resolve(__dirname, '../node_modules/.bin')
export const COVERAGE_PATH = 'tmp/reports'
export const PROJECT_CONFIG = '.percolaterc'
export const SKIP_COVERAGE = '[skip coverage]'

// globs
export const ESLINT = '**/*.{js,jsx,gql,ts,tsx}'
export const PRETTIER = '**/*.{ts,tsx,js,jsx,md,mdx,json,gql,less,yml}'
