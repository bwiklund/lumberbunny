FROM node:11-alpine
WORKDIR /code

ADD package.json .
RUN yarn

ADD . .

CMD ["yarn", "start"]