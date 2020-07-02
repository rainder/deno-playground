#!/bin/bash

mkdir -p build

FILES=*.ts
for f in $FILES
do
  echo "Processing $f file..."
  deno bundle --unstable $f build/${f//ts/js}
done
