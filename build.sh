#!/bin/bash

FILES=*.ts
for f in $FILES
do
  echo "Processing $f file..."
  deno bundle --unstable $f ${f//ts/js}
done
