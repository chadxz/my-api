'use strict';

module.exports = {
  myApi: {
    port: 3000,
    redis: {
      port: 6379,
      host: 'localhost',
      password: '',
      url: '' // optional, useful for environments like Heroku that provide urls
    },
    lastfm: {
      apiKey: ''
    },
    pinboard: {
      apiToken: ''
    }
  }
};
