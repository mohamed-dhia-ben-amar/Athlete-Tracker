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
import type { CompetitionRecord, CompetitionRecordInsert } from '../../types/competition'
import {
  createCompetition,
  deleteCompetition,
  fetchCompetitions,
  updateCompetition
} from '../../services/competitionService'
import { CompetitionTable } from '../dashboard/CompetitionTable'

// Lazy load export utilities to reduce initial bundle size
async function lazyExportToExcel(records: CompetitionRecord[]) {
  const { exportCompetitionsToExcel } = await import('../../lib/exportUtils')
  return exportCompetitionsToExcel(records)
}

async function lazyExportToPdf(records: CompetitionRecord[]) {
  const { exportCompetitionsToPdf } = await import('../../lib/exportUtils')
  return exportCompetitionsToPdf(records)
}

const sportDisciplines = {
  'sport collectif': [
    'Basketball 3x3 Hommes',
    'Basketball 3x3 Femmes',
    'Handball Hommes',
    'Handball Femmes',
    'Volleyball Hommes',
    'Football Hommes'
  ],
  'sport individuel': [
    'Tennis de table',
    'Padel',
    'Boxe',
    'Triathlon',
    'Tennis',
    'Gymnastique Artistique',
    'Gymnastique Rythmique',
    'Tir à l’arc',
    'Voile',
    'Athlétisme',
    'Natation',
    'Cyclisme',
    'Tir Sportif',
    'Haltérophilie',
    'Lutte',
    'Aviron',
    'Équitation',
    'Canoë Sprint',
    'Judo',
    'Escrime',
    'Karaté',
    'Pétanque',
    'Taekwondo'
  ]
}

const defaultFormValues: CompetitionFormValues = {
  participant_type: 'athlète',
  participant_name: '',
  sport_type: 'sport individuel',
  discipline: sportDisciplines['sport individuel'][0],
  competition_name: '',
  competition_date: new Date().toISOString().slice(0, 10),
  competition_time: '12:00',
  location: '',
  stage: 'Qualifications',
  status: 'À venir',
  result: ''
}

function buildCompetitionInsert(values: CompetitionFormValues, userId: string): CompetitionRecordInsert {
  return {
    participant_type: values.participant_type,
    participant_name: values.participant_name,
    sport_type: values.sport_type,
    discipline: values.discipline,
    competition_name: values.competition_name,
    competition_datetime: `${values.competition_date}T${values.competition_time}:00`,
    location: values.location,
    stage: values.stage,
    status: values.status,
    result: values.result || null,
    created_by: userId
  }
}

function formatCompetitionForForm(record: CompetitionRecord): CompetitionFormValues {
  const date = new Date(record.competition_datetime)
  const isoDate = date.toISOString().slice(0, 10)
  const isoTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })

  return {
    participant_type: record.participant_type,
    participant_name: record.participant_name,
    sport_type: record.sport_type,
    discipline: record.discipline,
    competition_name: record.competition_name,
    competition_date: isoDate,
    competition_time: isoTime,
    location: record.location,
    stage: record.stage,
    status: record.status,
    result: record.result ?? ''
  }
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
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const auth = useAuth()
  const { data = [], isLoading, isError } = useQuery(['competitions'], fetchCompetitions)

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

  const sportType = watch('sport_type')
  const disciplines = sportDisciplines[sportType]

  useEffect(() => {
    if (!disciplines.includes(watch('discipline'))) {
      setValue('discipline', disciplines[0])
    }
  }, [sportType])

  const filteredCompetitions = useMemo(() => {
    return data.filter((competition) => {
      const search = searchText.trim().toLowerCase()
      const matchesSearch =
        !search ||
        competition.participant_name.toLowerCase().includes(search) ||
        competition.competition_name.toLowerCase().includes(search) ||
        competition.discipline.toLowerCase().includes(search) ||
        competition.location.toLowerCase().includes(search)

      const matchesStatus = !statusFilter || competition.status === statusFilter
      const matchesStage = !stageFilter || competition.stage === stageFilter
      const matchesSport = !sportFilter || competition.sport_type === sportFilter

      return matchesSearch && matchesStatus && matchesStage && matchesSport
    })
  }, [data, searchText, statusFilter, stageFilter, sportFilter])

  const openNewModal = () => {
    setSelectedCompetition(null)
    reset(defaultFormValues)
    setModalOpen(true)
  }

  const openEditModal = (record: CompetitionRecord) => {
    setSelectedCompetition(record)
    reset(formatCompetitionForForm(record))
    setModalOpen(true)
  }

  const handleDelete = (record: CompetitionRecord) => {
    setDeleteCandidate(record)
  }

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true)
      await lazyExportToExcel(filteredCompetitions)
      addToast('Export Excel réussi.', 'success')
    } catch {
      addToast('Erreur lors de l\'export Excel.', 'error')
    } finally {
      setExportingExcel(false)
    }
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

    const payload = buildCompetitionInsert(values, auth.user.id)
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
            onClick={handleExportExcel}
            disabled={exportingExcel || isLoading}
            aria-label="Exporter les compétitions au format Excel"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
          >
            {exportingExcel && <Spinner size="sm" className="text-slate-700 dark:text-slate-100" />}
            Exporter Excel
          </button>
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
            placeholder="Rechercher nom, compétition, discipline ou lieu"
            aria-label="Rechercher par nom de participant, compétition, discipline ou lieu"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400 sm:px-4 sm:py-3 sm:text-sm"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
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
              aria-label="Filtrer par type de sport"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:px-4 sm:py-3 sm:text-sm"
            >
              <option value="">Tous</option>
              <option value="sport individuel">Sport individuel</option>
              <option value="sport collectif">Sport collectif</option>
            </select>
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
              <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('participant_type')}>
                <option value="athlète">Athlète</option>
                <option value="équipe">Équipe</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {watch('participant_type') === 'athlète' ? 'Nom de l’athlète' : 'Nom de l’équipe'}
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('participant_name')}
              />
              {errors.participant_name ? <p className="text-xs text-red-600">{errors.participant_name.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Type de sport
              <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('sport_type')}>
                <option value="sport individuel">Sport individuel</option>
                <option value="sport collectif">Sport collectif</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Discipline
              <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('discipline')}>
                {disciplines.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Nom de la compétition
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('competition_name')}
              />
              {errors.competition_name ? <p className="text-xs text-red-600">{errors.competition_name.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Lieu
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('location')}
              />
              {errors.location ? <p className="text-xs text-red-600">{errors.location.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Date
              <input
                type="date"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('competition_date')}
              />
              {errors.competition_date ? <p className="text-xs text-red-600">{errors.competition_date.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Heure
              <input
                type="time"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('competition_time')}
              />
              {errors.competition_time ? <p className="text-xs text-red-600">{errors.competition_time.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Étape
              <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('stage')}>
                <option value="Qualifications">Qualifications</option>
                <option value="Huitièmes de finale">Huitièmes de finale</option>
                <option value="Quarts de finale">Quarts de finale</option>
                <option value="Demi-finales">Demi-finales</option>
                <option value="Finale">Finale</option>
                <option value="Match pour la troisième place">Match pour la troisième place</option>
                <option value="Autre">Autre</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Statut
              <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('status')}>
                <option value="À venir">À venir</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
                <option value="Annulée">Annulée</option>
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Résultat (optionnel)
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              {...register('result')}
            />
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
        title="Supprimer la compétition"
        description={
          deleteCandidate
            ? `Voulez-vous vraiment supprimer ${deleteCandidate.competition_name} ? Cette action est irréversible.`
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
