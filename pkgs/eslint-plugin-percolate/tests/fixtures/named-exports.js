const a = 1
const b = 2

export { a, b }

const c = 3
export { c as d }

export class ExportedClass {}

// destructuring exports
export const { destructuredProp } = {}
export const [arrayKeyProp] = []
export const [{ deepProp }] = []
export const {
    arr: [, , deepSparseElement],
} = {}
