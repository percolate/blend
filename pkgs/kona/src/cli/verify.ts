import { CommandModule } from 'yargs'
import { color, execSync, forceExit, fs } from '@percolate/cli-utils'
import { root } from '../root'
import * as mm from 'micromatch'
import { dirname, resolve, relative } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import * as _ from 'lodash'
import { config } from '../config'
import { BIN_DIR } from '../constants'

const PRETTIER_CONFIG = '@percolate/kona/configs/prettier.json'
const PRECOMMIT_CMD = 'node_modules/.bin/kona commit preCommit'

// eslint-disable-next-line import/no-commonjs
const { listDuplicates } = require('yarn-deduplicate') // no @types/yarn-deduplicate

interface IVerifyArgs {
    fix?: boolean
}
interface IPkgJson {
    dependencies?: { [pkg: string]: string }
    devDependencies?: { [pkg: string]: string }
    husky?: { hooks?: { [hook: string]: string } }
    prettier?: string
    resolutions?: { [path: string]: string }
}

interface IPkg {
    isRoot: boolean
    json: IPkgJson
    label: string
    lockFile?: string
    path: string
}

type DepType = 'dependencies' | 'devDependencies'

interface IDep {
    name: string
    version: string
    type: DepType
}

interface IPkgValidator {
    title: string
    description: string
    validate(opts: {
        pkg: Omit<IPkg, 'json'>
        pkgJson: IPkgJson
        reportError: (message: string) => void
        isRoot: boolean
    }): IPkgJson
}

let hasBetaDupes = false
const versionLookup: { [dep: string]: { paths: string[]; versions: string[] } } = {}
const pkgValidators: IPkgValidator[] = [
    {
        title: 'Exact versions',
        description: 'Dependencies must be exact (ex. 1.0.0 not ^1.0.0)',
        validate: ({ pkgJson, reportError, pkg }) => {
            const badDeps: IDep[] = []
            forEachDep(pkgJson, dep => {
                const firstChar = dep.version[0]
                if (firstChar !== '~' && firstChar !== '^') return
                badDeps.push(dep)
                reportError(`${dep.name}@${dep.version}`)
            })
            if (!badDeps.length) return pkgJson
            const yarnDeps: { [dep: string]: string | undefined } = {}
            JSON.parse(
                execSync(`yarn list --json --depth 0 --pattern ${badDeps.map(dep => dep.name).join(' ')}`, {
                    cwd: dirname(pkg.path),
                })
            ).data.trees.map((data: { name: string }) => {
                const match = data.name.match(/^(.+)@(.+)$/)
                if (!match) throw new Error('Unable to parse `yarn list --json` output')
                yarnDeps[match![1]] = match![2]
            })
            badDeps.forEach(dep => {
                const realVersion = yarnDeps[dep.name]
                if (!realVersion) throw new Error(`${dep.name} missing from yarn list output`)
                pkgJson[dep.type]![dep.name] = realVersion
            })
            return pkgJson
        },
    },
    {
        title: 'Resolutions',
        description: 'Resolutions must match dependency',
        validate: ({ pkgJson, reportError, pkg }) => {
            const resolutions = pkgJson.resolutions
            if (!resolutions) return pkgJson
            if (!pkg.lockFile) {
                reportError('Only works on root package.json')
                return _.omit(pkgJson, 'resolutions')
            }
            _.each(resolutions, (version, glob) => {
                const dependency = glob.replace('**/', '')
                let depVersion: string = pkgJson.dependencies ? pkgJson.dependencies[dependency] : ''
                if (!depVersion) {
                    depVersion = pkgJson.devDependencies ? pkgJson.devDependencies[dependency] : ''
                }
                if (depVersion && depVersion !== version) {
                    reportError(`${glob}@${version} must match ${dependency}@${depVersion}`)
                    pkgJson.resolutions![glob] = depVersion
                }
            })
            return pkgJson
        },
    },
    {
        title: 'Pre-commit hooks',
        description: 'Ensures pre-commit hooks are setup when using commitLintPaths',
        validate: ({ isRoot, pkgJson, reportError }) => {
            if (!isRoot) {
                if (pkgJson.husky) reportError('Only works on root package.json')
                return _.omit(pkgJson, 'husky')
            }

            if (_.isEmpty(config.commitLintPaths)) return pkgJson
            if (_.get(pkgJson, ['husky', 'hooks', 'commit-msg']) === PRECOMMIT_CMD) return pkgJson
            const husky = {
                husky: {
                    hooks: {
                        'commit-msg': PRECOMMIT_CMD,
                    },
                },
            }
            reportError(`${JSON.stringify(husky)} missing from root package.json`)
            return _.merge(pkgJson, husky)
        },
    },
    {
        title: 'Prettier',
        description: `Ensures prettier points to ${PRETTIER_CONFIG}`,
        validate: ({ isRoot, pkgJson, reportError }) => {
            if (!isRoot) {
                if (pkgJson.prettier) reportError('Only works on root package.json')
                return _.omit(pkgJson, 'prettier')
            }
            if (pkgJson.prettier === PRETTIER_CONFIG) return pkgJson
            reportError(`${JSON.stringify({ prettier: PRETTIER_CONFIG })} missing`)
            pkgJson.prettier = PRETTIER_CONFIG
            return pkgJson
        },
    },
    {
        title: 'Duplicate dependencies',
        description: 'Rerun with --fix to cleanup lockfile',
        validate: ({ pkgJson, reportError, pkg }) => {
            const duplicates: string[] = pkg.lockFile
                ? listDuplicates(readFileSync(pkg.lockFile, 'utf8'))
                : []
            if (!hasBetaDupes && duplicates.find(dup => /-beta/.test(dup))) {
                hasBetaDupes = true
            }
            duplicates.forEach(reportError)
            return pkgJson
        },
    },
]

export const verifyCmd: CommandModule<{}, IVerifyArgs> = {
    command: 'verify',
    describe: 'Verifies project is setup properly',
    builder: args => {
        return args.option('fix', {
            desc: 'automatically fix errors',
            type: 'boolean',
        })
    },
    handler: argv => {
        const pkgs: IPkg[] = fs
            .getAbsFilePaths(root())
            .filter(path => mm.isMatch(path, '**/package.json'))
            .map(path => buildPkg(path))

        let totalErrors = 0
        pkgs.forEach(pkg => {
            let newPkgJson: IPkgJson = pkg.json
            console.log(color(`${pkg.label}`, 'underline'))
            pkgValidators.forEach(rule => {
                const errors: string[] = []
                console.log(`  ${rule.title}: ${color(rule.description, 'grey')}`)
                newPkgJson = rule.validate({
                    isRoot: pkg.isRoot,
                    pkg,
                    pkgJson: _.cloneDeep(newPkgJson),
                    reportError: (message: string) => errors.push(message),
                })

                if (errors.length) {
                    totalErrors++
                    console.log(color(`${errors.map(message => `    ${message}`).join('\n')}\n`, 'red'))
                }
            })
            if (!_.isEqual(pkg.json, newPkgJson)) {
                console.log('')
                if (argv.fix) {
                    console.log(`  Fixing ${pkg.path}...`)
                    writeFileSync(pkg.path, JSON.stringify(newPkgJson, null, 2) + '\n', 'utf8')
                } else {
                    console.log(color(`  Rerun with --fix to fix ${pkg.label}`, 'green'))
                }
            }
            console.log('')
        })
        console.log('')

        const versionErrors: string[] = []
        _.each(versionLookup, ({ paths, versions }, dep) => {
            if (_.uniq(versions).length === 1) return
            versionErrors.push(
                `${dep}:\n${paths
                    .map((path, index) => `    ${color(versions[index], 'red')} ${color(path, 'grey')}`)
                    .join('\n')}`
            )
        })
        if (versionErrors.length) {
            totalErrors += versionErrors.length
            console.log(color(`Versions out of sync:`, 'underline'))
            console.log(color('  Versions should be the same across all package.json\n', 'grey'))
            console.log(`${versionErrors.join('\n')}\n`)
            console.log(color('  Please update manually and run `yarn`\n', 'red'))
        }

        if (argv.fix) {
            if (hasBetaDupes) return forceExit('Unable to dedupe `*-beta` versions automatically')
            console.log('Fixing duplicates...')
            _.each(pkgs, ({ lockFile }) => {
                if (!lockFile) return
                const cmd = `${resolve(BIN_DIR, 'yarn-deduplicate')} ${lockFile}`
                execSync(cmd, { verbose: true })
            })
            console.log('')
            execSync(`yarn --ignore-scripts --no-progress`, { cwd: root(), verbose: true })
            console.log('')
        }

        const message = `Total errors: ${totalErrors}\n`
        return totalErrors > 0 ? forceExit(message) : console.log(message)
    },
}

function buildPkg(absPkgJsonPath: string, pkgName?: string) {
    const pkgDir = dirname(absPkgJsonPath)
    const lockFile = resolve(pkgDir, 'yarn.lock')
    const pkg: IPkg = {
        isRoot: pkgDir === root(),
        json: require(absPkgJsonPath),
        label: pkgName ? pkgName : relative(root(), absPkgJsonPath),
        lockFile: fs.isFile(lockFile) ? lockFile : undefined,
        path: absPkgJsonPath,
    }

    forEachDep(pkg.json, ({ name, version }) => {
        if (version.includes('link:')) return
        if (!versionLookup[name]) versionLookup[name] = { paths: [], versions: [] }
        versionLookup[name].paths.push(pkg.label)
        versionLookup[name].versions.push(version)
    })

    return pkg
}

function forEachDep(pkgJson: IPkgJson, cb: (dep: IDep) => void, type?: DepType) {
    if (!type) {
        forEachDep(pkgJson, cb, 'dependencies')
        forEachDep(pkgJson, cb, 'devDependencies')
        return
    }
    const deps = pkgJson[type]
    if (!deps) return
    _.each(deps, (version, name) => cb({ name, version, type }))
}
