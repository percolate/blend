import { spawn } from 'child_process'

import { getMaxCpus } from './getMaxCpus'

const EXIT_CODES = { error: 1, success: 0 }
const COMMAND_PROMPT_CHAR_LIMIT = 7000 // actual limit is 8191 but we're playing it safe

export interface IParallelizeOpts {
    cmd: string
    cwd?: string
    files: string[]
    maxChunkSize?: number
    maxCpus?: number
    outputs?: string[]
    quiet?: boolean
}

let _quiet: boolean | undefined
export function parallelize(options: IParallelizeOpts) {
    const startTime = process.hrtime()
    const {
        cmd,
        cwd = process.cwd(),
        files,
        maxChunkSize,
        maxCpus,
        // pass an array to aggregate outputs
        outputs,
    } = options

    _quiet = options.quiet

    log(`cmd: ${cmd}`)

    const cpus = getMaxCpus(maxCpus)

    return Promise.resolve()
        .then(() => processFiles({ cmd, cwd, files, maxChunkSize, cpus, outputs }))
        .then(exitCodes => summarize({ exitCodes, startTime }))
}

interface IProcressFilesOpts {
    cmd: string
    cwd: string
    files: string[]
    maxChunkSize?: number
    cpus: number
    outputs?: string[]
}
function processFiles({ cmd, cwd, files, maxChunkSize = Infinity, cpus, outputs }: IProcressFilesOpts) {
    const numFiles = files.length

    log(`Files found: ${numFiles}`)
    if (!numFiles) return [EXIT_CODES.success]

    const cpProcesses = Math.ceil(files.join(' ').length / (COMMAND_PROMPT_CHAR_LIMIT - cmd.length - 1))
    const totalProcesses = Math.max(Math.min(numFiles, cpus), cpProcesses)
    const safeChunkSize = Math.min(Math.ceil(numFiles / totalProcesses), maxChunkSize)

    log(`Parallel processes: ${totalProcesses}`)
    log(`Chunk size: ${safeChunkSize}`)

    let index = 0
    function next() {
        const prevIndex = index
        index += safeChunkSize
        return files.slice(prevIndex, index)
    }

    const processes = []
    for (let i = 0; i < totalProcesses; i++) {
        processes.push(spawnProcess({ cmd, cwd, next, outputs }))
    }

    return Promise.all(processes)
}

interface ISpawnProcessOpts {
    cmd: string
    cwd: string
    next: () => string[]
    outputs?: string[]
}
function spawnProcess(options: ISpawnProcessOpts, code = EXIT_CODES.success): Promise<number> {
    const { cmd, cwd, next, outputs } = options
    const files = next()

    if (!files.length) return Promise.resolve(code)

    return new Promise(resolve => {
        const [executable, ...args] = cmd.split(/\s+/g)
        const child = spawn(executable, args.concat(files), {
            cwd,
            stdio: outputs instanceof Array ? ['inherit', 'pipe', 'inherit'] : 'inherit',
        })
        const partialOutput: string[] = []
        if (outputs instanceof Array) {
            child.stdout!.on('data', message => {
                partialOutput.push(message.toString())
            })
        }
        child.on('exit', (_code, signal) => {
            // out of memory errors don't return a code
            if (signal === 'SIGABRT') return resolve(EXIT_CODES.error)

            if (outputs instanceof Array) outputs.push(partialOutput.join(''))

            // process is now free, process next files
            resolve(spawnProcess(options, _code ? _code : undefined))
        })
        // errors will be reported through stdio
        child.on('error', () => resolve(EXIT_CODES.error))
    })
}

function summarize({ exitCodes, startTime }: { exitCodes: number[]; startTime: [number, number] }) {
    const endTime = process.hrtime(startTime)
    const timeElapsed = (endTime[0] + endTime[1] / 1e9).toFixed(3)

    const totalSuccess = exitCodes.filter(code => code === EXIT_CODES.success).length
    log(`Successful processes: ${totalSuccess}/${exitCodes.length} in ${timeElapsed} seconds\n`)

    return totalSuccess === exitCodes.length ? EXIT_CODES.success : EXIT_CODES.error
}

function log(message: string) {
    if (_quiet) return
    process.stdout.write(`${message}\n`)
}
