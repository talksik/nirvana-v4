FROM node:12

WORKDIR /app

COPY packages/core packages/core
COPY package.json .

RUN yarn install

COPY . .

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["yarn", "production"]