const S3_URI_REGEXP = /^[sS]3:\/\/(.*?)\/(.*)/

module.exports = function parseS3Uri(uri) {
    const match = uri.match(S3_URI_REGEXP)
    if (!match) throw new Error(`Invalid <s3-uri>: ${uri} (ex. s3://my-bucket.com/path/to/dir/)`)

    const bucket = match[1]
    const s3Key = match[2]

    return { bucket, s3Key }
}
