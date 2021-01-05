FROM node:14-alpine3.10

WORKDIR /app

EXPOSE 3000
CMD [ "npm", "start" ]