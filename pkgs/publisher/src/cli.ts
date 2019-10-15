import { docopt } from 'docopt'
import * as semver from 'semver'
import { resolve } from 'path'
import { fs, forceExit, cleanExit, execSync, color, Color } from '@percolate/cli-utils'

const doc = `
Publish package if the package.json version is newer than NPM's

Usage:
    publish [options]
    publish -h | --help

Options:
    -h --help  Show this screen
`

interface IPackageJson {
    name?: string
    private?: boolean
    version?: string
}

export function publisherCli() {
    docopt(doc, {})

    const packageJsonPath = resolve(process.cwd(), 'package.json')

    // ensure package.json is in present working dir
    if (!fs.isFile(packageJsonPath)) {
        return forceExit(`Unable to find package.json in ${packageJsonPath}`)
    }

    // load package.json information
    const pkgJson: IPackageJson = require(packageJsonPath)

    // helper functions
    const log = function(msg: string, coloring: Color = 'grey') {
        console.log(`${pkgJson.name}@${pkgJson.version} ${color(msg, coloring)}`)
    }
    const skip = function(msg: string) {
        log(`skipped: ${msg}`, 'green')
        return cleanExit()
    }

    // skip private packages
    if (pkgJson.private) {
        return skip('private package')
    }

    // silent output of npm show since it's handled below
    log('fetching remote version')
    const remoteVersion =
        semver.clean(
            execSync(`npm show ${pkgJson.name} version`, {
                onError: () => log('`npm show version` not found: defaulting to 0.0.0'),
            })
        ) || '0.0.0'

    // check if remote version is newer
    log(`verifying ${pkgJson.version} <= ${remoteVersion}...`)
    if (semver.satisfies(pkgJson.version || '0.0.0', `<=${remoteVersion}`)) {
        skip(`version already published`)
    }

    // publish
    log('publishing...')
    execSync('npm publish', {
        verbose: true,
        onError: () => {
            log('error publishing')
            forceExit()
        },
    })
    log('published successfully', 'green')
}
