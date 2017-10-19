"use strict";

module.exports = {
  redisKeys: {
    authorization: "pocketAuthorization",
    articles: "pocketArticles"
  },
  rateLimitMS: {
    userLimit: 12000, // 320 times per hour, ~5 times per minute
    consumerLimit: 500 // 10,000 times per hour, ~166 times per minute, ~2 times per second
  }
};
