#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 blocks/ 下的三个片段组装成最终的单文件 index.html。

用法：python build.py
产物：index.html（可直接部署的静态站点入口）
"""
import io
import os
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
BLOCKS = os.path.join(BASE, 'blocks')
TEMPLATE = os.path.join(BASE, 'template.html')
OUT = os.path.join(BASE, 'index.html')


def read(path):
    with io.open(path, 'r', encoding='utf-8') as f:
        return f.read()


def main():
    tpl = read(TEMPLATE)
    style = read(os.path.join(BLOCKS, 'style.css'))
    body = read(os.path.join(BLOCKS, 'body.html'))
    app = read(os.path.join(BLOCKS, 'app.js'))

    # 片段内部可能含有 </script> 之类会提前闭合脚本标签的字面量，做一次安全转义
    app = app.replace('</script>', '<\\/script>')

    html = tpl.replace('__STYLE__', style).replace('__BODY__', body).replace('__APP__', app)
    with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
    print('built %s (%d bytes)' % (OUT, len(html.encode('utf-8'))))


if __name__ == '__main__':
    sys.exit(main())
