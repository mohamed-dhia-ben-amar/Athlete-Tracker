import { z } from 'zod'

export const participantTypeSchema = z.enum(['athlète', 'équipe', 'officiel'])

export const competitionSchema = z.object({
  type_participant: participantTypeSchema,
  athlete_id: z.string().optional(),
  equipe_id: z.string().optional(),
  officiel_id: z.string().optional(),
  sport_id: z.string().min(1, { message: 'Le sport est requis' }),
  nom_competition: z.string().min(1, { message: 'Le nom de la compétition est requis' }),
  date_heure: z.string().min(1, { message: "La date et l'heure sont requises" }),
  lieu: z.string().min(1, { message: 'Le lieu est requis' }),
  etape: z.enum([
    'Qualifications',
    'Huitièmes de finale',
    'Quarts de finale',
    'Demi-finales',
    'Finale',
    'Match pour la troisième place',
    'Autre'
  ]),
  statut: z.enum(['À venir', 'En cours', 'Terminée', 'Annulée']),
  resultat: z.string().optional(),
  adversaire: z.string().optional()
})

export type CompetitionFormValues = z.infer<typeof competitionSchema>