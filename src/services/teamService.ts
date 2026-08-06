import { supabase } from '../lib/supabase'
import type { TeamRecord, TeamRecordInsert, TeamRecordUpdate } from '../types/competition'

export async function fetchTeams(): Promise<TeamRecord[]> {
  const { data, error } = await supabase
    .from('equipes')
    .select('*')
    .order('nom', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as TeamRecord[]
}

export async function fetchTeamById(id: string) {
  const { data, error } = await supabase
    .from('equipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createTeam(record: TeamRecordInsert) {
  const { data, error } = await supabase
    .from('equipes')
    .insert(record)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function updateTeam(record: TeamRecordUpdate) {
  const { id, ...payload } = record
  const { data, error } = await supabase
    .from('equipes')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function deleteTeam(id: string) {
  const { error } = await supabase
    .from('equipes')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}