import * as AWS from 'aws-sdk'
import chunk = require('lodash.chunk')
import * as url from 'url'
import pMap = require('p-map')

const MAX_RETRIES = 5
const MAX_DELETE = 1000
const DELETE_CONCURRENCY = 5

interface IS3Opts extends AWS.S3.ClientConfiguration {
    bucket: string
}

export class S3 {
    bucket: string
    client: AWS.S3

    constructor(opts: IS3Opts) {
        const { bucket, ...rest } = opts

        if (!bucket) throw new Error('A bucket a required')

        this.bucket = bucket
        this.client = new AWS.S3({
            apiVersion: '2006-03-01',
            maxRetries: MAX_RETRIES,
            ...rest,
        })
    }

    getPublicUrl(key: string) {
        return url.format({
            protocol: 'http:',
            hostname: `${this.bucket}.s3.amazonaws.com`,
            pathname:
                '/' + encodeURI(key).replace(/[!'()* ]/g, char => '%' + char.charCodeAt(0).toString(16)),
        })
    }

    listAll(
        options: Omit<AWS.S3.ListObjectsV2Request, 'Bucket'>,
        results: AWS.S3.Object[] = []
    ): Promise<AWS.S3.Object[]> {
        const _options = {
            Bucket: this.bucket,
            ...options,
        }
        return this.client
            .listObjectsV2(_options)
            .promise()
            .then(({ Contents, NextContinuationToken, IsTruncated }) => {
                return IsTruncated
                    ? this.listAll(
                          { ..._options, ContinuationToken: NextContinuationToken },
                          results.concat(Contents || [])
                      )
                    : results.concat(Contents || [])
            })
    }

    async deleteAll({ Prefix }: { Prefix: AWS.S3.ListObjectsV2Request['Prefix'] }) {
        const errorMessages: string[] = []
        let deletedCount = 0
        const results = await this.listAll({ Prefix })
        await pMap(
            chunk(results, MAX_DELETE),
            async objects => {
                const resp = await this.client
                    .deleteObjects({
                        Bucket: this.bucket,
                        Delete: {
                            Objects: objects.map(object => ({ Key: object.Key! })),
                        },
                    })
                    .promise()

                if (resp.Errors) {
                    errorMessages.push(...resp.Errors.map(({ Key, Message }) => `${Key} (${Message})`))
                }
                if (resp.Deleted) {
                    deletedCount += resp.Deleted.length
                }
            },
            { concurrency: DELETE_CONCURRENCY }
        )

        return {
            deletedCount,
            errorMessages,
        }
    }

    fetchMetadata({ Key }: { Key: string }) {
        return this.client
            .headObject({ Bucket: this.bucket, Key })
            .promise()
            .then(data => data.Metadata)
    }

    fetchBody(opts: Omit<AWS.S3.GetObjectRequest, 'Bucket'>) {
        return this.client
            .getObject({ Bucket: this.bucket, ...opts })
            .promise()
            .then(resp => (resp.Body ? `${resp.Body}` : ''))
    }

    upload(opts: Omit<AWS.S3.PutObjectRequest, 'Bucket'>) {
        return this.client.putObject({ Bucket: this.bucket, ...opts }).promise()
    }
}
