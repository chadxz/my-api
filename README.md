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

### deployment

This app is currently being deployed to Openshift Online. It requires a
supporting redis instance, but both this app and redis can be run on Openshift
Online's free tier.

It can be seen at [https://my-api-my-api.193b.starter-ca-central-1.openshiftapps.com/](https://my-api-my-api.193b.starter-ca-central-1.openshiftapps.com/)
