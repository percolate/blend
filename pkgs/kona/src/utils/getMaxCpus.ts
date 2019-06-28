import * as os from 'os'

const CI_ALLOC_CPUS = 2
export function getMaxCpus(max?: number) {
    const cpus = Math.max(os.cpus().length - 1, 1)

    // max can be passed but will be more than reported cpus
    if (max) return Math.min(cpus, max)

    // os.cpus() reports 64 CPUs on CI but we're only allocated 2
    return process.env['CI'] ? CI_ALLOC_CPUS : cpus
}
