FROM node:8.11.3

# disable npm update check
ENV NO_UPDATE_NOTIFIER 1

ENV DUMB_INIT_VERSION 1.2.0

RUN mkdir -p /usr/src/app && \
    chown -R node:node /usr/src/app && \
    curl -sSLo /usr/local/bin/dumb-init \
      https://github.com/Yelp/dumb-init/releases/download/v${DUMB_INIT_VERSION}/dumb-init_${DUMB_INIT_VERSION}_amd64 && \
    chmod +x /usr/local/bin/dumb-init

USER node
WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/
RUN npm install --silent

COPY . /usr/src/app

EXPOSE 3000

ENTRYPOINT [ "/usr/local/bin/dumb-init", "--"]
CMD [ "node", "server.js" ]
