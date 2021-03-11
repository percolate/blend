import * as childProcess from 'child_process'

import { color } from './color'
import { forceExit } from './forceExit'

interface IExecSyncBaseOpts extends childProcess.ExecSyncOptions {
    onError?(err: childProcess.SpawnSyncReturns<string>): void
    verbose?: boolean
}

interface IExecSyncVerboseOpts extends IExecSyncBaseOpts {
    verbose: true
}

export function execSync(cmd: string, opts?: IExecSyncBaseOpts): string
export function execSync(cmd: string, opts?: IExecSyncVerboseOpts): void
export function execSync(cmd: string, opts: IExecSyncBaseOpts | IExecSyncVerboseOpts = {}) {
    const { verbose, onError = forceExit, ...rest } = opts

    if (verbose) {
        console.log(color(cmd, 'grey'))
        try {
            childProcess.execSync(cmd, { ...rest, stdio: 'inherit' })
        } catch (e) {
            // do not pass error to forceExit to avoid duplicating error message
            onError(opts.onError ? e : undefined)
        }
        return
    }

    try {
        return childProcess
            .execSync(cmd, { ...rest, stdio: 'pipe' })
            .toString()
            .trim()
    } catch (e) {
        onError(e)
        return ''
    }
}
