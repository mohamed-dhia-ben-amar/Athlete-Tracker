export type ParticipantType = 'athlète' | 'équipe'
export type SportType = 'sport individuel' | 'sport collectif'
export type CompetitionStage =
  | 'Qualifications'
  | 'Huitièmes de finale'
  | 'Quarts de finale'
  | 'Demi-finales'
  | 'Finale'
  | 'Match pour la troisième place'
  | 'Autre'
export type CompetitionStatus = 'À venir' | 'En cours' | 'Terminée' | 'Annulée'

export interface CompetitionRecord {
  id: string
  participant_type: ParticipantType
  participant_name: string
  sport_type: SportType
  discipline: string
  competition_name: string
  competition_datetime: string
  location: string
  stage: CompetitionStage
  status: CompetitionStatus
  result: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type CompetitionRecordInsert = Omit<CompetitionRecord, 'id' | 'created_at' | 'updated_at'>

export type CompetitionRecordUpdate = Partial<Omit<CompetitionRecord, 'created_by' | 'created_at' | 'updated_at'>> & {
  id: string
}
