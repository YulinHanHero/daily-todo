#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""构建离线自测页：把 blocks/ 与 public-config.json 注入 selftest.template.html。"""
import io, json, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
def read(p):
    with io.open(os.path.join(BASE, p), 'r', encoding='utf-8') as f: return f.read()

cfg = json.loads(read('public-config.json'))
keys = ['resourceId','endpoint','oauthRelayBaseUrl','publishableKey']
pub = '\n'.join(['var publicConfig = {'] +
    ["  %s: '%s'%s" % (k, cfg[k], ',' if i < len(keys)-1 else '') for i, k in enumerate(keys)] + ['}'])

tpl = read('selftest.template.html')
for f, k in [('blocks/style.css','__STYLE__'), ('blocks/body.html','__BODY__'),
             ('blocks/app.js','__APP__'), ('blocks/mock-cloud.js','__MOCK__')]:
    tpl = tpl.replace(k, read(f).replace('</script>', '<\\/script>'))
tpl = tpl.replace('__PUBLIC_CONFIG__', pub)
with io.open(os.path.join(BASE, 'selftest.html'), 'w', encoding='utf-8', newline='\n') as f:
    f.write(tpl)
print('built selftest.html')
