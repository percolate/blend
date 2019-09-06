import { forceExit } from './forceExit'
import * as childProcess from 'child_process'
import { color } from './color'

interface IExecSyncBaseOpts extends childProcess.ExecSyncOptions {
    onError?(err: Error): void
    verbose?: boolean
}

interface IExecSyncVerboseOpts extends IExecSyncBaseOpts {
    verbose: true
}

/* eslint-disable import/export */
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
