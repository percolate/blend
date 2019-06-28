import { forceExit } from './forceExit'
import * as childProcess from 'child_process'
import { color } from './color'

export function execSync(
    cmd: string,
    opts: { cwd?: string; noStack?: boolean; verbose?: boolean; onError?(err: Error): void } = {}
) {
    const { cwd, noStack, onError, verbose } = opts
    try {
        if (verbose) {
            console.log(color(cmd, 'grey'))
            childProcess.execSync(cmd, { stdio: 'inherit', cwd })
            return ''
        }
        return childProcess
            .execSync(cmd, { stdio: 'pipe', cwd })
            .toString()
            .trim()
    } catch (e) {
        if (onError) {
            onError(e)
            return ''
        } else {
            return forceExit(noStack ? e.message : e)
        }
    }
}
