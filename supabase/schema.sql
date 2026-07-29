-- Schema SQL pour Supabase

create extension if not exists "uuid-ossp";

create table if not exists public.competition_records (
  id uuid not null primary key default uuid_generate_v4(),
  participant_type text not null check (participant_type in ('athlète', 'équipe')),
  participant_name text not null,
  sport_type text not null check (sport_type in ('sport individuel', 'sport collectif')),
  discipline text not null,
  competition_name text not null,
  competition_datetime timestamptz not null,
  location text not null,
  stage text not null check (stage in ('Qualifications','Huitièmes de finale','Quarts de finale','Demi-finales','Finale','Match pour la troisième place','Autre')),
  status text not null check (status in ('À venir','En cours','Terminée','Annulée')),
  result text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.competition_records enable row level security;

create policy "Sélectionner ses propres compétitions"
  on public.competition_records
  for select
  using (created_by = auth.uid());

create policy "Insérer une compétition"
  on public.competition_records
  for insert
  with check (created_by = auth.uid());

create policy "Mettre à jour sa compétition"
  on public.competition_records
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Supprimer sa compétition"
  on public.competition_records
  for delete
  using (created_by = auth.uid());
