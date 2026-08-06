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
import { fetchAccommodations, createAccommodation, updateAccommodation, deleteAccommodation } from '../../services/accommodationService'
import type { AccommodationRecord } from '../../types/competition'

const accommodationSchema = z.object({
  type_participant: z.enum(['athlète', 'équipe', 'officiel']),
  athlete_id: z.string().optional(),
  equipe_id: z.string().optional(),
  officiel_id: z.string().optional(),
  nom_hotel: z.string().min(1, { message: 'Le nom de l\'hôtel est requis' }),
  adresse: z.string().min(1, { message: "L'adresse est requise" }),
  ville: z.string().min(1, { message: 'La ville est requise' }),
  pays: z.string().min(1, { message: 'Le pays est requis' }),
  date_arrivee: z.string().min(1, { message: "La date d'arrivée est requise" }),
  date_depart: z.string().min(1, { message: "La date de départ est requise" }),
  numero_chambre: z.string().optional(),
  remarques: z.string().optional()
})

type AccommodationFormValues = z.infer<typeof accommodationSchema>

export function AccommodationsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<AccommodationRecord | null>(null)
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
  const { data: accommodations = [], isLoading, isError } = useQuery(['accommodations'], fetchAccommodations)

  const createMutation = useMutation(createAccommodation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['accommodations'])
      addToast('L\'hébergement a été créé avec succès.', 'success')
      setModalOpen(false)
    },
    onError: () => addToast('Impossible de créer l\'hébergement.', 'error')
  })

  const updateMutation = useMutation(updateAccommodation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['accommodations'])
      addToast('L\'hébergement a été mis à jour.', 'success')
      setModalOpen(false)
      setSelectedAccommodation(null)
    },
    onError: () => addToast('Impossible de mettre à jour l\'hébergement.', 'error')
  })

  const deleteMutation = useMutation(deleteAccommodation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['accommodations'])
      addToast('L\'hébergement a été supprimé.', 'success')
      setDeleteCandidate(null)
    },
    onError: () => addToast('Impossible de supprimer l\'hébergement.', 'error')
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AccommodationFormValues>({
    resolver: zodResolver(accommodationSchema),
    defaultValues: {
      type_participant: 'athlète',
      nom_hotel: '',
      adresse: '',
      ville: '',
      pays: '',
      date_arrivee: '',
      date_depart: '',
      numero_chambre: '',
      remarques: ''
    }
  })

  const typeParticipant = watch('type_participant')

  useEffect(() => {
    setValue('athlete_id', '')
    setValue('equipe_id', '')
    setValue('officiel_id', '')
  }, [typeParticipant, setValue])

  const athleteOptions = useMemo(() => athletes.filter((a) => a.actif !== false), [athletes])
  const teamOptions = useMemo(() => teams.filter((t) => t.actif !== false), [teams])
  const officialOptions = useMemo(() => officials.filter((o) => o.actif !== false), [officials])

  const filteredAccommodations = useMemo(() => {
    const search = searchText.trim().toLowerCase()
    return accommodations.filter((acc) => {
      const matchesSearch =
        !search ||
        acc.nom_hotel.toLowerCase().includes(search) ||
        acc.ville.toLowerCase().includes(search) ||
        acc.pays.toLowerCase().includes(search)

      const matchesParticipant = !participantFilter || acc.type_participant === participantFilter

      return matchesSearch && matchesParticipant
    })
  }, [accommodations, searchText, participantFilter])

  function getParticipantName(acc: AccommodationRecord): string {
    if (acc.type_participant === 'athlète' && acc.athletes) {
      return `${acc.athletes.prenom} ${acc.athletes.nom}`
    }
    if (acc.type_participant === 'équipe' && acc.equipes) {
      return acc.equipes.nom
    }
    if (acc.type_participant === 'officiel' && acc.officiels) {
      return `${acc.officiels.prenom} ${acc.officiels.nom}`
    }
    return '—'
  }

  const openNewModal = () => {
    setSelectedAccommodation(null)
    reset({
      type_participant: 'athlète',
      nom_hotel: '',
      adresse: '',
      ville: '',
      pays: '',
      date_arrivee: '',
      date_depart: '',
      numero_chambre: '',
      remarques: ''
    })
    setModalOpen(true)
  }

  const openEditModal = (record: AccommodationRecord) => {
    setSelectedAccommodation(record)
    reset({
      type_participant: record.type_participant,
      athlete_id: record.athlete_id ?? '',
      equipe_id: record.equipe_id ?? '',
      officiel_id: record.officiel_id ?? '',
      nom_hotel: record.nom_hotel,
      adresse: record.adresse,
      ville: record.ville,
      pays: record.pays,
      date_arrivee: record.date_arrivee,
      date_depart: record.date_depart,
      numero_chambre: record.numero_chambre ?? '',
      remarques: record.remarques ?? ''
    })
    setModalOpen(true)
  }

  const handleDelete = (record: AccommodationRecord) => {
    setDeleteCandidate(record)
  }

  const onSubmit = async (values: AccommodationFormValues) => {
    if (selectedAccommodation) {
      await updateMutation.mutateAsync({ id: selectedAccommodation.id, ...values })
      return
    }
    await createMutation.mutateAsync(values)
  }

  const actionLabel = selectedAccommodation ? 'Modifier l\'hébergement' : 'Créer l\'hébergement'

  return (
    <AppShell title="Hébergements" description="Gérez les séjours et hébergements de la délégation.">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={openNewModal}
          aria-label="Créer un nouvel hébergement"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
        >
          Nouvel hébergement
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
            placeholder="Rechercher par hôtel, ville ou pays"
            aria-label="Rechercher un hébergement"
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
        ) : filteredAccommodations.length === 0 ? (
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p className="font-medium">Aucun hébergement trouvé.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAccommodations.map((acc) => (
              <div key={acc.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{acc.nom_hotel}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {acc.ville}, {acc.pays}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getParticipantName(acc)} — {acc.type_participant}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(acc)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(acc)}
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
        title={selectedAccommodation ? 'Modifier l\'hébergement' : 'Nouvel hébergement'}
        description="Remplissez les informations de l\'hébergement."
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
              Nom de l&apos;hôtel
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('nom_hotel')} />
              {errors.nom_hotel ? <p className="text-xs text-red-600">{errors.nom_hotel.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Adresse
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('adresse')} />
              {errors.adresse ? <p className="text-xs text-red-600">{errors.adresse.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Ville
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('ville')} />
              {errors.ville ? <p className="text-xs text-red-600">{errors.ville.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Pays
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('pays')} />
              {errors.pays ? <p className="text-xs text-red-600">{errors.pays.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Numéro de chambre
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('numero_chambre')} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Date d&apos;arrivée
              <input type="date" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('date_arrivee')} />
              {errors.date_arrivee ? <p className="text-xs text-red-600">{errors.date_arrivee.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Date de départ
              <input type="date" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('date_depart')} />
              {errors.date_depart ? <p className="text-xs text-red-600">{errors.date_depart.message}</p> : null}
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
        title="Supprimer l\'hébergement"
        description={
          deleteCandidate
            ? `Voulez-vous vraiment supprimer l'hébergement à ${deleteCandidate.nom_hotel} ? Cette action est irréversible.`
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