"use strict";

module.exports = {
  redisKeys: {
    lastUpdated: "pinboardLastUpdated",
    posts: "pinboardPosts",
  },
  rateLimitsMS: {
    postsAll: 300000,
    postsRecent: 60000,
    defaultLimit: 3000,
  },
};
