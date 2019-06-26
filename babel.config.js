const { workspaces } = require('./package.json')
module.exports = {
    babelrcRoots: workspaces,
    extends: '@percolate/kona/configs/babel.ts-to-node.json',
}
