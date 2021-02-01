import { base } from './configs/base'
import { node } from './configs/node'
import { react } from './configs/react'
import { cjsDefault } from './rules/cjsDefault'
import { fakeServer } from './rules/fakeServer'
import { importBlacklist } from './rules/importBlacklist'
import { noAllowConsole } from './rules/noAllowConsole'
import { noAsync } from './rules/noAsync'
import { noJsxIdAttrs } from './rules/noJsxIdAttrs'
import { noReactPropTypes } from './rules/noReactPropTypes'
import { noRootArrowFn } from './rules/noRootArrowFn'
import { reactLink } from './rules/reactLink'
import { testSuiteName } from './rules/testSuiteName'

export const configs = {
    base,
    node,
    react,
}
export const rules = {
    'cjs-default': cjsDefault,
    'fake-server': fakeServer,
    'import-blacklist': importBlacklist,
    'no-allow-console': noAllowConsole,
    'no-async': noAsync,
    'no-jsx-id-attrs': noJsxIdAttrs,
    'no-react-proptypes': noReactPropTypes,
    'no-root-arrow-fn': noRootArrowFn,
    'react-link': reactLink,
    'test-suite-name': testSuiteName,
}
