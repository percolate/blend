declare namespace LcovParse {
    type Detail = {
        block: string | number
        branch: string
        name: string
        line: number
        hit: number
        taken: number
    }

    type Section = {
        details: Detail[]
        found: number
        hit: number
    }

    type LcovResults = {
        title: string
        file: string
        functions: Section
        lines: Section
        branches: Section
    }

    interface IApi {
        (file: string, cb?: (err: string, res: LcovResults[]) => void): void
    }
}

declare const LcovParse: LcovParse.IApi
declare module 'lcov-parse' {
    export = LcovParse
}
