import { color } from './color'

export function forceExit(error?: Error | string) {
    const errorMessage = error instanceof Error ? error.stack : error
    if (errorMessage) console.log(color(errorMessage, 'red'))
    return process.exit(1)
}
