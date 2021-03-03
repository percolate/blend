declare module 'lcov-parse' {
    export type LcovResults = {
        title: string
        file: string
        functions: any
        lines: any
    }

    export default function parse(file: string, cb?: (err: string, res: LcovResults[]) => void): void
}
