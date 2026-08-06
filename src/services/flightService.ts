import { supabase } from '../lib/supabase'
import type { FlightRecord, FlightRecordInsert, FlightRecordUpdate } from '../types/competition'

export async function fetchFlights(): Promise<FlightRecord[]> {
  const { data, error } = await supabase
    .from('vols')
    .select('*')
    .order('date_heure_depart', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as FlightRecord[]
}

export async function fetchFlightById(id: string) {
  const { data, error } = await supabase
    .from('vols')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createFlight(record: FlightRecordInsert) {
  const { data, error } = await supabase
    .from('vols')
    .insert(record)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function updateFlight(record: FlightRecordUpdate) {
  const { id, ...payload } = record
  const { data, error } = await supabase
    .from('vols')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function deleteFlight(id: string) {
  const { error } = await supabase
    .from('vols')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}