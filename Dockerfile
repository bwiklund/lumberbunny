FROM node:11-alpine
ADD . /code
WORKDIR /code
RUN npm install
CMD ["npm", "start"]