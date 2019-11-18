# @percolate/s3

CI S3 file manager.
`@percolate/s3` uploads each file with checksum metadata.
This allows future uploads to be skipped and prevent accidental overrides.

```
S3 file manager

Examples:

    # Upload a direct except a single file
    s3 upload-dir ../build/ s3://my-bucket.com/path/to/s3/ --exclude=VERSION

    # Verify content was uploaded
    s3 list ../build/ s3://my-bucket.com/path/to/s3/

    # Force upload a single file (regardless of whether it exists)
    s3 upload-file ../build/VERSION s3://my-bucket.com/path/to/s3/VERSION --force --cache-control="no-store"

    # Ignore checksum
    s3 upload-file ../build/latest.html s3://my-bucket.com/path/to/s3/latest.html --skip-checksum --cache-control="no-store"

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
```

# Usage

```bash
yarn add @percolate/publisher --dev

# you'll need AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
npx s3 upload-dir dist/ s3://my-bucket.com/my_project/ --exclude=*.map

npx s3 -h
```

## Development

```sh
yarn watch
```

`yarn run` for all options.

---

[See root README.md](https://github.com/percolate/blend/blob/master/README.md)
