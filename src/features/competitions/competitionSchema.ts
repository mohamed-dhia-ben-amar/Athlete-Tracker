import { z } from 'zod'

const insertSchema = z.object({
  participant_type: z.enum(['athlète', 'équipe']),
  participant_name: z.string().min(1, { message: 'Le nom est requis' }),
  sport_type: z.enum(['sport individuel', 'sport collectif']),
  discipline: z.string().min(1, { message: 'La discipline est requise' }),
  competition_name: z.string().min(1, { message: 'Le nom de la compétition est requis' }),
  competition_date: z.string().min(1, { message: 'La date est requise' }),
  competition_time: z.string().min(1, { message: 'L’heure est requise' }),
  location: z.string().min(1, { message: 'Le lieu est requis' }),
  stage: z.enum([
    'Qualifications',
    'Huitièmes de finale',
    'Quarts de finale',
    'Demi-finales',
    'Finale',
    'Match pour la troisième place',
    'Autre'
  ]),
  status: z.enum(['À venir', 'En cours', 'Terminée', 'Annulée']),
  result: z.string().optional()
})

export const competitionSchema = insertSchema

export type CompetitionFormValues = z.infer<typeof competitionSchema>
