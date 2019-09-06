import * as yargs from 'yargs'
import { pushCmd } from './cli/push'
import { releaseCmd } from './cli/release'
import { sentryCliCmd } from './cli/sentryCli'

export default yargs
    .alias('h', 'help')
    .command(pushCmd)
    .command(releaseCmd)
    .command(sentryCliCmd)
    .demandCommand()
    .help()
    .recommendCommands()
    .strict()
    .wrap(120)
