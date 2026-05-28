-- Migration: Add site_settings table
-- Run this in Supabase SQL Editor if needed

CREATE TABLE IF NOT EXISTS "site_settings" (
  "id"        TEXT NOT NULL,
  "section"   TEXT NOT NULL,
  "key"       TEXT NOT NULL,
  "value"     TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "site_settings_section_key_key" UNIQUE ("section", "key")
);
