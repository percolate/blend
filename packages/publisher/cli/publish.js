const sh = require('shelljs')
const { docopt } = require('docopt')
const { clean, satisfies } = require('semver')
const { resolve } = require('path')

const DOC = `
Publish packages only if their version is newer than npm's.

Usage:
    publish [options]
    publish -h | --help

Options:
    -h --help  Show this screen
`

function main() {
    docopt(DOC)

    const pwd = sh.pwd().toString()
    const packageJsonPath = resolve(pwd, 'package.json')

    // ensure package.json is in present working dir
    if (!sh.test('-f', packageJsonPath)) {
        sh.echo(`Unable to find package.json in ${packageJsonPath}`)
        return sh.exit(1)
    }

    // load package.json information
    const package = require(packageJsonPath)

    // helper functions
    const log = function(msg) {
        sh.echo(`[${package.name}@${package.version}] ${msg}`)
    }
    const skip = function(msg) {
        log(`[SKIPPED] ${msg}`)
        return sh.exit(0)
    }

    // skip private packages
    if (package.private) skip('private package')

    // silent output of npm show since it's handled below
    log('fetching remote version')
    const versionExec = sh.exec(`npm show ${package.name} version`, { silent: true })

    let remoteVersion
    // report error without failing
    if (versionExec.stderr) {
        remoteVersion = '0.0.0'
        log(`npm show version not found: defaulting to ${remoteVersion}`)
    } else {
        remoteVersion = clean(versionExec.stdout)
    }

    // check if remote version is newer
    log(`verifying ${package.version} <= ${remoteVersion}...`)
    if (satisfies(package.version, `<=${remoteVersion}`)) {
        skip(`version already published`)
    }

    // publish
    log('publishing...')
    const publishExec = sh.exec('npm publish', { silent: true })
    if (publishExec.code) {
        log(`publishing error:\n${indent(publishExec.stderr)}`)
    } else {
        // npm publish leverages stderr for debug info so we output both
        log(`published successfully:\n${indent(publishExec.stderr)}\n${indent(publishExec.stdout)}`)
    }
    return sh.exit(publishExec.code)
}
function indent(message = '') {
    return message
        .split('\n')
        .map(line => `  ${line}`)
        .join('\n')
}

main()
