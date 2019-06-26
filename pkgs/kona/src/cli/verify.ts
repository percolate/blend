/* eslint import/no-commonjs: "off" */
import { CommandModule } from 'yargs'
import { isFile, getAbsFilePaths } from '../utils/fs'
import { root } from '../root'
import mm from 'micromatch'
import { dirname, resolve, relative } from 'path'
import { readFileSync } from 'fs'
import { color } from '../utils/color'
import { forceExit } from '../utils/forceExit'

const { listDuplicates } = require('yarn-deduplicate') // no @types/yarn-deduplicate

interface IPackageJSON {
    devDependencies?: { [pkg: string]: string }
    dependencies?: { [pkg: string]: string }
    resolutions?: { [path: string]: string }
}

interface IPackages {
    isRoot: boolean
    json: IPackageJSON
    lockFile?: string
    label: string
    pkgDir: string
}

export const verifyCmd: CommandModule = {
    command: 'verify',
    describe: 'Verifies project is setup properly',
    handler: () => {
        const pkgs: IPackages[] = getAbsFilePaths(root())
            .filter(path => mm.isMatch(path, '**/package.json'))
            .map(path => buildPkg(path))

        const konaPkgJsonPath = resolve(__dirname, '../../package.json')
        const eslintPkgPath = resolve(__dirname, '../../../eslint-plugin/package.json')

        pkgs.push(buildPkg(konaPkgJsonPath, require(konaPkgJsonPath).name))
        pkgs.push(buildPkg(eslintPkgPath, require(eslintPkgPath).name))

        // console.log(`${args.dedupe ? 'Deduping' : 'Verifying'} packages:`)
        console.log(color(`${pkgs.map(pkg => `  ${pkg.label}`).join('\n')}\n`, 'grey'))

        const versionLookup: { [dep: string]: { paths: string[]; versions: string[] } } = {}
        const pkgDuplicates: { [path: string]: string[] } = {}
        const addToOutput = (
            path: string,
            packageJson: IPackageJSON,
            type: 'dependencies' | 'devDependencies'
        ) => {
            const deps = packageJson[type]
            if (!deps) return
            Object.keys(deps).forEach(dep => {
                const version = deps[dep]
                if (!versionLookup[dep]) versionLookup[dep] = { paths: [], versions: [] }
                versionLookup[dep].paths.push(path)
                versionLookup[dep].versions.push(version)
            })
        }

        pkgs.forEach(({ label: path, json, lockFile }) => {
            addToOutput(path, json, 'dependencies')
            addToOutput(path, json, 'devDependencies')
            pkgDuplicates[path] = lockFile ? listDuplicates(readFileSync(lockFile, 'utf8')) : []
        })

        console.log('Versions out of sync:')
        console.log(color('  versions should be the same across all package.json', 'grey'))
        let errors = 0
        Object.keys(versionLookup).forEach(pkg => {
            const { paths, versions } = versionLookup[pkg]
            const versionSet = new Set<string>(versions)
            if (versionSet.size === 1) return
            console.log(
                `  ${pkg}:\n${paths.map((path, index) => `    ${versions[index]} ${path}`).join('\n')}`
            )
            errors++
        })
        console.log('')

        console.log('Duplicate packages:')
        console.log(color('  run `dedupe` fo fix', 'grey'))
        let hasBetaDupes = false
        Object.keys(pkgDuplicates).forEach(path => {
            const duplicates = pkgDuplicates[path]
            if (duplicates.length === 0) return
            if (!hasBetaDupes && duplicates.find(dup => /-beta/.test(dup))) {
                hasBetaDupes = true
            }
            console.log(`  ${path}:\n${duplicates.map(dup => `    ${dup}`).join('\n')}`)
            errors++
        })
        console.log('')

        console.log('Resolutions:')
        pkgs.forEach(({ isRoot, json, label: path }) => {
            const resolutions = json.resolutions
            if (!resolutions) return
            if (!isRoot) {
                console.log(`  resolution only works in the root (remove from ${path})`)
                return errors++
            }
            Object.keys(resolutions).forEach(glob => {
                const version = resolutions[glob]
                const dependency = glob.replace('**/', '')
                const depVersion: string = json.dependencies ? json.dependencies[dependency] : ''
                if (depVersion && depVersion !== version) {
                    console.log(`  ${glob}@${version} should match ${dependency}@${depVersion}`)
                    errors++
                }
            })
        })
        console.log('')

        // if (args.dedupe) {
        //     if (hasBetaDupes) return forceExit('Unable to dedupe `*-beta` versions automatically')
        //     _.each(pkgs, ({ lockFile, path }) => {
        //         if (!lockFile) return
        //         console.log(`${path}:`)
        //         const cmd = `node_modules/.bin/yarn-deduplicate ${lockFile}`
        //         console.log(cmd)
        //         exec(cmd, { cwd: ROOT })
        //         console.log('')
        //     })
        //     exec(`yarn --ignore-scripts --no-progress`, { cwd: ROOT })
        //     return
        // }

        const message = `Total errors: ${errors}\n`
        return errors > 0 ? forceExit(message) : console.log(message)
    },
}

function buildPkg(absPkgJson: string, label?: string): IPackages {
    const pkgDir = dirname(absPkgJson)
    const lockFile = resolve(pkgDir, 'yarn.lock')
    const isRoot = pkgDir === root()
    return {
        isRoot,
        json: require(absPkgJson),
        lockFile: isFile(lockFile) ? lockFile : undefined,
        label: label ? label : relative(root(), absPkgJson),
        pkgDir,
    }
}
