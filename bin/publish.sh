#!/bin/bash

publish_dir=bin/.publish

if ! grep -q '"name": "hindley-milner-parser-js"' package.json 2>/dev/null; then
  echo "error: please run from root of project"
  exit 1
fi

files=(
  LICENSE
  README.md
  package.json
  dist/hm-parser.js
)

rm -rf $publish_dir
mkdir $publish_dir

for file in "${files[@]}"; do
  if [[ -z $file ]]; then
    echo "error: file $file does not exist"
    exit 2
  fi
  cp $file $publish_dir
done

npm publish $publish_dir

