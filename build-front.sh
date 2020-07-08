#!/usr/bin/env bash

! command -v html-minifier >/dev/null && npm install --global html-minifier
! command -v cssnano >/dev/null && npm install --global cssnano-cli
! command -v terser >/dev/null && npm install --global terser

minifyHTML() {
    local input="$1"
    local output="$2"
    html-minifier \
        --collapse-whitespace \
        --remove-comments \
        --remove-redundant-attributes \
        --remove-script-type-attributes \
        --remove-tag-whitespace \
        --use-short-doctype \
        "$input" \
        -o "$output"
}

minifyCSS() {
    local input="$1"
    local output="$2"
    cssnano "$input" "$output"
}

minifyJS() {
    local input="$1"
    local output="$2"
    terser -c -m -e -o "$output" -- "$input"
}

[[ ! -d frontend/dist ]] && mkdir -p frontend/dist

minifyHTML frontend/index.html frontend/dist/index.html

minifyCSS frontend/style.css frontend/dist/style.css

minifyJS frontend/index.js frontend/dist/index.js

cp frontend/favicon* frontend/dist/

ls -l frontend/dist

git subtree push --prefix frontend/dist origin gh-pages
