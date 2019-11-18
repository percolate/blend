import { CommandModule } from 'yargs'
import { forceExit, fs, getMaxCpus } from '@percolate/cli-utils'
import { root } from '../root'
import { config } from '../config'
import * as mm from 'micromatch'
import pMap = require('p-map')
import { spawn } from 'child_process'

interface ITsCmdOpts {
    path?: string[]
}

export const tsCmd: CommandModule<{}, ITsCmdOpts> = {
    command: 'ts [path..]',
    describe: 'Type check with TypeScript',
    handler: async argv => {
        const filterPaths = argv.path && argv.path.length ? argv.path : [process.cwd()]
        const absConfigBlobs = config.tsConfigs.map(path => root(path))
        const configPaths = fs
            .getAbsFilePaths(root(), {
                filterPaths,
            })
            .filter(path => mm.any(path, absConfigBlobs))

        if (!configPaths.length) {
            return console.log(
                `No tsconfig files found matching "${config.tsConfigs}" in "${filterPaths.join(',')}"`
            )
        }

        const exitCodes = await pMap(configPaths, typeCheck, {
            concurrency: getMaxCpus(),
        })
        const errorCodes = exitCodes.filter(code => code > 0)
        if (errorCodes.length) forceExit(`total errors: ${errorCodes.length}`)
    },
}

function typeCheck(tsConfig: string) {
    return new Promise<number>(success => {
        console.log(`Type checking ${tsConfig}...`)
        const child = spawn('npx', ['tsc', '--project', tsConfig, '--noEmit'], {
            shell: true,
            stdio: 'inherit',
        })
        child.on('exit', (code, abortSignal) => {
            if (abortSignal === 'SIGABRT') code = 1
            success(Number(code))
        })
    })
}
