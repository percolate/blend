export function cleanExit(message?: string) {
    if (message) console.log(message)
    return process.exit(0)
}
