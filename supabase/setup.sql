-- À exécuter dans l’éditeur SQL du projet Supabase Free.
-- Les contenus privés sont accessibles uniquement au serveur du site.
create table if not exists public.admin_records (
  kind text not null,
  key text not null,
  value jsonb not null,
  revision integer not null default 1,
  updated timestamptz not null default now(),
  primary key (kind, key)
);
alter table public.admin_records enable row level security;
-- Aucune politique de lecture/écriture anonyme ou utilisateur n’est ajoutée.

-- Ce bucket contient exclusivement les images et PDF du site public.
-- Les écritures passent par /api/admin/upload après connexion et contrôle du rôle.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 4194304,
  array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;
