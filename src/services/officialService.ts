import { supabase } from '../lib/supabase'
import type { OfficialRecord, OfficialRecordInsert, OfficialRecordUpdate } from '../types/competition'

export async function fetchOfficials(): Promise<OfficialRecord[]> {
  const { data, error } = await supabase
    .from('officiels')
    .select('*')
    .order('nom', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as OfficialRecord[]
}

export async function fetchOfficialById(id: string) {
  const { data, error } = await supabase
    .from('officiels')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createOfficial(record: OfficialRecordInsert) {
  const { data, error } = await supabase
    .from('officiels')
    .insert(record)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function updateOfficial(record: OfficialRecordUpdate) {
  const { id, ...payload } = record
  const { data, error } = await supabase
    .from('officiels')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function deleteOfficial(id: string) {
  const { error } = await supabase
    .from('officiels')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}