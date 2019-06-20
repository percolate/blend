const { workspaces } = require('./package.json')
module.exports = {
    babelrcRoots: workspaces,
    presets: [
        [
            '@babel/preset-env',
            {
                targets: { node: true },
            },
        ],
        '@babel/preset-typescript',
    ],
}
