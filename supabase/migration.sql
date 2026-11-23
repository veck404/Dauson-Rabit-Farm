-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)

CREATE TABLE IF NOT EXISTS public.farm_data (
  id          TEXT        PRIMARY KEY DEFAULT 'singleton',
  version     INTEGER     NOT NULL DEFAULT 1,
  revision    INTEGER     NOT NULL DEFAULT 1,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  rabbits     JSONB       NOT NULL DEFAULT '[]',
  transactions JSONB      NOT NULL DEFAULT '[]',
  inventory   JSONB       NOT NULL DEFAULT '[]',
  breeding    JSONB       NOT NULL DEFAULT '[]',
  health      JSONB       NOT NULL DEFAULT '[]',
  tasks       JSONB       NOT NULL DEFAULT '[]'
);

-- Disable Row Level Security so the service role key can read/write freely.
-- If you later add user auth, revisit this and add RLS policies.
ALTER TABLE public.farm_data DISABLE ROW LEVEL SECURITY;
