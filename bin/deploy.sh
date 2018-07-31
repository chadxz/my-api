#!/usr/bin/env bash

set -e

: "${ZEIT_TOKEN:=}"

now --public --token=${ZEIT_TOKEN}
now alias --token=${ZEIT_TOKEN}
now rm my-api --safe --yes --token=${ZEIT_TOKEN}
