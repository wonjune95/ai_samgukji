#!/bin/sh
# src 조각을 하나의 HTML로 합칩니다.
cd "$(dirname "$0")"
mkdir -p dist
{ cat src/00-head.html; echo '<script>'; cat src/0[1-9]*.js; echo '</script>'; } > dist/ai-samgukji.html
# 자체 서버 배포용: 문서 골격을 갖춘 index.html
{ printf '%s' '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0;font:14px system-ui;background:#05080c}[hidden]{display:none!important}</style></head><body>'; cat dist/ai-samgukji.html; printf '%s' '</body></html>'; } > dist/index.html
wc -c dist/ai-samgukji.html dist/index.html
