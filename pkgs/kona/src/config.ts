import { PROJECT_CONFIG } from './constants'
import { isFile } from './utils/fs'
import { root } from './root'
import { readFileSync } from 'fs'
import { color } from './utils/color'

interface IConfig {
    commitLintPaths: string[]
    tsConfigs: string[]
}

export const config: IConfig = {
    get commitLintPaths() {
        return customValue('commitLintPaths') || []
    },
    get tsConfigs() {
        return customValue('tsConfigs') || []
    },
}

export function logDefault(key: keyof IConfig, defaultValue: unknown) {
    console.log(`Default "${PROJECT_CONFIG}": ${color(JSON.stringify({ [key]: defaultValue }), 'grey')}`)
}

let customConfig: Partial<IConfig> | undefined
function customValue(key: keyof IConfig) {
    if (!customConfig) {
        const configPath = root(PROJECT_CONFIG)
        customConfig = isFile(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {}
    }
    return customConfig![key]
}
