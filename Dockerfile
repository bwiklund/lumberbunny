FROM node:11-alpine
WORKDIR /code

ADD package.json .
RUN npm install

ADD . .

CMD ["npm", "start"]