import _yargs from 'yargs'
import { commitCmd } from './cli/commit'
import { coverageCmd } from './cli/coverage'
import { lintCmd } from './cli/lint'
import { testCmd } from './cli/test'
import { tsCmd } from './cli/ts'
import { verifyCmd } from './cli/verify'

export const yargs = _yargs
    .alias('h', 'help')
    .command(commitCmd)
    .command(coverageCmd)
    .command(lintCmd)
    .command(testCmd)
    .command(tsCmd)
    .command(verifyCmd)
    .demandCommand()
    .help()
    .recommendCommands()
    .strict()
    .version()
    .wrap(110)
