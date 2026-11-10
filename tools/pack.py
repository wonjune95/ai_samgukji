#!/usr/bin/env python3
"""GLB 팩을 gzip·base64로 압축해 게임 소스 조각으로 만든다. 사용: pack.py in.glb src/05y-pack.js"""
import sys,gzip,base64
raw=open(sys.argv[1],'rb').read();b=base64.b64encode(gzip.compress(raw,9)).decode()
open(sys.argv[2],'w').write('const GLB_PACK="'+b+'";\n');print(len(raw)//1024,'KB ->',len(b)//1024,'KB')
