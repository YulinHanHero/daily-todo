# 学习清单 · Daily Todo

一个面向学生的待办事项管理应用。**单文件 HTML + WorkBuddy 云数据库**，无需构建工具，克隆下来直接就能跑。

🌐 线上应用：<https://daily-todo-16347.app.workbuddy.host/?sharecode=DTVQOPGVE7>

---

## 功能

| 模块 | 说明 |
|---|---|
| **三视图** | 日 / 周 / 月。点月视图任意日期可跳转到那一天 |
| **任务详情编辑** | 点任意任务打开面板：改标题、截止日期、科目、重复星期、备注、优先级 |
| **优先级星标** | 一键标星，重要任务带红色左边框，可置顶排序 |
| **搜索** | 按标题或备注模糊匹配 |
| **科目筛选** | 按科目过滤，chip 只显示当前范围内有任务的科目 |
| **多种排序** | 默认 / 重要优先 / 截止日期 / 创建时间 / 标题 |
| **批量操作** | 开启「批量」多选，批量标记完成或批量删除 |
| **删除撤销** | 删除后 6 秒内可撤销，防手滑 |
| **自定义科目** | 内置 5 个（语文/数学/英语/科学/其他）之外可新增带颜色的科目，跨设备同步 |
| **批量粘贴解析** | 粘贴整段作业，自动按「语:1.」「2、」这类前缀与编号拆成多条任务并打科目标签 |
| **统计视图** | 本月完成率、连续打卡天数、近 7 天完成趋势、各科目任务量分布 |
| **深色模式** | 右上角切换，选择被记住，全站配色随 CSS 变量联动 |
| **登录** | 手机验证码 / 密码 / 微信三种方式，数据按用户隔离 |

---

## 目录结构

```
daily-todo/
├── index.html              # 部署产物（单文件，含内联 CSS/JS）
├── public-config.json      # 云服务配置（构建时注入，业务代码不硬编码）
├── preview.html            # 本地预览页：内置 mock 云服务与样例数据，无需登录
├── schema.sql              # 数据库结构 + RLS 策略，可在新环境一键还原
├── build.py                # 构建脚本：blocks/ → index.html
├── template.html           # 页面骨架
├── selftest.template.html  # 离线自测用例（40 条断言）
├── build_selftest.py      # 自测页构建脚本
├── blocks/
│   ├── style.css           # 全部样式（CSS 变量驱动深色主题）
│   ├── body.html           # 页面结构
│   ├── app.js              # 全部逻辑
│   └── mock-cloud.js       # 仅自测/预览用：模拟云 SDK
├── .gitignore
└── .gitattributes
```

---

## 本地开发

源码在 `blocks/` 下，**改完重新构建**即可：

```bash
python build.py        # 生成 index.html
```

不要直接改 `index.html` —— 它是构建产物，会被覆盖。

### 换环境 / 换应用

云服务配置集中在 [`public-config.json`](public-config.json)，构建时由 `build.py`
注入到 `blocks/app.js` 的 `__PUBLIC_CONFIG__` 占位符。业务代码里不出现
`endpoint` / `publishableKey`，所以换应用只需：

1. 从 `workbuddy_cloud_service` 的返回里取新的 `publicConfig`
2. 更新 `public-config.json`
3. 重新 `python build.py` 并部署

> 云服务要求请求的 Origin 与应用域名**精确匹配**，因此域名和 `publishableKey`
> 必须成对来自同一个应用 —— 这也是把配置抽出来的原因。

### 预览（无需登录、无需网络）

直接用浏览器打开 `preview.html`。它内置了一个模拟云服务（`blocks/mock-cloud.js`）和一组样例数据，可以完整体验所有功能。

### 跑自测

```bash
# 终端 1
python -m http.server 8899 --bind 127.0.0.1

# 终端 2：构建自测页
python build_selftest.py

# 终端 3
chrome --headless=new --dump-dom --virtual-time-budget=20000 \
  "http://127.0.0.1:8899/selftest.html" | grep -A50 "TEST REPORT"
```

当前结果：**40/40 断言通过，0 个 JS 运行时错误**。

---

## 数据库

后端是 WorkBuddy 托管的 PostgreSQL，结构与 RLS 策略完整记录在 [`schema.sql`](schema.sql)。

| | |
|---|---|
| 应用 ID | `wbapp_2KdwIDWsJsXPsOA8kTQM4O` |
| 云服务资源 | `wbcs_hwM4JC4aKEmoXG0HERh7ry` |
| 数据面域名 | `https://daily-todo-16347.app.workbuddy.host` |

| 表 | 说明 |
|---|---|
| `todos` | 待办事项。`owner_id` 由 `auth.uid()` 自动填充，RLS 按用户隔离 |
| `subjects` | 用户自定义科目，同样按 `owner_id` 隔离 |

关键设计：
- `owner_id` 是 `TEXT`（`auth.uid()` 返回 text，不是 uuid），且带 `DEFAULT auth.uid()` —— 前端永远不发送它
- 写入后必须 `.select()` 读回，空数组代表 RLS 拦截了，不能当成功处理
- `id` 列是 `bigint`，PostgREST 可能返回字符串，查询前统一转数字（见 `numId()`）

> 数据库本身托管在 WorkBuddy 云服务上，不在本仓库里。`schema.sql` 用于在新环境重建结构。

---

## 技术说明

- **纯静态**：单个 HTML 文件，CSS 与 JS 全部内联，无构建依赖、无框架
- **云 SDK**：`@tencent-ai/workbuddy-cloud-sdk@dev`，通过 CDN `<script>` 引入，暴露全局 `WorkBuddyCloud`
- **数据访问**：supabase-js 风格的 PostgREST 客户端，`from().select().eq().order()` 链式查询
- **主题**：CSS 自定义属性 + `body.dark` 覆盖，切换只改一个 class

---

## 已知行为

- 重复任务在日/周视图按 `repeat_days` 展开成多条实例，**完成状态是整条任务共享的**（勾一次全部同步）
- 重复任务的展开遵循其真实周期 `[due_date, repeat_end]`；`repeat_end` 为空表示无限重复
- 各视图的计数口径一致：同一天的日视图条数 = 月视图该格徽标数
- 自定义科目名在 `(owner_id, name)` 上有唯一索引，重名会返回 `23505`，前端已做友好提示

---

## 许可

仅供个人学习使用。
