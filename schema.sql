-- 学习清单 v7 · 数据库结构
-- 目标环境：WorkBuddy 云服务（PostgreSQL）
-- 应用 ID：wbapp_VhwZMNS1PhCN2qpGcWTv6k
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
-- 与既有线上库的差异（v6 → v7）
--   todos 已存在时只需补两列：
--     ALTER TABLE public.todos ADD COLUMN priority BOOLEAN NOT NULL DEFAULT false;
--     ALTER TABLE public.todos ADD COLUMN notes    TEXT    NOT NULL DEFAULT '';
-- ============================================================
