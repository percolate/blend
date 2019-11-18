import { PROJECT_CONFIG } from './constants'
import { fs } from '@percolate/cli-utils'
import { root } from './root'
import { readFileSync } from 'fs'
import { resolve, relative } from 'path'

interface IConfig {
    /** globs to enforce commit messages `kona commit validate` */
    commitLintPaths: string[]

    /** test coverage directory `kona test --coverage && kona coverage` */
    coverageDir: string

    /** glob to run ESLint against `kona lint eslint` */
    eslintPattern: string

    /** glob to run Prettier against `kona lint prettier`*/
    prettierPattern: string

    /** tsconfig(s) to run type checking against `kona ts` */
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
const customConfig: Partial<IConfig> = fs.isFile(configPath)
    ? JSON.parse(readFileSync(configPath, 'utf8'))
    : {}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const config = {} as IConfig
Object.keys(defaultConfig).forEach(<K extends keyof IConfig>(key: K) => {
    const defaultValue = defaultConfig[key]
    const customValue = customConfig[key]
    config[key] = typeof customValue === typeof defaultValue ? (customValue as IConfig[K]) : defaultValue
})
