#!/bin/bash
set -e

NAME=game_of_life_wasm
WASM_DIR_NAME=wasm
WASM_BUILD_DIR=static/js/"$WASM_DIR_NAME"

./build.sh

[ -d export ] && rm -r export
mkdir export
mkdir export/css
mkdir export/js
mkdir export/errors

mkdir export/bootstrap
mkdir export/bootstrap/css
mkdir export/bootstrap/js

cp static/*.html export/
cp static/css/*.css export/css/
cp static/js/*.js export/js/
cp static/errors/*.html export/errors

cp static/bootstrap/css/*.min.css export/bootstrap/css/
cp static/bootstrap/js/*.min.js export/bootstrap/js/

mkdir export/js/"$WASM_DIR_NAME"
cp "$WASM_BUILD_DIR"/"$NAME".js "$WASM_BUILD_DIR"/"$NAME"_bg.wasm export/js/"$WASM_DIR_NAME"/

brotli -k export/*.html
brotli -k export/errors/*.html
brotli -k export/css/*.css
brotli -k export/js/*.js
brotli -k export/js/"$WASM_DIR_NAME"/*.wasm
brotli -k export/js/"$WASM_DIR_NAME"/*.js

brotli -k export/bootstrap/css/*.css
brotli -k export/bootstrap/js/*.js

gzip -k export/*.html
gzip -k export/errors/*.html
gzip -k export/css/*.css
gzip -k export/js/*.js
gzip -k export/js/"$WASM_DIR_NAME"/*.wasm
gzip -k export/js/"$WASM_DIR_NAME"/*.js

gzip -k export/bootstrap/css/*.css
gzip -k export/bootstrap/js/*.js

ssh projects "rm -r /var/www/testapp/web/*"
scp -r export/* projects:/var/www/testapp/web/