import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useAuth } from '../auth/useAuth'
import { AppShell } from '../layout/AppShell'
import { Modal } from '../../components/Modal'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { ToastContainer } from '../../components/Toast'
import { Spinner } from '../../components/Spinner'
import { fetchSports } from '../../services/sportService'
import { fetchAthletes, createAthlete, updateAthlete, deleteAthlete } from '../../services/athleteService'
import type { AthleteRecord } from '../../types/competition'

const athleteSchema = z.object({
  prenom: z.string().min(1, { message: 'Le prénom est requis' }),
  nom: z.string().min(1, { message: 'Le nom est requis' }),
  sexe: z.enum(['Masculin', 'Féminin']),
  nationalite: z.string().min(1, { message: 'La nationalité est requise' }),
  sport_id: z.string().min(1, { message: 'Le sport est requis' })
})

type AthleteFormValues = z.infer<typeof athleteSchema>

export function AthletesPage() {
  const queryClient = useQueryClient()
  const auth = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<AthleteRecord | null>(null)
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
  const { data: athletes = [], isLoading, isError } = useQuery(['athletes'], fetchAthletes)

  const createMutation = useMutation(createAthlete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['athletes'])
      addToast('L\'athlète a été créé avec succès.', 'success')
      setModalOpen(false)
    },
    onError: () => addToast('Impossible de créer l\'athlète.', 'error')
  })

  const updateMutation = useMutation(updateAthlete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['athletes'])
      addToast('L\'athlète a été mis à jour.', 'success')
      setModalOpen(false)
      setSelectedAthlete(null)
    },
    onError: () => addToast('Impossible de mettre à jour l\'athlète.', 'error')
  })

  const deleteMutation = useMutation(deleteAthlete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['athletes'])
      addToast('L\'athlète a été supprimé.', 'success')
      setDeleteCandidate(null)
    },
    onError: () => addToast('Impossible de supprimer l\'athlète.', 'error')
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteSchema),
    defaultValues: { prenom: '', nom: '', sexe: 'Masculin', nationalite: '', sport_id: sports[0]?.id ?? '' }
  })

  useEffect(() => {
    if (sports.length > 0 && !selectedAthlete) {
      setValue('sport_id', sports[0].id)
    }
  }, [sports, selectedAthlete, setValue])

  const filteredAthletes = useMemo(() => {
    const search = searchText.trim().toLowerCase()
    return athletes.filter((athlete) =>
      `${athlete.prenom} ${athlete.nom}`.toLowerCase().includes(search) ||
      athlete.nationalite.toLowerCase().includes(search)
    )
  }, [athletes, searchText])

  const openNewModal = () => {
    setSelectedAthlete(null)
    reset({ prenom: '', nom: '', sexe: 'Masculin', nationalite: '', sport_id: sports[0]?.id ?? '' })
    setModalOpen(true)
  }

  const openEditModal = (record: AthleteRecord) => {
    setSelectedAthlete(record)
    reset({
      prenom: record.prenom,
      nom: record.nom,
      sexe: record.sexe,
      nationalite: record.nationalite,
      sport_id: record.sport_id
    })
    setModalOpen(true)
  }

  const handleDelete = (record: AthleteRecord) => {
    setDeleteCandidate(record)
  }

  const onSubmit = async (values: AthleteFormValues) => {
    if (!auth.user?.id) {
      addToast("Impossible de récupérer l'utilisateur connecté.", 'error')
      return
    }

    if (selectedAthlete) {
      await updateMutation.mutateAsync({ id: selectedAthlete.id, ...values })
      return
    }
    await createMutation.mutateAsync({ ...values, created_by: auth.user.id })
  }

  const actionLabel = selectedAthlete ? 'Modifier l\'athlète' : 'Créer l\'athlète'

  return (
    <AppShell title="Athlètes" description="Gérez les athlètes de la délégation.">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={openNewModal}
          aria-label="Créer un nouvel athlète"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
        >
          Nouvel athlète
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
            placeholder="Rechercher par nom ou nationalité"
            aria-label="Rechercher un athlète"
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
        ) : filteredAthletes.length === 0 ? (
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p className="font-medium">Aucun athlète trouvé.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAthletes.map((athlete) => (
              <div key={athlete.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {athlete.prenom} {athlete.nom}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {athlete.sexe} — {athlete.nationalite} — {athlete.sport_id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(athlete)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(athlete)}
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
        title={selectedAthlete ? 'Modifier l\'athlète' : 'Nouvel athlète'}
        description="Remplissez les informations de l\'athlète."
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Prénom
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('prenom')} />
              {errors.prenom ? <p className="text-xs text-red-600">{errors.prenom.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Nom
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('nom')} />
              {errors.nom ? <p className="text-xs text-red-600">{errors.nom.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Sexe
              <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('sexe')}>
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Nationalité
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('nationalite')} />
              {errors.nationalite ? <p className="text-xs text-red-600">{errors.nationalite.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
        title="Supprimer l\'athlète"
        description={
          deleteCandidate
            ? `Voulez-vous vraiment supprimer ${deleteCandidate.prenom} ${deleteCandidate.nom} ? Cette action est irréversible.`
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