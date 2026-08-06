import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { AppShell } from '../layout/AppShell'
import { Modal } from '../../components/Modal'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { ToastContainer } from '../../components/Toast'
import { Spinner } from '../../components/Spinner'
import { fetchSports, createSport, updateSport, deleteSport } from '../../services/sportService'
import type { SportRecord } from '../../types/competition'

const sportSchema = z.object({
  nom: z.string().min(1, { message: 'Le nom du sport est requis' }),
  categorie: z.enum(['Individuel', 'Collectif']),
  actif: z.boolean().default(true)
})

type SportFormValues = z.infer<typeof sportSchema>

export function SportsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSport, setSelectedSport] = useState<SportRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<SportRecord | null>(null)
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>>([])
  const [searchText, setSearchText] = useState('')

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const { data: sports = [], isLoading, isError } = useQuery(['sports'], fetchSports)

  const createMutation = useMutation(createSport, {
    onSuccess: () => {
      queryClient.invalidateQueries(['sports'])
      addToast('Le sport a été créé avec succès.', 'success')
      setModalOpen(false)
    },
    onError: () => addToast('Impossible de créer le sport.', 'error')
  })

  const updateMutation = useMutation(updateSport, {
    onSuccess: () => {
      queryClient.invalidateQueries(['sports'])
      addToast('Le sport a été mis à jour.', 'success')
      setModalOpen(false)
      setSelectedSport(null)
    },
    onError: () => addToast('Impossible de mettre à jour le sport.', 'error')
  })

  const deleteMutation = useMutation(deleteSport, {
    onSuccess: () => {
      queryClient.invalidateQueries(['sports'])
      addToast('Le sport a été supprimé.', 'success')
      setDeleteCandidate(null)
    },
    onError: () => addToast('Impossible de supprimer le sport.', 'error')
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SportFormValues>({
    resolver: zodResolver(sportSchema),
    defaultValues: { nom: '', categorie: 'Individuel', actif: true }
  })

  const filteredSports = useMemo(() => {
    const search = searchText.trim().toLowerCase()
    return sports.filter((sport) =>
      sport.nom.toLowerCase().includes(search) ||
      sport.categorie.toLowerCase().includes(search)
    )
  }, [sports, searchText])

  const openNewModal = () => {
    setSelectedSport(null)
    reset({ nom: '', categorie: 'Individuel', actif: true })
    setModalOpen(true)
  }

  const openEditModal = (record: SportRecord) => {
    setSelectedSport(record)
    reset({ nom: record.nom, categorie: record.categorie, actif: record.actif })
    setModalOpen(true)
  }

  const handleDelete = (record: SportRecord) => {
    setDeleteCandidate(record)
  }

  const onSubmit = async (values: SportFormValues) => {
    if (selectedSport) {
      await updateMutation.mutateAsync({ id: selectedSport.id, ...values })
      return
    }
    await createMutation.mutateAsync(values)
  }

  const actionLabel = selectedSport ? 'Modifier le sport' : 'Créer le sport'

  return (
    <AppShell title="Sports" description="Gérez les disciplines sportives de la délégation.">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={openNewModal}
          aria-label="Créer un nouveau sport"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
        >
          Nouveau sport
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
            aria-label="Rechercher un sport"
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
        ) : filteredSports.length === 0 ? (
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p className="font-medium">Aucun sport trouvé.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSports.map((sport) => (
              <div key={sport.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{sport.nom}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{sport.categorie}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(sport)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sport)}
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
        title={selectedSport ? 'Modifier le sport' : 'Nouveau sport'}
        description="Remplissez les informations du sport."
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Nom du sport
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('nom')}
              />
              {errors.nom ? <p className="text-xs text-red-600">{errors.nom.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Catégorie
              <select
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                {...register('categorie')}
              >
                <option value="Individuel">Individuel</option>
                <option value="Collectif">Collectif</option>
              </select>
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
        title="Supprimer le sport"
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