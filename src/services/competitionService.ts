import { supabase } from '../lib/supabase'
import type {
  CompetitionRecord,
  CompetitionRecordInsert,
  CompetitionRecordUpdate
} from '../types/competition'

/**
 * Récupère toutes les compétitions de l'utilisateur authentifié
 * @returns {Promise<CompetitionRecord[]>} Tableau des enregistrements triés par date décroissante
 * @throws {Error} Si la requête Supabase échoue
 * @example
 * const competitions = await fetchCompetitions()
 */
export async function fetchCompetitions(): Promise<CompetitionRecord[]> {
  const { data, error } = await supabase
    .from('competition_records')
    .select('*')
    .order('competition_datetime', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as CompetitionRecord[]
}

/**
 * Récupère une compétition spécifique par ID
 * @param {string} id - UUID de la compétition
 * @returns {Promise<CompetitionRecord>} L'enregistrement de compétition
 * @throws {Error} Si l'ID n'existe pas ou si la requête échoue
 */
export async function fetchCompetitionById(id: string) {
  const { data, error } = await supabase
    .from('competition_records')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Crée une nouvelle compétition pour l'utilisateur authentifié
 * @param {CompetitionRecordInsert} record - Les données de la compétition à créer
 * @returns {Promise<CompetitionRecord | null>} La compétition créée avec son ID généré
 * @throws {Error} Si la validation échoue ou si l'insertion est rejetée
 * @example
 * const competition = await createCompetition({
 *   participant_type: 'athlète',
 *   participant_name: 'Jean Dupont',
 *   sport_type: 'sport individuel',
 *   discipline: 'Athlétisme',
 *   competition_name: 'Championnat régional',
 *   competition_datetime: '2026-08-15T10:00:00Z',
 *   location: 'Paris',
 *   stage: 'Finale',
 *   status: 'À venir',
 *   result: null,
 *   created_by: userId
 * })
 */
export async function createCompetition(record: CompetitionRecordInsert) {
  const { data, error } = await supabase
    .from('competition_records')
    .insert(record)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

/**
 * Met à jour une compétition existante
 * @param {CompetitionRecordUpdate} record - Objet avec 'id' et les champs à mettre à jour
 * @returns {Promise<CompetitionRecord | null>} La compétition mise à jour
 * @throws {Error} Si l'ID n'existe pas ou si la mise à jour est rejetée
 * @example
 * const updated = await updateCompetition({
 *   id: 'uuid-123',
 *   status: 'Terminée',
 *   result: '1er place'
 * })
 */
export async function updateCompetition(record: CompetitionRecordUpdate) {
  const { id, ...payload } = record
  const { data, error } = await supabase
    .from('competition_records')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

/**
 * Supprime une compétition
 * @param {string} id - UUID de la compétition à supprimer
 * @returns {Promise<void>}
 * @throws {Error} Si l'ID n'existe pas ou si la suppression est rejetée
 * @example
 * await deleteCompetition('uuid-123')
 */
export async function deleteCompetition(id: string) {
  const { error } = await supabase
    .from('competition_records')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}
