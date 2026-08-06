import { supabase } from '../lib/supabase'
import type { AccommodationRecord, AccommodationRecordInsert, AccommodationRecordUpdate } from '../types/competition'

export async function fetchAccommodations(): Promise<AccommodationRecord[]> {
  const { data, error } = await supabase
    .from('hebergements')
    .select('*')
    .order('date_arrivee', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as AccommodationRecord[]
}

export async function fetchAccommodationById(id: string) {
  const { data, error } = await supabase
    .from('hebergements')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createAccommodation(record: AccommodationRecordInsert) {
  const { data, error } = await supabase
    .from('hebergements')
    .insert(record)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function updateAccommodation(record: AccommodationRecordUpdate) {
  const { id, ...payload } = record
  const { data, error } = await supabase
    .from('hebergements')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function deleteAccommodation(id: string) {
  const { error } = await supabase
    .from('hebergements')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}