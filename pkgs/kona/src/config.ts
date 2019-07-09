import { PROJECT_CONFIG } from './constants'
import { isFile } from './utils/fs'
import { root } from './root'
import { readFileSync } from 'fs'
import { resolve, relative } from 'path'
import * as _ from 'lodash'

interface IConfig {
    commitLintPaths: string[]
    coverageDir: string
    eslintPattern: string
    prettierPattern: string
    tsConfigs: string[]
}

const defaultConfig: IConfig = {
    commitLintPaths: [],
    coverageDir: 'tmp/reports',
    eslintPattern: '**/*.{js,jsx,gql,ts,tsx}',
    prettierPattern: '**/*.{ts,tsx,js,jsx,md,mdx,json,gql,less,yml}',
    get tsConfigs() {
        return [relative(root(), resolve(process.cwd(), 'tsconfig.json'))]
    },
}

const configPath = root(PROJECT_CONFIG)
const customConfig: Partial<IConfig> = isFile(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {}

// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
export const config = {} as IConfig
Object.keys(defaultConfig).forEach(<K extends keyof IConfig>(key: K) => {
    const defaultValue = defaultConfig[key]
    const customValue = _.get(customConfig, key)
    config[key] = typeof customValue === typeof defaultValue ? (customValue as IConfig[K]) : defaultValue
})
