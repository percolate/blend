import * as micromatch from 'micromatch'
import { AddChange, Change, Chunk, DeleteChange, File } from 'parse-diff'

export type Addition = {
    from?: string
    to?: string
    lines: { [key: string]: Change }
    additions: number[]
}

export function filterAndMergeDiffAdditions(
    fileDiffs: File[],
    diff: { text: string; baseDir: string; filterGlobs: string[] }
) {
    const resultsNoDevNull = fileDiffs.filter(fileDiff => fileDiff.to && fileDiff.to !== '/dev/null')

    const resultsNoFiltered = resultsNoDevNull.filter(
        fileDiff =>
            !diff.filterGlobs.length || micromatch.some(fileDiff.to!, diff.filterGlobs, { matchBase: true })
    )

    const resultsGroupedByTo = resultsNoFiltered.reduce<{ [key: string]: File[] }>(
        (obj, fileDiff) => ({
            ...obj,
            [fileDiff.to!]: (obj[fileDiff.to!] || []).concat([fileDiff]),
        }),
        {}
    )

    const resultsMergedChanges = Object.entries(resultsGroupedByTo).reduce<{
        [key: string]: Addition
    }>(
        (obj, entry) => ({
            ...obj,
            [entry[0]]: mergeChanges(entry[1]),
        }),
        {}
    )

    const resultsWithAdditions = Object.entries(resultsMergedChanges).reduce<{
        [key: string]: Addition
    }>(
        (obj, entry) => ({
            ...obj,
            ...(entry[1].additions.length ? { [entry[0]]: entry[1] } : {}),
        }),
        {}
    )

    return resultsWithAdditions
}

function mergeChanges(fileDiffs: File[]) {
    const diff = fileDiffs[fileDiffs.length - 1]

    const changes = fileDiffs
        .reduce<Chunk[]>((arr, fileDiff) => arr.concat(fileDiff.chunks), [])
        .reduce<Change[]>((arr, chunk) => arr.concat(chunk.changes), [])
        .reduce<{ [key: number]: Change }>(reduceChanges, {})

    const lines = Object.entries(changes)
        .map(entry => {
            const [, change] = entry
            const line = change.type === 'normal' ? change.ln2 : change.ln
            return [line, change.content.substr(1)]
        })
        .reduce((obj, change) => ({ ...obj, [change[0]]: change[1] }), {})

    const additions = Object.entries(changes)
        .map<Change>(entry => entry[1])
        .filter((change): change is AddChange => change.type === 'add')
        .map(change => change.ln)

    return {
        from: diff.from,
        to: diff.to,
        lines,
        additions,
    }
}

function reduceChanges(
    result: { [key: number]: Change },
    change: Change,
    index: number,
    allChanges: Change[]
) {
    if (change.type === 'del') {
        return removeLineChange(result, change, index, allChanges)
    } else if (change.type === 'add' || (change.type === 'normal' && change.ln1 === change.ln2)) {
        return setLineChange(result, change)
    }
    return result
}

function setLineChange(result: { [key: number]: Change }, change: Change) {
    const line = change.type === 'normal' ? change.ln2 : change.ln
    result[line] = change
    return result
}

function removeLineChange(
    result: { [key: number]: Change },
    change: DeleteChange,
    index: number,
    allChanges: Change[]
) {
    const chunkChanges = allChanges.slice(index - change.ln + 1, index + 1)
    const shouldRemove = !chunkChanges.some(chunkChange => {
        const line = chunkChange.type === 'normal' ? chunkChange.ln2 : chunkChange.ln
        return line === change.ln
    })
    if (shouldRemove) {
        delete result[change.ln]
        return Object.entries(result).reduce((obj, entry) => {
            const [lineNumber, line] = entry
            const lineNumberInt = parseInt(lineNumber, 10)
            return {
                ...obj,
                [lineNumberInt < change.ln ? lineNumberInt : lineNumberInt - 1]: line,
            }
        }, {})
    }
    return result
}
