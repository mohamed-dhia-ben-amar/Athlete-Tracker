export type ParticipantType = 'athlète' | 'équipe' | 'officiel'
export type CompetitionStage =
  | 'Qualifications'
  | 'Huitièmes de finale'
  | 'Quarts de finale'
  | 'Demi-finales'
  | 'Finale'
  | 'Match pour la troisième place'
  | 'Autre'
export type CompetitionStatus = 'À venir' | 'En cours' | 'Terminée' | 'Annulée'

export interface SportRecord {
  id: string
  nom: string
  categorie: 'Individuel' | 'Collectif'
  actif: boolean
  created_at: string
  updated_at: string
}

export interface AthleteRecord {
  id: string
  prenom: string
  nom: string
  sexe: 'Masculin' | 'Féminin'
  date_de_naissance: string
  nationalite: string
  numero_passeport: string | null
  telephone: string | null
  email: string | null
  sport_id: string
  actif: boolean
  created_at: string
  updated_at: string
}

export interface TeamRecord {
  id: string
  nom: string
  sport_id: string
  categorie: string
  entraineur: string | null
  actif: boolean
  created_at: string
  updated_at: string
}

export interface OfficialRecord {
  id: string
  prenom: string
  nom: string
  fonction: string
  nationalite: string
  numero_passeport: string | null
  telephone: string | null
  email: string | null
  actif: boolean
  created_at: string
  updated_at: string
}

export interface CompetitionRecord {
  id: string
  type_participant: ParticipantType
  athlete_id: string | null
  equipe_id: string | null
  officiel_id: string | null
  sport_id: string
  nom_competition: string
  date_heure: string
  lieu: string
  etape: CompetitionStage
  statut: CompetitionStatus
  resultat: string | null
  created_by: string
  created_at: string
  updated_at: string
  athletes?: { prenom: string; nom: string } | null
  equipes?: { nom: string } | null
  officiels?: { prenom: string; nom: string } | null
  sports?: { nom: string } | null
}

export interface FlightRecord {
  id: string
  type_participant: ParticipantType
  athlete_id: string | null
  equipe_id: string | null
  officiel_id: string | null
  compagnie_aerienne: string
  numero_vol: string
  aeroport_depart: string
  aeroport_arrivee: string
  date_heure_depart: string
  date_heure_arrivee: string
  reference_reservation: string | null
  numero_siege: string | null
  remarques: string | null
  created_at: string
  athletes?: { prenom: string; nom: string } | null
  equipes?: { nom: string } | null
  officiels?: { prenom: string; nom: string } | null
}

export interface AccommodationRecord {
  id: string
  type_participant: ParticipantType
  athlete_id: string | null
  equipe_id: string | null
  officiel_id: string | null
  nom_hotel: string
  adresse: string
  ville: string
  pays: string
  date_arrivee: string
  date_depart: string
  numero_chambre: string | null
  remarques: string | null
  created_at: string
  athletes?: { prenom: string; nom: string } | null
  equipes?: { nom: string } | null
  officiels?: { prenom: string; nom: string } | null
}

export interface CompetitionRecordInsert {
  type_participant: ParticipantType
  athlete_id?: string | null
  equipe_id?: string | null
  officiel_id?: string | null
  sport_id: string
  nom_competition: string
  date_heure: string
  lieu: string
  etape: CompetitionStage
  statut: CompetitionStatus
  resultat?: string | null
  created_by: string
}
export type CompetitionRecordUpdate = Partial<Omit<CompetitionRecord, 'created_by' | 'created_at' | 'updated_at'>> & {
  id: string
}

export type SportRecordInsert = Omit<SportRecord, 'id' | 'created_at' | 'updated_at'>
export type SportRecordUpdate = Partial<Omit<SportRecord, 'created_at' | 'updated_at'>> & {
  id: string
}

export interface AthleteRecordInsert {
  prenom: string
  nom: string
  sexe: 'Masculin' | 'Féminin'
  date_de_naissance: string
  nationalite: string
  numero_passeport?: string | null
  telephone?: string | null
  email?: string | null
  sport_id: string
  actif?: boolean
}

export interface AthleteRecordUpdate extends Partial<Omit<AthleteRecord, 'created_at' | 'updated_at'>> {
  id: string
}

export interface TeamRecordInsert {
  nom: string
  sport_id: string
  categorie: string
  entraineur?: string | null
  actif?: boolean
}

export interface TeamRecordUpdate extends Partial<Omit<TeamRecord, 'created_at' | 'updated_at'>> {
  id: string
}

export interface OfficialRecordInsert {
  prenom: string
  nom: string
  fonction: string
  nationalite: string
  numero_passeport?: string | null
  telephone?: string | null
  email?: string | null
  actif?: boolean
}

export interface OfficialRecordUpdate extends Partial<Omit<OfficialRecord, 'created_at' | 'updated_at'>> {
  id: string
}

export interface FlightRecordInsert {
  type_participant: ParticipantType
  athlete_id?: string | null
  equipe_id?: string | null
  officiel_id?: string | null
  compagnie_aerienne: string
  numero_vol: string
  aeroport_depart: string
  aeroport_arrivee: string
  date_heure_depart: string
  date_heure_arrivee: string
  reference_reservation?: string | null
  numero_siege?: string | null
  remarques?: string | null
}

export interface FlightRecordUpdate extends Partial<Omit<FlightRecord, 'created_at'>> {
  id: string
}

export interface AccommodationRecordInsert {
  type_participant: ParticipantType
  athlete_id?: string | null
  equipe_id?: string | null
  officiel_id?: string | null
  nom_hotel: string
  adresse: string
  ville: string
  pays: string
  date_arrivee: string
  date_depart: string
  numero_chambre?: string | null
  remarques?: string | null
}

export interface AccommodationRecordUpdate extends Partial<Omit<AccommodationRecord, 'created_at'>> {
  id: string
}