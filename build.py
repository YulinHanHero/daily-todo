#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 blocks/ 下的片段组装成最终的单文件 index.html。

云服务配置从 public-config.json 读取并注入到 __PUBLIC_CONFIG__ 占位符，
业务代码里不硬编码 endpoint / publishableKey —— 换应用或换环境时只改这一个文件。

用法：python build.py
产物：index.html（可直接部署的静态站点入口）
"""
import io
import json
import os
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
BLOCKS = os.path.join(BASE, 'blocks')
TEMPLATE = os.path.join(BASE, 'template.html')
CONFIG = os.path.join(BASE, 'public-config.json')
OUT = os.path.join(BASE, 'index.html')


def read(path):
    with io.open(path, 'r', encoding='utf-8') as f:
        return f.read()


def build_public_config():
    """生成注入用的 publicConfig 声明。"""
    with io.open(CONFIG, 'r', encoding='utf-8') as f:
        cfg = json.load(f)
    required = ['resourceId', 'endpoint', 'oauthRelayBaseUrl', 'publishableKey']
    missing = [k for k in required if not cfg.get(k)]
    if missing:
        raise SystemExit('public-config.json 缺少字段: %s' % ', '.join(missing))
    lines = ['var publicConfig = {']
    for i, k in enumerate(required):
        comma = ',' if i < len(required) - 1 else ''
        lines.append("  %s: '%s'%s" % (k, cfg[k], comma))
    lines.append('}')
    return '\n'.join(lines)


def main():
    tpl = read(TEMPLATE)
    style = read(os.path.join(BLOCKS, 'style.css'))
    body = read(os.path.join(BLOCKS, 'body.html'))
    app = read(os.path.join(BLOCKS, 'app.js'))

    # 片段内部可能含有 </script> 之类会提前闭合脚本标签的字面量，做一次安全转义
    app = app.replace('</script>', '<\\/script>')

    html = (tpl
            .replace('__STYLE__', style)
            .replace('__BODY__', body)
            .replace('__APP__', app)
            .replace('__PUBLIC_CONFIG__', build_public_config()))

    with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
    print('built %s (%d bytes)' % (OUT, len(html.encode('utf-8'))))


if __name__ == '__main__':
    sys.exit(main())
