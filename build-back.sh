#!/usr/bin/env bash

! command -v json >/dev/null && npm install --global json

VERSION="$(date +"%y.%m%d.%H%M")"

docker build -t docker.pkg.github.com/vietduc01100001/theplayground/theplayground:"$VERSION" backend

docker push docker.pkg.github.com/vietduc01100001/theplayground/theplayground:"$VERSION"

echo "docker.pkg.github.com/vietduc01100001/theplayground/theplayground:$VERSION"
