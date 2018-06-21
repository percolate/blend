const crypto = require('crypto')
const fs = require('fs')
const mime = require('mime-types')
const Promise = require('bluebird')
const S3 = require('./s3')
const { inspect } = require('util')
const { resolve } = require('path')
const { performance } = require('perf_hooks')
const { log } = require('./log')
const retry = require('async-retry')

const MD5CHKSUM = 'md5chksum'

module.exports = function(options = {}) {
    const {
        acl,
        cacheControl,
        contentTypeFallback,
        cwd,
        debug,
        force,
        path,
        s3,
        s3Key,
        skipChecksum,
    } = options

    const absPath = resolve(cwd || process.cwd(), path)
    if (!isFile(absPath)) return Promise.reject(new Error(`${absPath} must be a file`))
    if (!s3Key) return Promise.reject(new Error('s3Key is required'))
    if (!(s3 instanceof S3)) return Promise.reject(new Error('s3 must be instance of S3'))

    return Promise.join(
        checksum({ path: absPath }),
        verifyUpload({ s3, s3Key }),
        (checksum, { isUploaded, s3Checksum }) => {
            if (!force && isUploaded && s3Checksum) {
                if (checksum === s3Checksum) {
                    return `skipped: ${path}`
                } else if (!skipChecksum) {
                    return Promise.reject(
                        new Promise.OperationalError(`checksum error: ${path} (${checksum} vs ${s3Checksum})`)
                    )
                }
            }

            const request = {
                ACL: acl,
                CacheControl: cacheControl,
                ContentMD5: checksum,
                ContentType: mime.lookup(absPath) || contentTypeFallback,
                Key: s3Key,
                Metadata: { [MD5CHKSUM]: checksum },
            }
            return Promise.resolve(
                retry((bail, num) => doUpload({ s3, absPath, request, debug, path, s3Key, attempt: num }), {
                    minTimeout: 5 * 60 * 1000,
                    retries: 3,
                })
            )
        }
    )
}

function doUpload({ s3, absPath, request, debug, path, s3Key, attempt }) {
    const start = performance.now()
    if (attempt > 1) {
        log(`Uploading ${path} again, attempt: ${attempt}`)
    }

    return s3
        .upload({ Body: fs.createReadStream(absPath), ...request })
        .then(response => {
            const details = debug ? `\n${inspect({ request, response })}\n` : ''
            return `success: ${path} -> ${s3.getPublicUrl({ Key: s3Key })}${details}`
        })
        .catch(e =>
            Promise.reject(new Promise.OperationalError(`code: ${e.code}, error: ${path} (${e.message})`))
        )
        .finally(() => {
            const end = performance.now()
            log(`Upload took ${end - start}ms`)
        })
}

function isFile(path) {
    try {
        return fs.statSync(path).isFile()
    } catch (e) {
        return false
    }
}

function verifyUpload({ s3, s3Key }) {
    return s3
        .fetchMetadata({ Key: s3Key })
        .then(metadata => ({
            isUploaded: true,
            s3Checksum: metadata[MD5CHKSUM],
        }))
        .catch(() => ({ isUploaded: false }))
}

function checksum({ path }) {
    return new Promise((resolve, reject) => {
        const md5 = crypto.createHash('md5')
        fs
            .createReadStream(path)
            .on('data', data => md5.update(data))
            .on('error', e => reject(e))
            .on('end', () => resolve(md5.digest('base64')))
    })
}
