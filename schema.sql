-- 学习清单 v7 · 数据库结构
-- 目标环境：WorkBuddy 云服务（PostgreSQL）
-- 当前应用 ID：wbapp_2KdwIDWsJsXPsOA8kTQM4O
--   域名：https://daily-todo-16347.app.workbuddy.host
--   云服务资源：wbcs_hwM4JC4aKEmoXG0HERh7ry
--
-- 注意：本文件里的语句可重复执行（CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS），
--   但平台的 exec_sql 一次只能执行一条语句，请逐条执行。
--
-- 说明：
--   1. owner_id 由数据库用 auth.uid() 自动填充，前端不发送；
--      RLS 策略负责按用户隔离数据。
--   2. 每条语句单独执行（本平台的 exec_sql 不支持一次执行多语句）。
--   3. 幂等：CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS。

-- ============================================================
-- 表 1：todos（待办事项）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.todos (
  id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id    TEXT        NOT NULL DEFAULT auth.uid(),
  owner_name  TEXT,
  title       TEXT        NOT NULL DEFAULT '',
  done        BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date    DATE        NOT NULL DEFAULT CURRENT_DATE,
  repeat_days INTEGER[],                        -- ISO 星期：1=周一 .. 7=周日；NULL=不重复
  repeat_end  DATE,                             -- 重复结束日期；NULL=无限重复
  subject     TEXT,                             -- 科目 key：yuwen/shuxue/... 或自定义 c{id}
  priority    BOOLEAN     NOT NULL DEFAULT false,-- 重要标记
  notes       TEXT        NOT NULL DEFAULT ''    -- 备注
);

COMMENT ON TABLE public.todos IS '学习清单待办事项，按 owner_id 隔离';

CREATE INDEX IF NOT EXISTS todos_owner_due_idx ON public.todos (owner_id, due_date);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.todos TO authenticated, anon;

DROP POLICY IF EXISTS todos_read_own ON public.todos;
CREATE POLICY todos_read_own ON public.todos
  FOR SELECT TO authenticated, anon USING (owner_id = auth.uid());

DROP POLICY IF EXISTS todos_insert_own ON public.todos;
CREATE POLICY todos_insert_own ON public.todos
  FOR INSERT TO authenticated, anon WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS todos_update_own ON public.todos;
CREATE POLICY todos_update_own ON public.todos
  FOR UPDATE TO authenticated, anon
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS todos_delete_own ON public.todos;
CREATE POLICY todos_delete_own ON public.todos
  FOR DELETE TO authenticated, anon USING (owner_id = auth.uid());


-- ============================================================
-- 表 2：subjects（用户自定义科目）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id    TEXT        NOT NULL DEFAULT auth.uid(),
  name        TEXT        NOT NULL,
  color       TEXT        NOT NULL DEFAULT '#4f7cff',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subjects IS '用户自定义科目，按 owner_id 隔离';

CREATE UNIQUE INDEX IF NOT EXISTS subjects_owner_name_key ON public.subjects (owner_id, name);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subjects TO authenticated, anon;

DROP POLICY IF EXISTS subjects_read_own ON public.subjects;
CREATE POLICY subjects_read_own ON public.subjects
  FOR SELECT TO authenticated, anon USING (owner_id = auth.uid());

DROP POLICY IF EXISTS subjects_insert_own ON public.subjects;
CREATE POLICY subjects_insert_own ON public.subjects
  FOR INSERT TO authenticated, anon WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS subjects_update_own ON public.subjects;
CREATE POLICY subjects_update_own ON public.subjects
  FOR UPDATE TO authenticated, anon
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS subjects_delete_own ON public.subjects;
CREATE POLICY subjects_delete_own ON public.subjects
  FOR DELETE TO authenticated, anon USING (owner_id = auth.uid());


-- ============================================================
-- 表 3：profiles（用户自定义用户名/昵称）
-- ============================================================
-- 平台 SDK 不支持修改登录账号的 name，故用本表存用户可修改的用户名。
CREATE TABLE IF NOT EXISTS public.profiles (
  id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id    TEXT        NOT NULL DEFAULT auth.uid(),
  nickname    TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS '用户自定义用户名，每个 owner_id 一行';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_owner_key ON public.profiles (owner_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated, anon;

DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
CREATE POLICY profiles_read_own ON public.profiles
  FOR SELECT TO authenticated, anon USING (owner_id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated, anon WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated, anon
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own ON public.profiles
  FOR DELETE TO authenticated, anon USING (owner_id = auth.uid());


-- ============================================================
-- 表 4：todo_done_dates（重复任务按日期记录完成状态）
-- ============================================================
-- 重复任务用一条 todos 记录代表多个日期的实例，但 done 字段只能表达
-- 整条记录的完成状态，无法区分「周三完成、周五未完成」。
-- 故引入本表：重复任务某天勾选完成时，写入一行 (todo_id, done_date)；
-- 取消完成时删除对应行。非重复任务继续用 todos.done 字段。
CREATE TABLE IF NOT EXISTS public.todo_done_dates (
  id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  todo_id     BIGINT      NOT NULL,
  owner_id    TEXT        NOT NULL DEFAULT auth.uid(),
  done_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.todo_done_dates IS '重复任务按日期记录完成状态，owner_id 隔离';

CREATE UNIQUE INDEX IF NOT EXISTS todo_done_dates_todo_date_key ON public.todo_done_dates (todo_id, done_date);
CREATE INDEX IF NOT EXISTS todo_done_dates_owner_idx ON public.todo_done_dates (owner_id, done_date);

ALTER TABLE public.todo_done_dates ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.todo_done_dates TO authenticated, anon;

DROP POLICY IF EXISTS tdd_read_own ON public.todo_done_dates;
CREATE POLICY tdd_read_own ON public.todo_done_dates
  FOR SELECT TO authenticated, anon USING (owner_id = auth.uid());

DROP POLICY IF EXISTS tdd_insert_own ON public.todo_done_dates;
CREATE POLICY tdd_insert_own ON public.todo_done_dates
  FOR INSERT TO authenticated, anon WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS tdd_update_own ON public.todo_done_dates;
CREATE POLICY tdd_update_own ON public.todo_done_dates
  FOR UPDATE TO authenticated, anon
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS tdd_delete_own ON public.todo_done_dates;
CREATE POLICY tdd_delete_own ON public.todo_done_dates
  FOR DELETE TO authenticated, anon USING (owner_id = auth.uid());


-- ============================================================
-- 与 v6 旧库（wbapp_VhwZMNS1PhCN2qpGcWTv6k）的差异
--   v6 的 todos 表没有 priority / notes 两列。
--   若在旧库上升级，只需补这两列：
--     ALTER TABLE public.todos ADD COLUMN priority BOOLEAN NOT NULL DEFAULT false;
--     ALTER TABLE public.todos ADD COLUMN notes    TEXT    NOT NULL DEFAULT '';
--   旧库的用户历史数据不会自动迁移到新库。
-- ============================================================
