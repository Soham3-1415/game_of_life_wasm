#!/bin/bash
set -e

NAME=game_of_life_wasm
WASM_DIR_NAME=wasm
WASM_BUILD_DIR=static/js/"$WASM_DIR_NAME"

wasm-pack build -d static/js/wasm --target web

[ -d export ] && rm -r export
mkdir export
mkdir export/css
mkdir export/js
mkdir export/errors

cp -r static/*.html export/
cp -r static/css/*.css export/css/
cp -r static/js/*.js export/js/
cp -r static/errors/*.html export/errors

mkdir export/js/"$WASM_DIR_NAME"
cp "$WASM_BUILD_DIR"/"$NAME".js "$WASM_BUILD_DIR"/"$NAME"_bg.wasm export/js/"$WASM_DIR_NAME"/

brotli -k export/*.html
brotli -k export/errors/*.html
brotli -k export/css/*.css
brotli -k export/js/*.js
brotli -k export/js/"$WASM_DIR_NAME"/*.wasm
brotli -k export/js/"$WASM_DIR_NAME"/*.js

gzip --best -k export/*.html
gzip --best -k export/errors/*.html
gzip --best -k export/css/*.css
gzip --best -k export/js/*.js
gzip --best -k export/js/"$WASM_DIR_NAME"/*.wasm
gzip --best -k export/js/"$WASM_DIR_NAME"/*.js

ssh projects "rm -r /var/www/testapp/web/*"
scp -r export/* projects:/var/www/testapp/web/