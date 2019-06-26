const extensions = ['.ts', '.tsx', '.js', '.jsx']

export const node = {
    settings: {
        'import/extensions': extensions,
        'import/resolver': {
            node: { extensions },
        },
    },
}
