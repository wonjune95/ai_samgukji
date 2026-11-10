#!/bin/sh
# release.tgz를 /opt/ai-samgukji에 배포합니다. /healthz가 응답하지 않으면 직전 버전으로 되돌립니다.
# 사용: sudo sh deploy/deploy.sh release.tgz
set -eu
TGZ=$1
APP=/opt/ai-samgukji
NEW=$APP.new
PREV=$APP.prev

healthy() {
  i=0
  while [ "$i" -lt 40 ]; do
    [ "$(curl -s -m 2 http://127.0.0.1:8080/healthz || true)" = ok ] && return 0
    sleep 0.5
    i=$((i + 1))
  done
  return 1
}

rm -rf "$NEW"
mkdir -p "$NEW"
tar xzf "$TGZ" -C "$NEW" --no-same-owner
[ -f "$NEW/dist/index.html" ] && [ -f "$NEW/server/server.js" ]
# 의존성의 설치 스크립트는 root로 실행되지 않게 막는다
(cd "$NEW/server" && npm ci --omit=dev --ignore-scripts --no-audit --no-fund --silent)
chown -R root:root "$NEW"
chmod -R a+rX "$NEW"

rm -rf "$PREV"
mv "$APP" "$PREV"
mv "$NEW" "$APP"
systemctl restart ai-samgukji
if healthy; then
  echo "배포 완료"
  exit 0
fi
echo "응답 없음: 직전 버전으로 되돌립니다" >&2
journalctl -u ai-samgukji --no-pager -n 30 >&2 || true
rm -rf "$APP"
mv "$PREV" "$APP"
systemctl restart ai-samgukji
exit 1
