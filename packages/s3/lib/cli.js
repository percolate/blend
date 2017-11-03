require('console.table')
const docopt = require('docopt').docopt
const fs = require('fs')
const mm = require('micromatch')
const Promise = require('bluebird')
const readDir = require('fs-readdir-recursive')
const S3 = require('./s3')
const uploader = require('./uploader')
const { resolve } = require('path')

const DOC = `S3 file manager

This uploader errors on the side of safety and will not override existing files whos content is different.

Examples:

    # Upload a direct except a single file
    s3 upload-dir ../build/ s3://my-bucket.com/path/to/s3/ --exclude=VERSION

    # Verify content was uploaded
    s3 list ../build/ s3://my-bucket.com/path/to/s3/

    # Override a single file
    s3 upload-file ../build/VERSION s3://my-bucket.com/path/to/s3/VERSION --force --cache-control="no-store"

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
const S3_URI_REGEXP = /^[sS]3:\/\/(.*?)\/(.*)/

module.exports = function() {
    const args = docopt(DOC)
    const match = args['<s3-uri>'].match(S3_URI_REGEXP)
    if (!match) throw new Error(`Invalid <s3-uri>: ${args['<s3-uri>']} (ex. s3://my-bucket.com/path/to/dir/)`)

    const bucket = match[1]
    const s3Key = match[2]

    const s3 = new S3({
        accessKeyId: args['--aws-access-key-id'] || process.env.AWS_ACCESS_KEY_ID,
        bucket,
        secretAccessKey: args['--aws-secret-access-key'] || process.env.AWS_SECRET_ACCESS_KEY,
    })

    const opts = {
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

function uploadDir(opts) {
    const { concurrency, dir, exclude, s3Key } = opts

    if (!fs.existsSync(dir)) forceExit('<dir> does not exist')
    if (!fs.statSync(dir).isDirectory()) forceExit('<dir> must be a directory')

    const files = readDir(dir, file => {
        return !(file[0] === '.' || file === 'node_modules')
    }).filter(file => {
        const isExcluded = exclude && mm.any(file, exclude)
        if (isExcluded) log(`excluding: ${file}`)
        return !isExcluded
    })

    log(`Uploading files: ${files.length}`)

    return Promise.map(
        files,
        path => {
            return uploader({
                ...opts,
                cwd: dir,
                path,
                s3Key: [s3Key, path].join(s3Key.endsWith('/') ? '' : '/'),
            })
                .tap(message => log(message))
                .tapCatch(e => log(e.message))
                .reflect()
        },
        { concurrency }
    ).then(inspections => {
        const successCount = inspections.filter(inspection => inspection.isFulfilled()).length
        const total = inspections.length
        const message = `${successCount}/${total} uploaded`

        if (successCount < total) {
            forceExit(message)
        } else {
            log(message)
        }
    })
}

function uploadFile(opts) {
    return uploader(opts)
        .then(message => log(message))
        .catch(e => forceExit(e.message))
}

function listAll(opts) {
    const { s3, s3Key } = opts

    log('Listing...')

    return s3
        .listAll({ Prefix: s3Key })
        .then(results => {
            if (results.length) {
                // eslint-disable-next-line no-console
                console.table(
                    ['Key', 'Size', 'Last modified'],
                    results.map(({ Key, Size, LastModified }) => [Key, Size, LastModified])
                )
            }
            log(`Total: ${results.length}`)
        })
        .catch(e => forceExit(e.message))
}

function deleteAll(opts) {
    const { s3, s3Key } = opts
    log('Deleting...')

    return s3
        .deleteAll({ Prefix: s3Key })
        .then(total => log(`Deleted ${total}`))
        .catch(e => forceExit(e.message))
}

function log(message) {
    process.stdout.write(`${message}\n`)
}

function forceExit(message) {
    process.stderr.write(`${message}\n`)
    process.exit(1)
}
