exports.log = function log(message) {
    process.stdout.write(`${message}\n`)
}

exports.forceExit = function forceExit(message) {
    process.stderr.write(`${message}\n`)
    process.exit(1)
}
