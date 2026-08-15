import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { AppShell } from '../layout/AppShell'
import { Modal } from '../../components/Modal'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { ToastContainer } from '../../components/Toast'
import { Spinner } from '../../components/Spinner'
import { competitionSchema, type CompetitionFormValues } from './competitionSchema'
import type { CompetitionRecord } from '../../types/competition'
import {
  createCompetition,
  deleteCompetition,
  fetchCompetitions,
  updateCompetition
} from '../../services/competitionService'
import { fetchSports } from '../../services/sportService'
import { fetchAthletes } from '../../services/athleteService'
import { fetchTeams } from '../../services/teamService'
import { CompetitionTable } from '../dashboard/CompetitionTable'

function lazyExportToPdf(records: CompetitionRecord[]) {
  return import('../../lib/exportUtils').then((mod) => mod.exportCompetitionsToPdf(records))
}

const defaultFormValues: CompetitionFormValues = {
  type_participant: 'athlète',
  sport_id: '',
  nom_competition: '',
  date_heure: '',
  lieu: '',
  etape: 'Qualifications',
  statut: 'À venir',
  resultat: '',
  adversaire: ''
}

export function CompetitionsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<CompetitionRecord | null>(null)
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [sportFilter, setSportFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [exportingPdf, setExportingPdf] = useState(false)

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const auth = useAuth()
  const { data: competitions = [], isLoading, isError } = useQuery(['competitions'], fetchCompetitions)
  const { data: sports = [] } = useQuery(['sports'], fetchSports)
  const { data: athletes = [] } = useQuery(['athletes'], fetchAthletes)
  const { data: teams = [] } = useQuery(['teams'], fetchTeams)

  const createMutation = useMutation(createCompetition, {
    onSuccess: () => {
      queryClient.invalidateQueries(['competitions'])
      addToast('La compétition a été créée avec succès.', 'success')
      setModalOpen(false)
    },
    onError: () => addToast('Impossible de créer la compétition.', 'error')
  })

  const updateMutation = useMutation(updateCompetition, {
    onSuccess: () => {
      queryClient.invalidateQueries(['competitions'])
      addToast('La compétition a été mise à jour.', 'success')
      setModalOpen(false)
      setSelectedCompetition(null)
    },
    onError: () => addToast('Impossible de mettre à jour la compétition.', 'error')
  })

  const deleteMutation = useMutation(deleteCompetition, {
    onSuccess: () => {
      queryClient.invalidateQueries(['competitions'])
      addToast('La compétition a été supprimée.', 'success')
      setDeleteCandidate(null)
    },
    onError: () => addToast('Impossible de supprimer la compétition.', 'error')
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: defaultFormValues
  })

  const typeParticipant = watch('type_participant')
  const sportId = watch('sport_id')

  const athleteOptions = useMemo(
    () => athletes.filter((a) => a.sport_id === sportId),
    [athletes, sportId]
  )

  const teamOptions = useMemo(
    () => teams.filter((t) => t.sport_id === sportId),
    [teams, sportId]
  )

  useEffect(() => {
    if (sports.length > 0 && !sportId) {
      setValue('sport_id', sports[0].id)
    }
  }, [sports, sportId, setValue])

  const filteredCompetitions = useMemo(() => {
    return competitions.filter((competition) => {
      const search = searchText.trim().toLowerCase()
      const participantName = getParticipantName(competition).toLowerCase()
      const sportName = getSportName(competition).toLowerCase()
      const matchesSearch =
        !search ||
        participantName.includes(search) ||
        competition.nom_competition.toLowerCase().includes(search) ||
        competition.lieu.toLowerCase().includes(search) ||
        (competition.resultat ?? '').toLowerCase().includes(search) ||
        sportName.includes(search)

      const matchesStatus = !statusFilter || competition.statut === statusFilter
      const matchesStage = !stageFilter || competition.etape === stageFilter
      const matchesSport = !sportFilter || competition.sport_id === sportFilter

      const competitionDate = new Date(competition.date_heure)
      const matchesDateFrom = !dateFrom || competitionDate >= new Date(dateFrom)
      const matchesDateTo = !dateTo || competitionDate <= new Date(dateTo + 'T23:59:59')

      return matchesSearch && matchesStatus && matchesStage && matchesSport && matchesDateFrom && matchesDateTo
    })
  }, [competitions, searchText, statusFilter, stageFilter, sportFilter, dateFrom, dateTo])

  function getParticipantName(record: CompetitionRecord): string {
    if (record.type_participant === 'athlète' && record.athletes) {
      return `${record.athletes.prenom} ${record.athletes.nom}`
    }
    if (record.type_participant === 'équipe' && record.equipes) {
      return record.equipes.nom
    }
    if (record.type_participant === 'officiel' && record.officiels) {
      return `${record.officiels.prenom} ${record.officiels.nom}`
    }
    return '—'
  }

  function getSportName(record: CompetitionRecord): string {
    if (record.sports) {
      return record.sports.nom
    }
    return '—'
  }

  const openNewModal = () => {
    setSelectedCompetition(null)
    reset(defaultFormValues)
    setModalOpen(true)
  }

  const openEditModal = (record: CompetitionRecord) => {
    setSelectedCompetition(record)
    reset({
      type_participant: record.type_participant === 'officiel' ? 'athlète' : record.type_participant,
      sport_id: record.sport_id,
      athlete_id: record.athlete_id ?? '',
      equipe_id: record.equipe_id ?? '',
      nom_competition: record.nom_competition,
      date_heure: record.date_heure.slice(0, 16),
      lieu: record.lieu,
      etape: record.etape,
      statut: record.statut,
      resultat: record.resultat ?? '',
      adversaire: record.adversaire ?? ''
    })
    setModalOpen(true)
  }

  const handleDelete = (record: CompetitionRecord) => {
    setDeleteCandidate(record)
  }

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true)
      await lazyExportToPdf(filteredCompetitions)
      addToast('Export PDF réussi.', 'success')
    } catch {
      addToast('Erreur lors de l\'export PDF.', 'error')
    } finally {
      setExportingPdf(false)
    }
  }

  const onSubmit = async (values: CompetitionFormValues) => {
    if (!auth.user?.id) {
      addToast("Impossible de récupérer l'utilisateur connecté.", 'error')
      return
    }

    const payload = {
      ...values,
      athlete_id: values.athlete_id ?? null,
      equipe_id: values.equipe_id ?? null,
      created_by: auth.user.id
    }

    if (selectedCompetition) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { created_by, ...updateData } = payload
      await updateMutation.mutateAsync({ id: selectedCompetition.id, ...updateData })
      return
    }
    await createMutation.mutateAsync(payload)
  }

  const actionLabel = selectedCompetition ? 'Modifier la compétition' : 'Créer la compétition'

  return (
    <AppShell title="Compétitions" description="Consultez, créez et mettez à jour vos compétitions." >
      <div className="mb-6 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 sm:text-sm">Gestion</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:mt-2 sm:text-3xl">Compétitions</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf || isLoading}
            aria-label="Exporter les compétitions au format PDF"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
          >
            {exportingPdf && <Spinner size="sm" className="text-slate-700 dark:text-slate-100" />}
            Exporter PDF
          </button>
          <button
            type="button"
            onClick={openNewModal}
            aria-label="Créer une nouvelle compétition"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
          >
            Nouvelle compétition
          </button>
        </div>
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
            placeholder="Rechercher participant, compétition, discipline, lieu ou résultat"
            aria-label="Rechercher par participant, compétition, lieu ou résultat"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400 sm:px-4 sm:py-3 sm:text-sm"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <label htmlFor="status-filter" className="space-y-2 text-xs text-slate-700 dark:text-slate-200 sm:text-sm">
            Statut
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrer par statut de compétition"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:px-4 sm:py-3 sm:text-sm"
            >
              <option value="">Tous</option>
              <option value="À venir">À venir</option>
              <option value="En cours">En cours</option>
              <option value="Terminée">Terminée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </label>
          <label htmlFor="stage-filter" className="space-y-2 text-xs text-slate-700 dark:text-slate-200 sm:text-sm">
            Étape
            <select
              id="stage-filter"
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value)}
              aria-label="Filtrer par étape de compétition"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:px-4 sm:py-3 sm:text-sm"
            >
              <option value="">Toutes</option>
              <option value="Qualifications">Qualifications</option>
              <option value="Huitièmes de finale">Huitièmes de finale</option>
              <option value="Quarts de finale">Quarts de finale</option>
              <option value="Demi-finales">Demi-finales</option>
              <option value="Finale">Finale</option>
              <option value="Match pour la troisième place">Match pour la troisième place</option>
              <option value="Autre">Autre</option>
            </select>
          </label>
          <label htmlFor="sport-filter" className="space-y-2 text-xs text-slate-700 dark:text-slate-200 sm:text-sm">
            Sport
            <select
              id="sport-filter"
              value={sportFilter}
              onChange={(event) => setSportFilter(event.target.value)}
              aria-label="Filtrer par sport"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:px-4 sm:py-3 sm:text-sm"
            >
              <option value="">Tous</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>{sport.nom}</option>
              ))}
            </select>
          </label>
          <label htmlFor="type-filter" className="space-y-2 text-xs text-slate-700 dark:text-slate-200 sm:text-sm">
            Participant
            <select
              id="type-filter"
              value=""
              onChange={() => {}}
              aria-label="Filtrer par type de participant"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:px-4 sm:py-3 sm:text-sm"
            >
              <option value="">Tous</option>
              <option value="athlète">Athlète</option>
              <option value="équipe">Équipe</option>
            </select>
          </label>
          <label htmlFor="date-from-filter" className="space-y-2 text-xs text-slate-700 dark:text-slate-200 sm:text-sm">
            Date début
            <input
              id="date-from-filter"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              aria-label="Filtrer par date de début"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:px-4 sm:py-3 sm:text-sm"
            />
          </label>
          <label htmlFor="date-to-filter" className="space-y-2 text-xs text-slate-700 dark:text-slate-200 sm:text-sm">
            Date fin
            <input
              id="date-to-filter"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              aria-label="Filtrer par date de fin"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:px-4 sm:py-3 sm:text-sm"
            />
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <CompetitionTable
          records={filteredCompetitions}
          isLoading={isLoading}
          isError={isError}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        title={selectedCompetition ? 'Modifier la compétition' : 'Nouvelle compétition'}
        description="Remplissez les informations de la compétition."
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Type de participant
              <select
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('type_participant')}
              >
                <option value="athlète">Athlète</option>
                <option value="équipe">Équipe</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Sport
              <select
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('sport_id')}
              >
                <option value="">Sélectionner un sport</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>{sport.nom}</option>
                ))}
              </select>
              {errors.sport_id ? <p className="text-xs text-red-600">{errors.sport_id.message}</p> : null}
            </label>
          </div>

          {typeParticipant === 'athlète' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                Athlète
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  {...register('athlete_id')}
                >
                  <option value="">Sélectionner un athlète</option>
                  {athleteOptions.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.prenom} {athlete.nom}
                    </option>
                  ))}
                </select>
                {errors.athlete_id ? <p className="text-xs text-red-600">{errors.athlete_id.message}</p> : null}
              </label>
            </div>
          )}

          {typeParticipant === 'équipe' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                Équipe
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  {...register('equipe_id')}
                >
                  <option value="">Sélectionner une équipe</option>
                  {teamOptions.map((team) => (
                    <option key={team.id} value={team.id}>{team.nom}</option>
                  ))}
                </select>
                {errors.equipe_id ? <p className="text-xs text-red-600">{errors.equipe_id.message}</p> : null}
              </label>
              <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                Adversaire
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  {...register('adversaire')}
                />
              </label>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Nom de la compétition
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('nom_competition')}
              />
              {errors.nom_competition ? <p className="text-xs text-red-600">{errors.nom_competition.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Lieu
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('lieu')}
              />
              {errors.lieu ? <p className="text-xs text-red-600">{errors.lieu.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Date et heure
              <input
                type="datetime-local"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('date_heure')}
              />
              {errors.date_heure ? <p className="text-xs text-red-600">{errors.date_heure.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Étape
              <select
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('etape')}
              >
                <option value="Qualifications">Qualifications</option>
                <option value="Huitièmes de finale">Huitièmes de finale</option>
                <option value="Quarts de finale">Quarts de finale</option>
                <option value="Demi-finales">Demi-finales</option>
                <option value="Finale">Finale</option>
                <option value="Match pour la troisième place">Match pour la troisième place</option>
                <option value="Autre">Autre</option>
              </select>
              {errors.etape ? <p className="text-xs text-red-600">{errors.etape.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Statut
              <select
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('statut')}
              >
                <option value="À venir">À venir</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
                <option value="Annulée">Annulée</option>
              </select>
              {errors.statut ? <p className="text-xs text-red-600">{errors.statut.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Résultat (optionnel)
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('resultat')}
              />
            </label>
          </div>

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
        title="Supprimer la compétition"
        description={
          deleteCandidate
            ? `Voulez-vous vraiment supprimer ${deleteCandidate.nom_competition} ? Cette action est irréversible.`
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