import { fs } from '@percolate/cli-utils'
import * as crypto from 'crypto'
import { createReadStream } from 'fs'
import * as mime from 'mime-types'
import { resolve } from 'path'
import { performance } from 'perf_hooks'
import { inspect } from 'util'

import { S3 } from './s3'

const MD5CHKSUM = 'md5chksum'

export interface IUploaderOpts {
    acl: string
    cacheControl: string
    contentTypeFallback: string
    cwd?: string
    debug: boolean
    exclude: string
    force: boolean
    path: string
    s3: S3
    s3Key: string
    skipChecksum: boolean
}

export async function upload(options: IUploaderOpts) {
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
    if (!fs.isFile(absPath)) throw new Error(`${absPath} must be a file`)
    if (!s3Key) throw new Error('s3Key is required')
    if (!(s3 instanceof S3)) throw new Error('s3 must be instance of S3')

    const checksum = await getChecksum({ path: absPath })
    const { isUploaded, s3Checksum } = await verifyUpload({ s3, s3Key })

    if (!force && isUploaded && s3Checksum) {
        if (checksum === s3Checksum) {
            return `skipped: ${path} -> ${s3.getPublicUrl(s3Key)}`
        } else if (!skipChecksum) {
            throw new Error(`checksum error: ${path} -> ${s3.getPublicUrl(s3Key)}`)
        }
    }

    const start = performance.now()
    const request = {
        ACL: acl,
        CacheControl: cacheControl,
        ContentMD5: checksum,
        ContentType: mime.lookup(absPath) || contentTypeFallback,
        Key: s3Key,
        Metadata: { [MD5CHKSUM]: checksum },
    }

    function timing() {
        return (performance.now() - start).toFixed(2)
    }

    return s3
        .upload({ Body: createReadStream(absPath), ...request })
        .then(response => {
            const details = debug ? `\n${inspect({ request, response })}\n` : ''
            return `success: ${path} -> ${s3.getPublicUrl(s3Key)} ${timing()}ms ${details}`
        })
        .catch((e: AWS.AWSError) => {
            throw new Error(`error (${e.code}) ${timing()}ms: ${path} (${e.message})`)
        })
}

function verifyUpload({
    s3,
    s3Key,
}: {
    s3: S3
    s3Key: string
}): Promise<{ isUploaded: boolean; s3Checksum?: string }> {
    return s3
        .fetchMetadata({ Key: s3Key })
        .then(metadata => ({
            isUploaded: true,
            s3Checksum: metadata![MD5CHKSUM],
        }))
        .catch(() => ({
            isUploaded: false,
        }))
}

function getChecksum({ path }: { path: string }) {
    return new Promise<string>((success, error) => {
        const md5 = crypto.createHash('md5')
        createReadStream(path)
            .on('data', data => md5.update(data))
            .on('error', e => error(e))
            .on('end', () => success(md5.digest('base64')))
    })
}
