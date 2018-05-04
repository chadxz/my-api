"use strict";

module.exports = {
  myApi: {
    port: "PORT",
    environment: "NODE_ENV",
    lastfm: {
      apiKey: "LASTFM_API_KEY"
    },
    pinboard: {
      apiToken: "PINBOARD_API_TOKEN"
    },
    redis: {
      url: "REDIS_URL"
    },
    pocket: {
      consumerKey: "POCKET_CONSUMER_KEY"
    },
    auth: {
      password: "AUTH_PASSWORD"
    },
    sentry: {
      dsn: "SENTRY_DSN"
    },
    heroku: {
      slug: "HEROKU_SLUG_COMMIT"
    }
  }
};
