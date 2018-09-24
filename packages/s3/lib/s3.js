const AWS = require('aws-sdk')
const chunk = require('lodash.chunk')
const Promise = require('bluebird')
const url = require('url')

AWS.config.setPromisesDependency(Promise)

const MAX_RETRIES = 5
const MAX_DELETE = 1000
const DELETE_CONCURRENCY = 5

class S3 {
    constructor(opts = {}) {
        const { bucket, ...rest } = opts

        if (!bucket) throw new Error('A bucket a required')

        this.bucket = bucket
        this.client = new AWS.S3({
            apiVersion: '2006-03-01',
            maxRetries: MAX_RETRIES,
            ...rest,
        })
    }

    getPublicUrl({ Key }) {
        return url.format({
            protocol: 'http:',
            hostname: `${this.bucket}.s3.amazonaws.com`,
            pathname:
                '/' + encodeURI(Key).replace(/[!'()* ]/g, char => '%' + char.charCodeAt(0).toString(16)),
        })
    }

    listAll(options, results = []) {
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
                          results.concat(Contents)
                      )
                    : results.concat(Contents)
            })
    }

    deleteAll({ Prefix }) {
        return this.listAll({ Prefix }).then(results =>
            Promise.map(
                chunk(results, MAX_DELETE),
                objects =>
                    this.client
                        .deleteObjects({
                            Bucket: this.bucket,
                            Delete: {
                                Objects: objects.map(object => ({ Key: object.Key })),
                            },
                        })
                        .promise(),
                { concurrency: DELETE_CONCURRENCY }
            ).then(responses => {
                const errors = responses.reduce((output, { Errors }) => output.concat(Errors), [])
                const deleted = responses.reduce((output, { Deleted }) => output.concat(Deleted), [])
                if (errors.length) {
                    return Promise.reject(
                        new Promise.OperationalError(
                            responses.map(({ Key, Message }) => `error: ${Key} (${Message})`)
                        )
                    )
                }

                return deleted.length
            })
        )
    }

    fetchMetadata({ Key }) {
        return this.client
            .headObject({ Bucket: this.bucket, Key })
            .promise()
            .then(data => data.Metadata)
            .catch(e => {
                if (e.name === 'NoSuchKey' || e.name === 'NotFound') {
                    return Promise.reject(new Promise.OperationalError('NotFound'))
                }
                throw e
            })
    }

    fetchBody(opts) {
        return this.client
            .getObject({ Bucket: this.bucket, ...opts })
            .promise()
            .then(resp => resp.Body)
            .catch(e => {
                if (e.name === 'NoSuchKey') {
                    return Promise.reject(new Promise.OperationalError('NotFound'))
                }
                throw e
            })
    }

    upload(opts) {
        return this.client.putObject({ Bucket: this.bucket, ...opts }).promise()
    }
}

module.exports = S3
