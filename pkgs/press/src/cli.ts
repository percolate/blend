import * as yargs from 'yargs'
import { pushCmd } from './cli/push'
import { releaseCmd } from './cli/release'

export default yargs
    .alias('h', 'help')
    .command(pushCmd)
    .command(releaseCmd)
    .demandCommand()
    .help()
    .recommendCommands()
    .strict()
    .wrap(120)
