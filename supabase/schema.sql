create extension if not exists "uuid-ossp";

create table if not exists public.sports (
  id uuid not null primary key default uuid_generate_v4(),
  nom text not null,
  categorie text not null check (categorie in ('Individuel', 'Collectif')),
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.athletes (
  id uuid not null primary key default uuid_generate_v4(),
  prenom text not null,
  nom text not null,
  sexe text not null check (sexe in ('Masculin', 'Féminin')),
  date_de_naissance date not null,
  nationalite text not null,
  numero_passeport text,
  telephone text,
  email text,
  sport_id uuid not null references public.sports(id) on delete restrict,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.equipes (
  id uuid not null primary key default uuid_generate_v4(),
  nom text not null,
  sport_id uuid not null references public.sports(id) on delete restrict,
  categorie text not null,
  entraineur text,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.officiels (
  id uuid not null primary key default uuid_generate_v4(),
  prenom text not null,
  nom text not null,
  fonction text not null,
  nationalite text not null,
  numero_passeport text,
  telephone text,
  email text,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competitions (
  id uuid not null primary key default uuid_generate_v4(),
  type_participant text not null check (type_participant in ('athlète', 'équipe', 'officiel')),
  athlete_id uuid references public.athletes(id) on delete set null,
  equipe_id uuid references public.equipes(id) on delete set null,
  officiel_id uuid references public.officiels(id) on delete set null,
  sport_id uuid not null references public.sports(id) on delete restrict,
  nom_competition text not null,
  date_heure timestamptz not null,
  lieu text not null,
  etape text not null check (etape in ('Qualifications','Huitièmes de finale','Quarts de finale','Demi-finales','Finale','Match pour la troisième place','Autre')),
  statut text not null check (statut in ('À venir','En cours','Terminée','Annulée')),
  resultat text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vols (
  id uuid not null primary key default uuid_generate_v4(),
  type_participant text not null check (type_participant in ('athlète', 'équipe', 'officiel')),
  athlete_id uuid references public.athletes(id) on delete set null,
  equipe_id uuid references public.equipes(id) on delete set null,
  officiel_id uuid references public.officiels(id) on delete set null,
  compagnie_aerienne text not null,
  numero_vol text not null,
  aeroport_depart text not null,
  aeroport_arrivee text not null,
  date_heure_depart timestamptz not null,
  date_heure_arrivee timestamptz not null,
  reference_reservation text,
  numero_siege text,
  remarques text,
  created_at timestamptz not null default now()
);

create table if not exists public.hebergements (
  id uuid not null primary key default uuid_generate_v4(),
  type_participant text not null check (type_participant in ('athlète', 'équipe', 'officiel')),
  athlete_id uuid references public.athletes(id) on delete set null,
  equipe_id uuid references public.equipes(id) on delete set null,
  officiel_id uuid references public.officiels(id) on delete set null,
  nom_hotel text not null,
  adresse text not null,
  ville text not null,
  pays text not null,
  date_arrivee date not null,
  date_depart date not null,
  numero_chambre text,
  remarques text,
  created_at timestamptz not null default now()
);

alter table public.sports enable row level security;
alter table public.athletes enable row level security;
alter table public.equipes enable row level security;
alter table public.officiels enable row level security;
alter table public.competitions enable row level security;
alter table public.vols enable row level security;
alter table public.hebergements enable row level security;

create policy "Sélectionner ses propres sports"
  on public.sports
  for select
  using (true);

create policy "Insérer un sport"
  on public.sports
  for insert
  with check (true);

create policy "Mettre à jour ses sports"
  on public.sports
  for update
  using (true)
  with check (true);

create policy "Supprimer ses sports"
  on public.sports
  for delete
  using (true);

create policy "Sélectionner ses propres athlètes"
  on public.athletes
  for select
  using (true);

create policy "Insérer un athlète"
  on public.athletes
  for insert
  with check (true);

create policy "Mettre à jour ses athlètes"
  on public.athletes
  for update
  using (true)
  with check (true);

create policy "Supprimer ses athlètes"
  on public.athletes
  for delete
  using (true);

create policy "Sélectionner ses propres équipes"
  on public.equipes
  for select
  using (true);

create policy "Insérer une équipe"
  on public.equipes
  for insert
  with check (true);

create policy "Mettre à jour ses équipes"
  on public.equipes
  for update
  using (true)
  with check (true);

create policy "Supprimer ses équipes"
  on public.equipes
  for delete
  using (true);

create policy "Sélectionner ses propres officiels"
  on public.officiels
  for select
  using (true);

create policy "Insérer un officiel"
  on public.officiels
  for insert
  with check (true);

create policy "Mettre à jour ses officiels"
  on public.officiels
  for update
  using (true)
  with check (true);

create policy "Supprimer ses officiels"
  on public.officiels
  for delete
  using (true);

create policy "Sélectionner ses propres compétitions"
  on public.competitions
  for select
  using (created_by = auth.uid());

create policy "Insérer une compétition"
  on public.competitions
  for insert
  with check (created_by = auth.uid());

create policy "Mettre à jour sa compétition"
  on public.competitions
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Supprimer sa compétition"
  on public.competitions
  for delete
  using (created_by = auth.uid());

create policy "Sélectionner ses propres vols"
  on public.vols
  for select
  using (true);

create policy "Insérer un vol"
  on public.vols
  for insert
  with check (true);

create policy "Mettre à jour ses vols"
  on public.vols
  for update
  using (true)
  with check (true);

create policy "Supprimer ses vols"
  on public.vols
  for delete
  using (true);

create policy "Sélectionner ses propres hébergements"
  on public.hebergements
  for select
  using (true);

create policy "Insérer un hébergement"
  on public.hebergements
  for insert
  with check (true);

create policy "Mettre à jour ses hébergements"
  on public.hebergements
  for update
  using (true)
  with check (true);

create policy "Supprimer ses hébergements"
  on public.hebergements
  for delete
  using (true);

create index if not exists idx_competitions_date_heure on public.competitions(date_heure);
create index if not exists idx_competitions_athlete_id on public.competitions(athlete_id);
create index if not exists idx_competitions_equipe_id on public.competitions(equipe_id);
create index if not exists idx_competitions_sport_id on public.competitions(sport_id);
create index if not exists idx_competitions_statut on public.competitions(statut);

create index if not exists idx_athletes_sport_id on public.athletes(sport_id);
create index if not exists idx_athletes_nom on public.athletes(nom);

create index if not exists idx_equipes_sport_id on public.equipes(sport_id);

create index if not exists idx_vols_athlete_id on public.vols(athlete_id);
create index if not exists idx_vols_equipe_id on public.vols(equipe_id);
create index if not exists idx_vols_officiel_id on public.vols(officiel_id);
create index if not exists idx_vols_date_heure_depart on public.vols(date_heure_depart);

create index if not exists idx_hebergements_athlete_id on public.hebergements(athlete_id);
create index if not exists idx_hebergements_equipe_id on public.hebergements(equipe_id);
create index if not exists idx_hebergements_officiel_id on public.hebergements(officiel_id);
create index if not exists idx_hebergements_date_arrivee on public.hebergements(date_arrivee);