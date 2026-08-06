import { supabase } from '../lib/supabase'
import type {
  CompetitionRecord,
  CompetitionRecordInsert,
  CompetitionRecordUpdate
} from '../types/competition'

export async function fetchCompetitions(): Promise<CompetitionRecord[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*, athletes(nom, prenom), equipes(nom), officiels(nom, prenom), sports(nom)')
    .order('date_heure', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as CompetitionRecord[]
}

export async function fetchCompetitionById(id: string) {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createCompetition(record: CompetitionRecordInsert) {
  const { data, error } = await supabase
    .from('competitions')
    .insert(record)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function updateCompetition(record: CompetitionRecordUpdate) {
  const { id, ...payload } = record
  const { data, error } = await supabase
    .from('competitions')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function deleteCompetition(id: string) {
  const { error } = await supabase
    .from('competitions')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}