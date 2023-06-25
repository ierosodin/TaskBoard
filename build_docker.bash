#!/bin/bash

while getopts v:m: option
do
    case "${option}"
    in
    v) VERSION=${OPTARG};;
    m) MODE=${OPTARG};;
    esac
done

VERSION=${VERSION:-"v1.0.0"}
MODE=${MODE:-"dev"}

echo $PWD/build/Dockerfile

docker build --rm -t task-board:${VERSION} . -f $PWD/build/Dockerfile # --no-cache

