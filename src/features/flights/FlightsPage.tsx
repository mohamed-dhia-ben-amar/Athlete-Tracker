import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { AppShell } from '../layout/AppShell'
import { Modal } from '../../components/Modal'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { ToastContainer } from '../../components/Toast'
import { Spinner } from '../../components/Spinner'
import { fetchAthletes } from '../../services/athleteService'
import { fetchTeams } from '../../services/teamService'
import { fetchOfficials } from '../../services/officialService'
import { fetchFlights, createFlight, updateFlight, deleteFlight } from '../../services/flightService'
import type { FlightRecord } from '../../types/competition'

const flightSchema = z.object({
  type_participant: z.enum(['athlète', 'équipe', 'officiel']),
  athlete_id: z.string().optional(),
  equipe_id: z.string().optional(),
  officiel_id: z.string().optional(),
  compagnie_aerienne: z.string().min(1, { message: 'La compagnie aérienne est requise' }),
  numero_vol: z.string().min(1, { message: 'Le numéro de vol est requis' }),
  aeroport_depart: z.string().min(1, { message: "L'aéroport de départ est requis" }),
  aeroport_arrivee: z.string().min(1, { message: "L'aéroport d'arrivée est requis" }),
  date_heure_depart: z.string().min(1, { message: "La date et l'heure de départ sont requises" }),
  date_heure_arrivee: z.string().min(1, { message: "La date et l'heure d'arrivée sont requises" }),
  reference_reservation: z.string().optional(),
  numero_siege: z.string().optional(),
  remarques: z.string().optional()
})

type FlightFormValues = z.infer<typeof flightSchema>

export function FlightsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<FlightRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<FlightRecord | null>(null)
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>>([])
  const [searchText, setSearchText] = useState('')
  const [participantFilter, setParticipantFilter] = useState('')

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
  const { data: flights = [], isLoading, isError } = useQuery(['flights'], fetchFlights)

  const createMutation = useMutation(createFlight, {
    onSuccess: () => {
      queryClient.invalidateQueries(['flights'])
      addToast('Le vol a été créé avec succès.', 'success')
      setModalOpen(false)
    },
    onError: () => addToast('Impossible de créer le vol.', 'error')
  })

  const updateMutation = useMutation(updateFlight, {
    onSuccess: () => {
      queryClient.invalidateQueries(['flights'])
      addToast('Le vol a été mis à jour.', 'success')
      setModalOpen(false)
      setSelectedFlight(null)
    },
    onError: () => addToast('Impossible de mettre à jour le vol.', 'error')
  })

  const deleteMutation = useMutation(deleteFlight, {
    onSuccess: () => {
      queryClient.invalidateQueries(['flights'])
      addToast('Le vol a été supprimé.', 'success')
      setDeleteCandidate(null)
    },
    onError: () => addToast('Impossible de supprimer le vol.', 'error')
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FlightFormValues>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      type_participant: 'athlète',
      compagnie_aerienne: '',
      numero_vol: '',
      aeroport_depart: '',
      aeroport_arrivee: '',
      date_heure_depart: '',
      date_heure_arrivee: '',
      reference_reservation: '',
      numero_siege: '',
      remarques: ''
    }
  })

  const typeParticipant = watch('type_participant')

  useEffect(() => {
    setValue('athlete_id', '')
    setValue('equipe_id', '')
    setValue('officiel_id', '')
  }, [typeParticipant, setValue])

  const athleteOptions = useMemo(() => athletes, [athletes])
  const teamOptions = useMemo(() => teams.filter((t) => t.actif !== false), [teams])
  const officialOptions = useMemo(() => officials.filter((o) => o.actif !== false), [officials])

  const filteredFlights = useMemo(() => {
    const search = searchText.trim().toLowerCase()
    return flights.filter((flight) => {
      const matchesSearch =
        !search ||
        flight.compagnie_aerienne.toLowerCase().includes(search) ||
        flight.numero_vol.toLowerCase().includes(search) ||
        flight.aeroport_depart.toLowerCase().includes(search) ||
        flight.aeroport_arrivee.toLowerCase().includes(search)

      const matchesParticipant = !participantFilter || flight.type_participant === participantFilter

      return matchesSearch && matchesParticipant
    })
  }, [flights, searchText, participantFilter])

  function getParticipantName(flight: FlightRecord): string {
    if (flight.type_participant === 'athlète' && flight.athletes) {
      return `${flight.athletes.prenom} ${flight.athletes.nom}`
    }
    if (flight.type_participant === 'équipe' && flight.equipes) {
      return flight.equipes.nom
    }
    if (flight.type_participant === 'officiel' && flight.officiels) {
      return `${flight.officiels.prenom} ${flight.officiels.nom}`
    }
    return '—'
  }

  const openNewModal = () => {
    setSelectedFlight(null)
    reset({
      type_participant: 'athlète',
      compagnie_aerienne: '',
      numero_vol: '',
      aeroport_depart: '',
      aeroport_arrivee: '',
      date_heure_depart: '',
      date_heure_arrivee: '',
      reference_reservation: '',
      numero_siege: '',
      remarques: ''
    })
    setModalOpen(true)
  }

  const openEditModal = (record: FlightRecord) => {
    setSelectedFlight(record)
    reset({
      type_participant: record.type_participant,
      athlete_id: record.athlete_id ?? '',
      equipe_id: record.equipe_id ?? '',
      officiel_id: record.officiel_id ?? '',
      compagnie_aerienne: record.compagnie_aerienne,
      numero_vol: record.numero_vol,
      aeroport_depart: record.aeroport_depart,
      aeroport_arrivee: record.aeroport_arrivee,
      date_heure_depart: record.date_heure_depart.slice(0, 16),
      date_heure_arrivee: record.date_heure_arrivee.slice(0, 16),
      reference_reservation: record.reference_reservation ?? '',
      numero_siege: record.numero_siege ?? '',
      remarques: record.remarques ?? ''
    })
    setModalOpen(true)
  }

  const handleDelete = (record: FlightRecord) => {
    setDeleteCandidate(record)
  }

  const onSubmit = async (values: FlightFormValues) => {
    if (selectedFlight) {
      await updateMutation.mutateAsync({ id: selectedFlight.id, ...values })
      return
    }
    await createMutation.mutateAsync(values)
  }

  const actionLabel = selectedFlight ? 'Modifier le vol' : 'Créer le vol'

  return (
    <AppShell title="Vols" description="Gérez les déplacements aériens de la délégation.">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={openNewModal}
          aria-label="Créer un nouveau vol"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
        >
          Nouveau vol
        </button>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="mb-6 space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="space-y-2">
          <label htmlFor="search-input" className="block text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
            Recherche
          </label>
          <input
            id="search-input"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Rechercher par compagnie, numéro de vol ou aéroport"
            aria-label="Rechercher un vol"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400 sm:px-4 sm:py-3 sm:text-sm"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor="participant-filter" className="space-y-2 text-xs text-slate-700 dark:text-slate-200 sm:text-sm">
            Type de participant
            <select
              id="participant-filter"
              value={participantFilter}
              onChange={(event) => setParticipantFilter(event.target.value)}
              aria-label="Filtrer par type de participant"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:px-4 sm:py-3 sm:text-sm"
            >
              <option value="">Tous</option>
              <option value="athlète">Athlète</option>
              <option value="équipe">Équipe</option>
              <option value="officiel">Officiel</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : isError ? (
          <div className="flex justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            <p className="font-semibold">Erreur lors du chargement des données</p>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p className="font-medium">Aucun vol trouvé.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFlights.map((flight) => (
              <div key={flight.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {flight.compagnie_aerienne} — {flight.numero_vol}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                     {flight.aeroport_depart} To {flight.aeroport_arrivee}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getParticipantName(flight)} — {flight.type_participant}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(flight)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(flight)}
                    className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={selectedFlight ? 'Modifier le vol' : 'Nouveau vol'}
        description="Remplissez les informations du vol."
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Type de participant
              <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('type_participant')}>
                <option value="athlète">Athlète</option>
                <option value="équipe">Équipe</option>
                <option value="officiel">Officiel</option>
              </select>
            </label>
          </div>

          {typeParticipant === 'athlète' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                Athlète
                <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('athlete_id')}>
                  <option value="">Sélectionner un athlète</option>
                  {athleteOptions.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>{athlete.prenom} {athlete.nom}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {typeParticipant === 'équipe' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                Équipe
                <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('equipe_id')}>
                  <option value="">Sélectionner une équipe</option>
                  {teamOptions.map((team) => (
                    <option key={team.id} value={team.id}>{team.nom}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {typeParticipant === 'officiel' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                Officiel
                <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('officiel_id')}>
                  <option value="">Sélectionner un officiel</option>
                  {officialOptions.map((official) => (
                    <option key={official.id} value={official.id}>{official.prenom} {official.nom}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Compagnie aérienne
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('compagnie_aerienne')} />
              {errors.compagnie_aerienne ? <p className="text-xs text-red-600">{errors.compagnie_aerienne.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Numéro de vol
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('numero_vol')} />
              {errors.numero_vol ? <p className="text-xs text-red-600">{errors.numero_vol.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Aéroport de départ
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('aeroport_depart')} />
              {errors.aeroport_depart ? <p className="text-xs text-red-600">{errors.aeroport_depart.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Aéroport d&apos;arrivée
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('aeroport_arrivee')} />
              {errors.aeroport_arrivee ? <p className="text-xs text-red-600">{errors.aeroport_arrivee.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Date et heure de départ
              <input type="datetime-local" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('date_heure_depart')} />
              {errors.date_heure_depart ? <p className="text-xs text-red-600">{errors.date_heure_depart.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Date et heure d&apos;arrivée
              <input type="datetime-local" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('date_heure_arrivee')} />
              {errors.date_heure_arrivee ? <p className="text-xs text-red-600">{errors.date_heure_arrivee.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Référence de réservation
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('reference_reservation')} />
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Numéro de siège
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('numero_siege')} />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Remarques
            <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('remarques')} />
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isLoading || updateMutation.isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {isSubmitting || createMutation.isLoading || updateMutation.isLoading ? (
                <>
                  <Spinner size="sm" />
                  Enregistrement…
                </>
              ) : (
                actionLabel
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Supprimer le vol"
        description={
          deleteCandidate
            ? `Voulez-vous vraiment supprimer le vol ${deleteCandidate.numero_vol} ? Cette action est irréversible.`
            : ''
        }
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          if (deleteCandidate) {
            deleteMutation.mutate(deleteCandidate.id)
          }
        }}
      />
    </AppShell>
  )
}