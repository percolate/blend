import { CommandModule } from 'yargs'
import { execSync, git, forceExit, cleanExit } from '@percolate/cli-utils'
import * as AWS from 'aws-sdk'
import { PUSH_COMMIT, TAG_COMMIT_PREFIX, REGION, TAG_BRANCH_PREFIX, TAG_VERSION_PREFIX } from '../constants'
import { BRANCH_OPT, HASH_OPT, REPO_OPT } from './options'
import * as semverUtils from 'semver'

interface IPushOpts {
    branch: string
    fromArchive?: string
    hash: string
    image: string
    profile?: string
    region: string
    repo: string
    semver?: string
    service?: string
}

export const pushCmd: CommandModule<{ image: string }, IPushOpts> = {
    command: 'push <image>',
    describe: 'Push docker image to ECR',
    builder: argv => {
        return argv
            .option('branch', BRANCH_OPT)
            .option('fromArchive', {
                desc: 'Tar file path to load image from',
                type: 'string',
            })
            .option('hash', HASH_OPT)
            .option('profile', {
                desc: 'AWS profile',
                group: 'aws',
                type: 'string',
            })
            .option('region', {
                default: REGION,
                desc: 'AWS region',
                group: 'aws',
                required: true,
                type: 'string',
            })
            .option('repo', REPO_OPT)
            .option('semver', {
                desc: 'Semantic version to tag image with',
                type: 'string',
            })
    },
    handler: async (argv: IPushOpts) => {
        const { branch, image, profile, region, repo, semver } = argv
        const tag = getTag(argv)

        // validate semver
        if (semver && !semverUtils.valid(semver)) {
            return forceExit(`Invalid semver: ${semver}`)
        }

        // load optional image archive
        if (argv['fromArchive']) execSync(`docker load --input ${argv['fromArchive']}`, { verbose: true })

        // make sure local image exists
        execSync(`docker inspect ${image} > /dev/null`, { verbose: true })

        let credentials: undefined | AWS.SharedIniFileCredentials
        if (profile) {
            // only way to load `~/.aws/config|credentials`
            process.env['AWS_SDK_LOAD_CONFIG'] = 'true'
            credentials = new AWS.SharedIniFileCredentials({ profile })
        }
        const ecr = new AWS.ECR({
            apiVersion: '2015-09-21',
            credentials,
            region, // important: aws-sdk does not support config profiles (only credentials)
        })

        // make sure repo exists
        const { repositories } = await ecr
            .describeRepositories({ repositoryNames: [repo] })
            .promise()
            .catch((e: AWS.AWSError) => {
                return forceExit(
                    e.code === 'RepositoryNotFoundException'
                        ? `${e.message} (is --region=${region} correct?)`
                        : e
                )
            })
        const repoUri = repositories![0].repositoryUri
        if (!repoUri) return forceExit(`repositoryUri not found for ${repo}`)

        // verify that image hasn't been pushed
        const imagePushed = await ecr
            .describeImages({ repositoryName: repo, imageIds: [{ imageTag: tag }] })
            .promise()
            .then(() => true)
            .catch((e: AWS.AWSError) => {
                if (e.code === 'ImageNotFoundException') return false
                return forceExit(e)
            })
        if (imagePushed) {
            return cleanExit(`Image already pushed: ${repoUri}:${tag}`)
        }

        // login to docker and test credentials
        const { authorizationData } = await ecr
            .getAuthorizationToken()
            .promise()
            .catch(forceExit)
        if (!authorizationData || (authorizationData && !authorizationData![0])) {
            return forceExit('Unable to get authorization token')
        }
        const [username, password] = Buffer.from(authorizationData[0].authorizationToken!, 'base64')
            .toString('utf-8')
            .split(':')
        execSync(`docker login -u ${username} -p ${password} ${authorizationData[0].proxyEndpoint}`, {
            onError: e => forceExit(e.message.replace(password, '<REDACTED>')),
        })

        // prevent unecessary push on CI
        const isMaster = git.isMaster(branch)
        if (!isMaster && !git.getLastCommitMsg().includes(PUSH_COMMIT)) {
            return cleanExit(`To push image, include "${PUSH_COMMIT}" in your commit message`)
        }

        // push image to specific tag
        execSync(`docker tag ${image} ${repoUri}:${tag}`, { verbose: true })
        execSync(`docker push ${repoUri}:${tag}`, { verbose: true })

        // push image to latest tag
        if (isMaster) await pushLatest(ecr, repoUri, argv)
    },
}

function getTag({ branch, hash, semver }: IPushOpts) {
    if (semver) return TAG_VERSION_PREFIX + semver
    if (git.isMaster(branch)) return TAG_COMMIT_PREFIX + hash
    const cleanBranch = branch.replace(/[^a-zA-Z0-9_-]/g, '').replace('-', '_')
    return `${TAG_BRANCH_PREFIX}-${cleanBranch}-${hash}`
}

function getPrefixedValue(prefix: string, tags?: string[]) {
    if (!tags) return ''
    const imageTag = tags.find(tag => tag.startsWith(prefix))
    return imageTag ? imageTag.replace(prefix, '') : ''
}

async function pushLatest(ecr: AWS.ECR, repoUri: string, opts: IPushOpts) {
    const { hash, image, repo, semver } = opts
    const latestImageTags = await ecr
        .describeImages({ repositoryName: repo, imageIds: [{ imageTag: 'latest' }] })
        .promise()
        .then(result => {
            if (!result.imageDetails) return
            return result.imageDetails[0].imageTags
        })
        .catch((e: AWS.AWSError) => {
            if (e.code === 'ImageNotFoundException') return
            return forceExit(e)
        })

    if (semver) {
        // check if semver is newer than latest
        const latestVersion = getPrefixedValue(TAG_VERSION_PREFIX, latestImageTags)
        if (latestVersion && semverUtils.gt(latestVersion, semver)) {
            return cleanExit(`Newer version has already been push to ":latest" (${latestVersion})`)
        }
    } else {
        // check if current commit hash is an ancestor of the latest image commit hash
        const latestHash = getPrefixedValue(TAG_COMMIT_PREFIX, latestImageTags)
        if (latestHash) {
            execSync(`git merge-base --is-ancestor ${latestHash} ${hash}`, {
                onError: () => {
                    cleanExit(`Newer hash has already been push to ":latest" (${latestHash})`)
                },
            })
        }
    }

    // push image to latest
    execSync(`docker tag ${image} ${repoUri}:latest`, { verbose: true })
    execSync(`docker push ${repoUri}:latest`, { verbose: true })
}
