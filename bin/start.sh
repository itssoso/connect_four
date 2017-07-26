#!/bin/bash

npm install
npm run grunt

case "$OSTYPE" in
    darwin*)
        open ./dist/index.html
        ;;
    msys*)
        start ./dist/index.html
        ;;
    *)
        echo "Not Supported. Open ./dist/index.html manually"
        ;;
esac
