#!/bin/sh
# 빌드 결과와 서버 코드를 release.tgz 하나로 묶습니다.
set -eu
cd "$(dirname "$0")/.."
sh build.sh
tar czf release.tgz dist/index.html dist/vendor dist/icons server/package.json server/package-lock.json server/*.js
ls -l release.tgz
