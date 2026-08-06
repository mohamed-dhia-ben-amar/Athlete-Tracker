import { supabase } from '../lib/supabase'
import type { SportRecord, SportRecordInsert, SportRecordUpdate } from '../types/competition'

export async function fetchSports(): Promise<SportRecord[]> {
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .order('nom', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as SportRecord[]
}

export async function fetchSportById(id: string) {
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createSport(record: SportRecordInsert) {
  const { data, error } = await supabase
    .from('sports')
    .insert(record)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function updateSport(record: SportRecordUpdate) {
  const { id, ...payload } = record
  const { data, error } = await supabase
    .from('sports')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function deleteSport(id: string) {
  const { error } = await supabase
    .from('sports')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}