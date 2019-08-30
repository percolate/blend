FROM node:lts-alpine

WORKDIR /percolate/press

RUN apk add --no-cache docker git && \
    rm -rf /var/lib/apt/lists/*

# auth for private @percolate npm repo
ARG NPMJS_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPMJS_TOKEN}" >> ~/.npmrc

ARG VERSION
RUN yarn global add @percolate/cli-utils@${VERSION}
