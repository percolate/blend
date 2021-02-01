import { inspect } from 'util'
import { CommandModule } from 'yargs'

import { config } from '../config'
import { PROJECT_CONFIG } from '../constants'

export const configCmd: CommandModule = {
    command: 'config',
    describe: `Print \`${PROJECT_CONFIG}\` including defaults`,
    handler: () => {
        console.log(
            inspect(config, {
                colors: true,
                depth: 5,
                showHidden: false,
            })
        )
    },
}
