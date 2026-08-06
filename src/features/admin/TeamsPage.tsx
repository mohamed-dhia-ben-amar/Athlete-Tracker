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
import { fetchSports } from '../../services/sportService'
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '../../services/teamService'
import type { TeamRecord } from '../../types/competition'

const teamSchema = z.object({
  nom: z.string().min(1, { message: 'Le nom de l\'équipe est requis' }),
  sport_id: z.string().min(1, { message: 'Le sport est requis' }),
  categorie: z.string().min(1, { message: 'La catégorie est requise' }),
  entraineur: z.string().optional(),
  actif: z.boolean().default(true)
})

type TeamFormValues = z.infer<typeof teamSchema>

export function TeamsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<TeamRecord | null>(null)
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>>([])
  const [searchText, setSearchText] = useState('')

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const { data: sports = [] } = useQuery(['sports'], fetchSports)
  const { data: teams = [], isLoading, isError } = useQuery(['teams'], fetchTeams)

  const createMutation = useMutation(createTeam, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
      addToast('L\'équipe a été créée avec succès.', 'success')
      setModalOpen(false)
    },
    onError: () => addToast('Impossible de créer l\'équipe.', 'error')
  })

  const updateMutation = useMutation(updateTeam, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
      addToast('L\'équipe a été mise à jour.', 'success')
      setModalOpen(false)
      setSelectedTeam(null)
    },
    onError: () => addToast('Impossible de mettre à jour l\'équipe.', 'error')
  })

  const deleteMutation = useMutation(deleteTeam, {
    onSuccess: () => {
      queryClient.invalidateQueries(['teams'])
      addToast('L\'équipe a été supprimée.', 'success')
      setDeleteCandidate(null)
    },
    onError: () => addToast('Impossible de supprimer l\'équipe.', 'error')
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: { nom: '', sport_id: sports[0]?.id ?? '', categorie: '', entraineur: '', actif: true }
  })

  useEffect(() => {
    if (sports.length > 0 && !selectedTeam) {
      setValue('sport_id', sports[0].id)
    }
  }, [sports, selectedTeam, setValue])

  const filteredTeams = useMemo(() => {
    const search = searchText.trim().toLowerCase()
    return teams.filter((team) =>
      team.nom.toLowerCase().includes(search) ||
      team.categorie.toLowerCase().includes(search)
    )
  }, [teams, searchText])

  const openNewModal = () => {
    setSelectedTeam(null)
    reset({ nom: '', sport_id: sports[0]?.id ?? '', categorie: '', entraineur: '', actif: true })
    setModalOpen(true)
  }

  const openEditModal = (record: TeamRecord) => {
    setSelectedTeam(record)
    reset({
      nom: record.nom,
      sport_id: record.sport_id,
      categorie: record.categorie,
      entraineur: record.entraineur ?? '',
      actif: record.actif
    })
    setModalOpen(true)
  }

  const handleDelete = (record: TeamRecord) => {
    setDeleteCandidate(record)
  }

  const onSubmit = async (values: TeamFormValues) => {
    if (selectedTeam) {
      await updateMutation.mutateAsync({ id: selectedTeam.id, ...values })
      return
    }
    await createMutation.mutateAsync(values)
  }

  const actionLabel = selectedTeam ? 'Modifier l\'équipe' : 'Créer l\'équipe'

  return (
    <AppShell title="Équipes" description="Gérez les équipes sportives de la délégation.">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={openNewModal}
          aria-label="Créer une nouvelle équipe"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
        >
          Nouvelle équipe
        </button>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="space-y-2">
          <label htmlFor="search-input" className="block text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
            Recherche
          </label>
          <input
            id="search-input"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Rechercher par nom ou catégorie"
            aria-label="Rechercher une équipe"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400 sm:px-4 sm:py-3 sm:text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : isError ? (
          <div className="flex justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            <p className="font-semibold">Erreur lors du chargement des données</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p className="font-medium">Aucune équipe trouvée.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <div key={team.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{team.nom}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {team.categorie} — {team.entraineur ?? 'Pas d\'entraîneur'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(team)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(team)}
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
        title={selectedTeam ? 'Modifier l\'équipe' : 'Nouvelle équipe'}
        description="Remplissez les informations de l\'équipe."
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Nom de l&apos;équipe
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('nom')} />
              {errors.nom ? <p className="text-xs text-red-600">{errors.nom.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Sport
              <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('sport_id')}>
                <option value="">Sélectionner un sport</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>{sport.nom}</option>
                ))}
              </select>
              {errors.sport_id ? <p className="text-xs text-red-600">{errors.sport_id.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Catégorie
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('categorie')} />
              {errors.categorie ? <p className="text-xs text-red-600">{errors.categorie.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Entraîneur
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('entraineur')} />
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
        title="Supprimer l\'équipe"
        description={
          deleteCandidate
            ? `Voulez-vous vraiment supprimer ${deleteCandidate.nom} ? Cette action est irréversible.`
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