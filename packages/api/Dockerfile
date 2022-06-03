# IMPORTANT: run from root of monolithic repo
FROM ubuntu

WORKDIR /app

# The global package.json only contains build dependencies
COPY ./package.json .
COPY ./yarn.lock .

# copy the source coded needed for all dependencies
COPY ./packages/core packages/core
COPY ./packages/api packages/api

# run and compile the core package
WORKDIR /app/packages/core
# todo: might not need this and just do from level higher
RUN yarn install

WORKDIR /app/packages/api
RUN yarn install --production
RUN yarn build

CMD ["yarn", "start"]


# docker build -t talksik/nirvana-api:1.0
# docker run -p 5000:8080 -d  