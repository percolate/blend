FROM node:20-alpine

WORKDIR /percolate/press

RUN apk add --no-cache ca-certificates docker git openssh-client \
    && rm -rf /var/lib/apt/lists/*

# auth for private @percolate npm repo
ARG NPMJS_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPMJS_TOKEN}" >> ~/.npmrc

ARG VERSION
RUN yarn global add @percolate/press@${VERSION}
