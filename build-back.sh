#!/usr/bin/env bash

! command -v json >/dev/null && npm install --global json

VERSION="$(date +"%y.%m%d.%H%M")"

docker --context default build -t docker.pkg.github.com/vietduc01100001/theplayground/theplayground:"$VERSION" backend

docker --context default push docker.pkg.github.com/vietduc01100001/theplayground/theplayground:"$VERSION"

echo "docker.pkg.github.com/vietduc01100001/theplayground/theplayground:$VERSION"
