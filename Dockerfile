# IMPORTANT: run from root of monolithic repo

FROM ubuntu

WORKDIR /app

COPY ./package.json .

COPY ./packages/api/package.json ./packages/api/

# copy the core private package
COPY ./packages/core ./packages/core
COPY ./packages/core/package.json ./packages/core/
# run and compile the core package
WORKDIR /app/packages/core
# todo: might not need this and just do from level higher
RUN yarn install

WORKDIR /app/packages/api

# copy all of the source code
COPY ./dist ./packages/api
RUN yarn install --production

# steps
# 1. compile all dependencies
# add the 