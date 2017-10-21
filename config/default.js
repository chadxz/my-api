"use strict";

module.exports = {
  myApi: {
    port: 3000,
    environment: "development",
    redis: {
      port: 6379,
      host: "localhost",
      password: "",
      url: "" // optional, useful for environments like Heroku that provide urls
    },
    lastfm: {
      apiKey: "",
      user: "chadxz"
    },
    pinboard: {
      apiToken: ""
    },
    pocket: {
      consumerKey: ""
    },
    session: {
      secret: "asldfkjawelgkawjelfsdkvjalkwjvlawkhnaw4elgnava0239fna0239nsdv"
    },
    auth: {
      password: "foo"
    },
    sentry: {
      dsn: ""
    }
  }
};
