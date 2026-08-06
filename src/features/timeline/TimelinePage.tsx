import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '../layout/AppShell'
import { fetchAthletes } from '../../services/athleteService'
import { fetchTeams } from '../../services/teamService'
import { fetchOfficials } from '../../services/officialService'
import { fetchCompetitions } from '../../services/competitionService'
import { fetchFlights } from '../../services/flightService'
import { fetchAccommodations } from '../../services/accommodationService'
import { exportCompetitionsToPdf } from '../../lib/exportUtils'
import type { CompetitionRecord, FlightRecord, AccommodationRecord, AthleteRecord, TeamRecord, OfficialRecord } from '../../types/competition'
import { ToastContainer } from '../../components/Toast'

type TimelineEvent = {
  date: string
  type: 'competition' | 'flight' | 'accommodation'
  label: string
  detail: string
  record: CompetitionRecord | FlightRecord | AccommodationRecord
}

export function TimelinePage() {
  const [selectedParticipant, setSelectedParticipant] = useState<string>('')
  const [participantType, setParticipantType] = useState<'athlète' | 'équipe' | 'officiel'>('athlète')
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const { data: athletes = [] } = useQuery(['athletes'], fetchAthletes)
  const { data: teams = [] } = useQuery(['teams'], fetchTeams)
  const { data: officials = [] } = useQuery(['officials'], fetchOfficials)
  const { data: competitions = [] } = useQuery(['competitions'], fetchCompetitions)
  const { data: flights = [] } = useQuery(['flights'], fetchFlights)
  const { data: accommodations = [] } = useQuery(['accommodations'], fetchAccommodations)

  const participantOptions = useMemo(() => {
    if (participantType === 'athlète') {
      return athletes.map((a) => ({ id: a.id, label: `${a.prenom} ${a.nom}`, type: 'athlète' as const }))
    }
    if (participantType === 'équipe') {
      return teams.map((t) => ({ id: t.id, label: t.nom, type: 'équipe' as const }))
    }
    return officials.map((o) => ({ id: o.id, label: `${o.prenom} ${o.nom}`, type: 'officiel' as const }))
  }, [athletes, teams, officials, participantType])

  const selectedParticipantData = useMemo(() => {
    if (participantType === 'athlète') {
      return athletes.find((a) => a.id === selectedParticipant) ?? null
    }
    if (participantType === 'équipe') {
      return teams.find((t) => t.id === selectedParticipant) ?? null
    }
    return officials.find((o) => o.id === selectedParticipant) ?? null
  }, [athletes, teams, officials, selectedParticipant, participantType])

  const participantName = useMemo(() => {
    if (!selectedParticipantData) return ''
    if (participantType === 'athlète') {
      const a = selectedParticipantData as AthleteRecord
      return `${a.prenom} ${a.nom}`
    }
    if (participantType === 'équipe') {
      const t = selectedParticipantData as TeamRecord
      return t.nom
    }
    const o = selectedParticipantData as OfficialRecord
    return `${o.prenom} ${o.nom}`
  }, [selectedParticipantData, participantType])

  const timelineEvents = useMemo(() => {
    if (!selectedParticipant) return []

    const events: TimelineEvent[] = []

    const participantCompetitions = competitions.filter((c) => {
      if (participantType === 'athlète') return c.athlete_id === selectedParticipant
      if (participantType === 'équipe') return c.equipe_id === selectedParticipant
      return c.officiel_id === selectedParticipant
    })

    participantCompetitions.forEach((c) => {
      events.push({
        date: c.date_heure,
        type: 'competition',
        label: c.nom_competition,
        detail: `${c.etape} — ${c.statut}${c.resultat ? ` — ${c.resultat}` : ''}`,
        record: c
      })
    })

    const participantFlights = flights.filter((f) => {
      if (participantType === 'athlète') return f.athlete_id === selectedParticipant
      if (participantType === 'équipe') return f.equipe_id === selectedParticipant
      return f.officiel_id === selectedParticipant
    })

    participantFlights.forEach((f) => {
      events.push({
        date: f.date_heure_depart,
        type: 'flight',
        label: `Vol ${f.aeroport_depart} → ${f.aeroport_arrivee}`,
        detail: `${f.compagnie_aerienne} — ${f.numero_vol}`,
        record: f
      })
    })

    const participantAccommodations = accommodations.filter((a) => {
      if (participantType === 'athlète') return a.athlete_id === selectedParticipant
      if (participantType === 'équipe') return a.equipe_id === selectedParticipant
      return a.officiel_id === selectedParticipant
    })

    participantAccommodations.forEach((a) => {
      events.push({
        date: a.date_arrivee,
        type: 'accommodation',
        label: `${a.nom_hotel} — ${a.ville}`,
        detail: `Du ${a.date_arrivee} au ${a.date_depart}${a.numero_chambre ? ` — Chambre ${a.numero_chambre}` : ''}`,
        record: a
      })
    })

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [competitions, flights, accommodations, selectedParticipant, participantType])

  const handleExportPdf = async () => {
    try {
      await exportCompetitionsToPdf(competitions)
      addToast('PDF généré avec succès.', 'success')
    } catch {
      addToast('Erreur lors de la génération du PDF.', 'error')
    }
  }

  const eventIcon = (type: string) => {
    switch (type) {
      case 'competition':
        return '🏅'
      case 'flight':
        return '✈️'
      case 'accommodation':
        return '🏨'
      default:
        return '📋'
    }
  }

  return (
    <AppShell title="Chronologie" description="Suivez le parcours complet d'un participant.">
      <div className="mb-6 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 sm:text-sm">Suivi</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:mt-2 sm:text-3xl">Chronologie</h1>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="participant-type" className="block text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
              Type de participant
            </label>
            <select
              id="participant-type"
              value={participantType}
              onChange={(event) => {
                setParticipantType(event.target.value as 'athlète' | 'équipe' | 'officiel')
                setSelectedParticipant('')
              }}
              aria-label="Type de participant"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="athlète">Athlète</option>
              <option value="équipe">Équipe</option>
              <option value="officiel">Officiel</option>
            </select>
          </div>

          <div>
            <label htmlFor="participant-select" className="block text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
              Participant
            </label>
            <select
              id="participant-select"
              value={selectedParticipant}
              onChange={(event) => setSelectedParticipant(event.target.value)}
              aria-label="Sélectionner un participant"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Sélectionner un participant</option>
              {participantOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedParticipantData && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {participantName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {participantType} — {timelineEvents.length} événement(s)
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
            >
              Exporter PDF
            </button>
          </div>
        </div>
      )}

      {selectedParticipant && timelineEvents.length === 0 ? (
        <div className="flex justify-center rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <p className="font-medium">Aucun événement trouvé pour ce participant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <div key={index} className="relative rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{eventIcon(event.type)}</span>
                  {index < timelineEvents.length - 1 && (
                    <div className="mt-2 h-full w-0.5 bg-slate-200 dark:bg-slate-700" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{event.label}</p>
                    </div>
                    <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold sm:mt-0 ${
                      event.type === 'competition'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : event.type === 'flight'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    }`}>
                      {event.type === 'competition' ? 'Compétition' : event.type === 'flight' ? 'Vol' : 'Hébergement'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{event.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}