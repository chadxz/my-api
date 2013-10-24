This project is a work-in-progress proxy API that contains endpoints to retrieve 3rd-party data about services that I use.  Currently implemented services are:
- Pinboard

Services I plan to implement are:
- Twitter
- Pocket
- Last.fm
- Github

This API is used to access data about myself for display on my website at [chadmcelligott.com][]

###Setup

```shell
git clone https://github.com/chadxz/my-api
cd my-api
npm install
```

A [Redis][] server backend for persistent storage of data pulled from the various APIs is also required.

```shell
apt-get install redis-server
```
Finally, the API will require an API key for the various providers.  These should exist as environment variables, with the following names:

```shell
export PINBOARD_API_TOKEN=apitoken
```

###Run

```shell
npm start
```

###Deploy

To deploy the project to heroku, first download and install the [Heroku Toolkit][].  Then in the project directory, initialize a git remote for your heroku app.

```shell
heroku git:remote -a heroku-appname-1234
```

then add the environment variables to the heroku config

```shell
heroku config:set PINBOARD_API_TOKEN=apitoken
```
and finally push the application to heroku

```shell
git push heroku master
```

more information about deploying to Heroku can be found on the [Heroku website][].

[Redis]: http://redis.io
[chadmcelligott.com]: http://chadmcelligott.com
[Heroku Toolkit]: https://toolbelt.heroku.com
[Heroku website]: https://devcenter.heroku.com/articles/git
