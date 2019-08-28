import { forceExit } from './forceExit'
import * as childProcess from 'child_process'
import { color } from './color'

interface IExecSyncBaseOpts {
    cwd?: string
    onError?(err: Error): void
}

interface IExecSyncVerboseOpts extends IExecSyncBaseOpts {
    verbose: true
}

/* eslint-disable import/export */
export function execSync(cmd: string, opts?: IExecSyncBaseOpts): string
export function execSync(cmd: string, opts?: IExecSyncVerboseOpts): void
export function execSync(cmd: string, opts: IExecSyncBaseOpts | IExecSyncVerboseOpts = {}) {
    const { cwd, onError = forceExit } = opts

    if ('verbose' in opts) {
        console.log(color(cmd, 'grey'))
        try {
            childProcess.execSync(cmd, { stdio: 'inherit', cwd })
        } catch (e) {
            // do not pass error to forceExit to avoid duplicating error message
            onError(opts.onError ? e : undefined)
        }
        return
    }

    try {
        return childProcess
            .execSync(cmd, { stdio: 'pipe', cwd })
            .toString()
            .trim()
    } catch (e) {
        onError(e)
        return ''
    }
}
