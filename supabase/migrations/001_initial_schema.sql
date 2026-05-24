-- ============================================================
-- momentum — schema inicial
-- ============================================================

-- ── Waitlist (migrar do JSON da landing) ────────────────────
CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        UNIQUE NOT NULL,
  plan       TEXT        DEFAULT 'unknown',  -- 'free' | 'pro' | 'unknown'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Projetos ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  repo_path        TEXT,
  description      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, repo_path)
);

-- ── Milestones ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS milestones (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL,
  description    TEXT,
  estimated_days INT         DEFAULT 7,
  completed      BOOLEAN     DEFAULT FALSE,
  sort_order     INT         DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tarefas ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID        NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  done         BOOLEAN     DEFAULT FALSE,
  done_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Check-ins ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkins (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID        REFERENCES milestones(id) ON DELETE SET NULL,
  note         TEXT,
  mood         SMALLINT    CHECK (mood BETWEEN 1 AND 5),  -- 1–5 opcional
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Configurações de usuário ────────────────────────────────
-- Apenas preferências de conta (NÃO api_key — fica local no keychain)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id       UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_provider  TEXT    DEFAULT 'anthropic',  -- 'anthropic' | 'openai' | 'google'
  plan          TEXT    DEFAULT 'free',        -- 'free' | 'pro'
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- projetos: só o dono vê e edita
CREATE POLICY "projects: owner only"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

-- milestones: herdado via projeto
CREATE POLICY "milestones: via projeto"
  ON milestones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = milestones.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- tasks: herdado via milestone → projeto
CREATE POLICY "tasks: via milestone"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM milestones
      JOIN projects ON projects.id = milestones.project_id
      WHERE milestones.id = tasks.milestone_id
        AND projects.user_id = auth.uid()
    )
  );

-- checkins: via projeto
CREATE POLICY "checkins: via projeto"
  ON checkins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = checkins.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- settings: só o próprio user
CREATE POLICY "settings: owner only"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Índices
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_projects_user      ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone    ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_checkins_project   ON checkins(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_email     ON waitlist(email);

-- ============================================================
-- Função: atualizar last_activity_at automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION update_project_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET last_activity_at = NOW()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER checkin_updates_activity
  AFTER INSERT ON checkins
  FOR EACH ROW EXECUTE FUNCTION update_project_activity();

CREATE TRIGGER task_done_updates_activity
  AFTER UPDATE OF done ON tasks
  FOR EACH ROW
  WHEN (NEW.done = TRUE AND OLD.done = FALSE)
  EXECUTE FUNCTION update_project_activity();
