"use strict";
const url = require("url");
const tools = require("../tools");
const errors = require("../errors");
const { pick, orderBy, get } = require("lodash");
const request = require("request").defaults({
  json: true,
  timeout: 5000,
  headers: {
    // pocket servers choke unless these are set ¯\_(ツ)_/¯
    "X-Accept": "application/json",
    accept: "*"
  }
});
const apiBase = "https://getpocket.com/v3/";

/**
 * Constructs an instance of the PocketClient class, used to make API calls to the Pocket web API.
 *
 * @param {string} consumerKey Pocket consumer key
 * @class PocketClient
 */
function PocketClient(consumerKey) {
  if (!consumerKey) {
    throw new errors.RequiredParamMissingError("consumerKey", "string");
  }

  this.consumerKey = consumerKey;
}

/**
 * Fetch a request token from the pocket api, which begins the oauth flow for
 * obtaining an access_token to make requests to the pocket api on behalf of a user.
 *
 * @param {string} redirectUri The uri that the pocket website should redirect to
 *  once the user has granted or denied access
 * @param {function} callback signature (err, requestToken)
 * @memberof PocketService
 */
PocketClient.prototype.getRequestToken = function(redirectUri, callback) {
  if (!redirectUri) {
    callback(new errors.RequiredParamMissingError("redirectUri", "string"));
    return;
  }

  const options = {
    uri: url.resolve(apiBase, "oauth/request"),
    json: {
      consumer_key: this.consumerKey,
      redirect_uri: redirectUri
    }
  };

  request.post(options, function(err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (!tools.isOk(res.statusCode) || typeof body !== "object") {
      callback(new errors.UnexpectedServerResponseError(res));
      return;
    }

    callback(null, body.code);
  });
};

/**
 * Fetch an access token from the pocket api. Requires a requestToken previously
 * fetched using `getRequestToken`. This function can be called once the user has
 * been redirected to pocket with the requestToken to approve/deny access, and pocket
 * has redirected the user back to this application.
 *
 * @param {string} requestToken The request token retrieved using `getRequestToken`
 * @param {function} callback signature (err, authorization)
 *  `authorization` is an object with structure { access_token, username }
 * @memberof PocketService
 */
PocketClient.prototype.getAccessToken = function(requestToken, callback) {
  if (!requestToken) {
    callback(new errors.RequiredParamMissingError("requestToken", "string"));
    return;
  }

  const options = {
    uri: url.resolve(apiBase, "oauth/authorize"),
    json: {
      consumer_key: this.consumerKey,
      code: requestToken
    }
  };

  request.post(options, function(err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (!tools.isOk(res.statusCode) || typeof body !== "object") {
      callback(new errors.UnexpectedServerResponseError(res));
      return;
    }

    callback(null, body);
  });
};

/**
 * Retrieve all articles for the user, using the specified params.
 * For more details on params and result format, see the api docs @
 * https://getpocket.com/developer/docs/v3/retrieve
 *
 * @param {object} params
 * @param {string} params.access_token The access token to use to make the request on behalf
 *  of the user
 * @param {string} [params.state] (enum: 'unread', 'archive', 'all') filter by the state of the content
 * @param {string} [params.favorite] (enum: '0', '1') filter whether the content is favorited or not
 * @param {string} [params.tag] only return content tagged with the specified tag. Specify '_untagged_'
 *  to pull only content that is untagged.
 * @param {string} [params.contentType] (enum: 'article', 'video', 'image') the type of content to include
 *  in the results
 * @param {string} [params.sort] (enum: 'newest', 'oldest', 'title', 'site') sort order of the results
 * @param {string} [params.detailType] (enum: 'simple', 'complete') how much detail to include in
 *  the results
 * @param {string} [params.search] only return content whose title or url contain the search string
 * @param {string} [params.domain] only return content from a particular domain
 * @param {number} [params.since] only return content modified since the given since unix timestamp
 * @param {number} [params.count] only return `count` number of items
 * @param {number} [params.offset] used only with `count`; start results from `offset` position
 * @param {function} callback signature (err, articles)
 */
PocketClient.prototype.getArticles = function(params, callback) {
  if (!get(params, "access_token")) {
    callback(
      new errors.RequiredParamMissingError("params.access_token", "string")
    );
    return;
  }

  const whitelistedParams = [
    "access_token",
    "state",
    "favorite",
    "tag",
    "contentType",
    "sort",
    "detailType",
    "search",
    "domain",
    "since",
    "count",
    "offset"
  ];

  const options = {
    uri: url.resolve(apiBase, "get"),
    json: Object.assign(
      { consumer_key: this.consumerKey },
      pick(params, whitelistedParams)
    )
  };

  request.post(options, function(err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (
      !tools.isOk(res.statusCode) ||
      typeof body !== "object" ||
      typeof body.list !== "object"
    ) {
      callback(new errors.UnexpectedServerResponseError(res));
      return;
    }

    /*
     * `body.list` is essentially a hashmap with each value being an article.
     * Convert the hashmap to an array for easier consumption elsewhere.
     */
    let articles = Object.keys(body.list).map(function(key) {
      return body.list[key];
    });

    if (params.sort) {
      /*
       * Converting the "list" hashmap into an array using Object.keys() (as done above)
       * messes up the ordering, since Object.keys() does not guarantee any ordering of
       * returned keys. When a sort param is passed, perform the sort locally to make sure
       * that the results are in the requested order.
       */
      let sortField = "resolved_url";
      let sortOrder = "asc";

      if (params.sort === "newest") {
        sortField = "time_created";
        sortOrder = "desc";
      } else if (params.sort === "oldest") {
        sortField = "time_created";
        sortOrder = "asc";
      } else if (params.sort === "title") {
        sortField = "resolved_title";
        sortOrder = "asc";
      }

      articles = orderBy(articles, [sortField], [sortOrder]);
    }

    callback(null, articles);
  });
};

module.exports = PocketClient;
