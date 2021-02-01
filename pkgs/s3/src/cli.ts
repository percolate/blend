require('console.table')
import { forceExit, fs } from '@percolate/cli-utils'
import { docopt } from 'docopt'
import * as mm from 'micromatch'
import { resolve } from 'path'

import { parseS3Uri } from './parse_s3_uri'
import { S3 } from './s3'
import { IUploaderOpts, upload } from './upload'
import pMap = require('p-map')

const DOC = `S3 file manager

Examples:
    # Upload a directory except a single file
    s3 upload-dir ../build/ s3://my-bucket.com/path/to/s3/ --exclude=VERSION

    # Re-upload an existing file
    s3 upload-file ../build/VERSION s3://my-bucket.com/path/to/s3/VERSION --force

    # Ignore checksum
    s3 upload-file ../build/latest.html s3://my-bucket.com/path/to/s3/latest.html --skip-checksum --cache-control="no-store"

    # List uploaded content
    s3 list ../build/ s3://my-bucket.com/path/to/s3/

Usage:
    s3 del <s3-uri> [options]
    s3 list <s3-uri> [options]
    s3 upload-file <file> <s3-uri> [options]
    s3 upload-dir <dir> <s3-uri> [options]
    s3 -h | --help

Options:
    --acl=ACL                       Access control [default: public-read]
    --cache-control=STRING          Cache control is set to a year by default [default: public, max-age=31449600]
    --concurrency=NUM               Number of simultaneous uploads [default: 50]
    --content-type-fallback=STRING  When content type cannot be determined [default: application/octet-stream]
    --debug                         Output upload information
    --exclude=GLOB                  A glob pattern matching files to exclude
    --force                         Force upload
    --skip-checksum                 Overrides remote file when checksum is different
    --aws-access-key-id=STRING      The AWS access key ID or $AWS_ACCESS_KEY_ID
    --aws-secret-access-key=STRING  The AWS secret access key or $AWS_SECRET_ACCESS_KEY
`

type IOpts = {
    acl: string
    cacheControl: string
    concurrency: number
    contentTypeFallback: string
    debug: boolean
    exclude: string
    force: boolean
    s3: S3
    s3Key: string
    skipChecksum: boolean
}

export function s3Cli() {
    const args = docopt(DOC, {})
    const { bucket, s3Key } = parseS3Uri(args['<s3-uri>'])
    const s3 = new S3({
        accessKeyId: args['--aws-access-key-id'] || process.env.AWS_ACCESS_KEY_ID,
        bucket,
        secretAccessKey: args['--aws-secret-access-key'] || process.env.AWS_SECRET_ACCESS_KEY,
    })

    const opts: IOpts = {
        acl: args['--acl'],
        cacheControl: args['--cache-control'],
        concurrency: parseInt(args['--concurrency'], 10),
        contentTypeFallback: args['--content-type-fallback'],
        debug: args['--debug'],
        exclude: args['--exclude'],
        force: args['--force'],
        s3,
        s3Key,
        skipChecksum: args['--skip-checksum'],
    }

    if (args['upload-dir']) return uploadDir({ ...opts, dir: resolve(args['<dir>']) })
    if (args['upload-file']) return uploadFile({ ...opts, path: args['<file>'] })
    if (args.list) return listAll(opts)
    if (args.del) return deleteAll(opts)
}

async function uploadDir(
    opts: Omit<IUploaderOpts, 'path'> & {
        concurrency: number
        dir: string
        exclude?: string
    }
) {
    const { concurrency, dir, exclude, s3Key } = opts

    if (!fs.isDir(dir)) forceExit('<dir> must be a directory')

    const allFiles = fs.readDir(dir)
    const files = allFiles.filter(file => !(exclude && mm.any(file, exclude)))
    let successCount = 0
    const errors: string[] = []

    console.log(`Uploading files: ${files.length} (files excluded: ${allFiles.length - files.length})`)
    await pMap(
        files,
        path => {
            return upload({
                ...opts,
                cwd: dir,
                path,
                s3Key: [s3Key, path].join(s3Key.endsWith('/') ? '' : '/'),
            })
                .then(message => {
                    successCount++
                    console.log(message)
                })
                .catch(e => {
                    console.error(e)
                    errors.push(e.message)
                })
        },
        { concurrency }
    )
    const total = successCount + errors.length
    const message = `${successCount}/${total} uploaded`

    if (errors.length) {
        console.error(errors.join('\n'))
        forceExit(message)
    } else {
        console.log(message)
    }
}

function uploadFile(opts: IUploaderOpts) {
    return upload(opts)
        .then(message => console.log(message))
        .catch(e => forceExit(e.message))
}

function listAll(opts: { s3: S3; s3Key: string }) {
    const { s3, s3Key } = opts

    console.log('Listing...')

    return s3
        .listAll({ Prefix: s3Key })
        .then(results => {
            if (results.length) {
                console.table(
                    ['Key', 'Size', 'Last modified'],
                    results.map(({ Key, Size, LastModified }) => [Key, Size, LastModified])
                )
            }
            console.log(`Total: ${results.length}`)
        })
        .catch(e => forceExit(e.message))
}

function deleteAll(opts: { s3: S3; s3Key: string }) {
    const { s3, s3Key } = opts
    console.log('Deleting...')

    return s3
        .deleteAll({ Prefix: s3Key })
        .then(({ deletedCount, errorMessages }) => {
            console.log(`Deleted ${deletedCount}`)
            if (errorMessages.length) {
                forceExit(`Delete errors: ${errorMessages.join('\n')}`)
            }
        })
        .catch(e => forceExit(e.message))
}
