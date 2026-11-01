# 学习清单 v7 — 改造说明

基于线上「今日待办」应用（`wbapp_VhwZMNS1PhCN2qpGcWTv6k`）的 v7 版本改造。

## 目录结构

```
daily-todo/
├── index.html              # 最终产物（单文件，含内联 CSS/JS，可直接部署）
├── preview.html            # 本地预览页（内置 mock 云服务 + 样例数据，无需登录即可看效果）
├── template.html           # 页面骨架模板
├── build.py                # 构建脚本：blocks/ → index.html
├── selftest.template.html  # 自测用例模板
└── blocks/
    ├── style.css           # 全部样式（含深色主题变量）
    ├── body.html           # 页面结构
    ├── app.js              # 全部逻辑
    └── mock-cloud.js       # 仅自测/预览用：模拟云 SDK
```

## 构建

```bash
python build.py     # 生成 index.html
```

改代码请改 `blocks/` 下的文件，然后重新执行构建；不要直接改 `index.html`（会被覆盖）。

## 数据库变更

应用 `wbapp_VhwZMNS1PhCN2qpGcWTv6k`，全部走 `workbuddy_cloudservice_db_exec_sql`：

| 变更 | 内容 |
|---|---|
| `todos` 加列 | `priority BOOLEAN NOT NULL DEFAULT false`、`notes TEXT NOT NULL DEFAULT ''` |
| 新建表 | `subjects`（id / owner_id / name / color / sort_order / created_at） |
| `subjects` 授权 | `GRANT SELECT, INSERT, UPDATE, DELETE TO authenticated, anon` |
| `subjects` RLS | 4 条 owner-only 策略（select / insert / update / delete） |
| 索引 | `subjects(owner_id, name)` 唯一、`todos(owner_id, due_date)` |

`todos` 原有列与策略未改动，历史数据不受影响。

## 新增功能

1. **任务详情与编辑** — 点击任意任务打开详情面板，可改标题、截止日期、科目、重复星期、备注、优先级，支持删除
2. **优先级星标** — 列表内一键标星/取消，重要任务带红色左边框并可置顶排序
3. **搜索** — 按标题或备注模糊匹配
4. **科目筛选** — 按科目 chip 过滤，只显示当前范围有任务的科目
5. **多种排序** — 默认 / 重要优先 / 截止日期 / 创建时间 / 标题
6. **批量操作** — 开启「批量」后多选，支持批量标记完成、批量删除
7. **删除撤销** — 删除后 6 秒内可撤销
8. **自定义科目** — 内置 5 个（语数英科其他），可新增带颜色的自定义科目，同步到 `subjects` 表、跨设备可见；批量粘贴作业时也能识别自定义科目名前缀
9. **统计视图** — 新增「统计」标签页：本月完成率、连续打卡天数、近 7 天趋势柱状图、各科目任务量分布
10. **深色模式** — 右上角切换，记忆到 localStorage，全站配色随主题变量联动

## 已知实现细节

- `id` 列是 `bigint`，PostgREST 可能返回字符串。所有按 id 的查询统一走 `numId()` 转数字，避免 `.eq()` / `.in()` 类型不匹配导致查不到行
- 重复任务在日/周视图按 `repeat_days` 展开成多条实例；完成状态是**整条任务共享**的（改一次全部同步），这是原有行为，未改
- `subjects` 表对自定义科目名建了 `(owner_id, name)` 唯一索引，重名会返回 23505，前端已做友好提示

## 自测

```bash
# 终端 1
cd daily-todo && python -m http.server 8899 --bind 127.0.0.1
# 终端 2：构建自测页并跑
python - <<'EOF'
import io
tpl=io.open('selftest.template.html','r',encoding='utf-8').read()
for f,k in [('blocks/style.css','__STYLE__'),('blocks/body.html','__BODY__'),('blocks/app.js','__APP__'),('blocks/mock-cloud.js','__MOCK__')]:
    tpl=tpl.replace(k, io.open(f,'r',encoding='utf-8').read().replace('</script>','<\\/script>'))
io.open('selftest.html','w',encoding='utf-8',newline='\n').write(tpl)
EOF
chrome --headless=new --dump-dom --virtual-time-budget=20000 "http://127.0.0.1:8899/selftest.html"
```

当前结果：**39/39 断言通过，0 个 JS 运行时错误**。
