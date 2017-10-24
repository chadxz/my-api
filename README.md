# my-api

[![Build Status][Build Status Image]][Build Status Link]
[![Codecov][Codecov Image]][Codecov Link]
[![Greenkeeper Badge][Greenkeeper Image]][Greenkeeper Link]

A personal REST API used to cache api data and provide unauthenticated
programmatic access to data about me across various services that I use.

[Build Status Image]: https://travis-ci.org/chadxz/my-api.svg?branch=master
[Build Status Link]: https://travis-ci.org/chadxz/my-api
[Codecov Image]: https://img.shields.io/codecov/c/github/chadxz/my-api.svg
[Codecov Link]: https://codecov.io/gh/chadxz/my-api
[Greenkeeper Image]: https://badges.greenkeeper.io/chadxz/my-api.svg
[Greenkeeper Link]: https://greenkeeper.io/

Coming soon:

- Pocketcasts integration
- Revamp for ES7
- integrated website

### Enabled heroku addons and labs

```sh
# for sentry release tracking
$ heroku labs:enable runtime-dyno-metadata

# for sentry deploy notifications
$ heroku addons:create deployhooks:http --url <sentry-notify-url>

# for redis
$ heroku addons:create redistogo
```
