FROM node:18 as base

LABEL system="task-board"

WORKDIR /app
COPY . .

COPY package.json ./
RUN apt update && apt install -y vim
RUN ln -sf /bin/bash /bin/sh

RUN yarn set version berry
RUN yarn install

