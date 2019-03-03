FROM node:8.11.3

LABEL vendor="iokloud.com"
LABEL com.iokloud.author="Hadi Mahdavi"

ENV ROOTPATH=/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR $ROOTPATH

COPY package.json .

RUN npm install

COPY . .

USER  node



