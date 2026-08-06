import { supabase } from '../lib/supabase'
import type { AthleteRecord, AthleteRecordInsert, AthleteRecordUpdate } from '../types/competition'

export async function fetchAthletes(): Promise<AthleteRecord[]> {
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .order('nom', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as AthleteRecord[]
}

export async function fetchAthleteById(id: string) {
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createAthlete(record: AthleteRecordInsert) {
  const { data, error } = await supabase
    .from('athletes')
    .insert(record)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function updateAthlete(record: AthleteRecordUpdate) {
  const { id, ...payload } = record
  const { data, error } = await supabase
    .from('athletes')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function deleteAthlete(id: string) {
  const { error } = await supabase
    .from('athletes')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}