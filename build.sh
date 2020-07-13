#!/bin/bash
wasm-pack build -d static/js/wasm --target bundler
wasm-pack build -d static/js/wasm --target web
