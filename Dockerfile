FROM mhart/alpine-node

RUN yarn install
RUN yarn build

EXPOSE 4000
