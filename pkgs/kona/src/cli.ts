import _yargs = require('yargs/yargs')
import { commitCmd } from './cli/commit'
import { configCmd } from './cli/config'
import { coverageCmd } from './cli/coverage'
import { lintCmd } from './cli/lint'
import { testCmd } from './cli/test'
import { tsCmd } from './cli/ts'
import { verifyCmd } from './cli/verify'

// command needs `<{}>` to prevent "TS4023"
/**
 * Kona's CLI can be extended by modifying this `yargs` object
 *
 * ```ts
 * import { yargs } from '@percolate/kona'
 * yargs.command(...).argv
 * ```
 * */
export const yargs = _yargs(process.argv.slice(2))
    .alias('h', 'help')
    .command<{}>(configCmd)
    .command<{}>(commitCmd)
    .command<{}>(coverageCmd)
    .command<{}>(lintCmd)
    .command<{}>(testCmd)
    .command<{}>(tsCmd)
    .command<{}>(verifyCmd)
    .demandCommand()
    .help()
    .recommendCommands()
    .strict()
    .version()
    .wrap(110)
