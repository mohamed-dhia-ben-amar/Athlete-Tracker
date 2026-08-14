import { useMemo, useState } from 'react'
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
import { fetchOfficials, createOfficial, updateOfficial, deleteOfficial } from '../../services/officialService'
import type { OfficialRecord } from '../../types/competition'

const officialSchema = z.object({
  prenom: z.string().min(1, { message: 'Le prénom est requis' }),
  nom: z.string().min(1, { message: 'Le nom est requis' }),
  fonction: z.string().min(1, { message: 'La fonction est requise' }),
  nationalite: z.string().min(1, { message: 'La nationalité est requise' }),
  numero_passeport: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email({ message: 'Adresse e-mail invalide' }).optional(),
  actif: z.boolean().default(true)
})

type OfficialFormValues = z.infer<typeof officialSchema>

export function OfficialsPage() {
  const queryClient = useQueryClient()
  const auth = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOfficial, setSelectedOfficial] = useState<OfficialRecord | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<OfficialRecord | null>(null)
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>>([])
  const [searchText, setSearchText] = useState('')

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const { data: officials = [], isLoading, isError } = useQuery(['officials'], fetchOfficials)

  const createMutation = useMutation(createOfficial, {
    onSuccess: () => {
      queryClient.invalidateQueries(['officials'])
      addToast('L\'officiel a été créé avec succès.', 'success')
      setModalOpen(false)
    },
    onError: () => addToast('Impossible de créer l\'officiel.', 'error')
  })

  const updateMutation = useMutation(updateOfficial, {
    onSuccess: () => {
      queryClient.invalidateQueries(['officials'])
      addToast('L\'officiel a été mis à jour.', 'success')
      setModalOpen(false)
      setSelectedOfficial(null)
    },
    onError: () => addToast('Impossible de mettre à jour l\'officiel.', 'error')
  })

  const deleteMutation = useMutation(deleteOfficial, {
    onSuccess: () => {
      queryClient.invalidateQueries(['officials'])
      addToast('L\'officiel a été supprimé.', 'success')
      setDeleteCandidate(null)
    },
    onError: () => addToast('Impossible de supprimer l\'officiel.', 'error')
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<OfficialFormValues>({
    resolver: zodResolver(officialSchema),
    defaultValues: { prenom: '', nom: '', fonction: '', nationalite: '', numero_passeport: '', telephone: '', email: '', actif: true }
  })

  const filteredOfficials = useMemo(() => {
    const search = searchText.trim().toLowerCase()
    return officials.filter((official) =>
      `${official.prenom} ${official.nom}`.toLowerCase().includes(search) ||
      official.fonction.toLowerCase().includes(search) ||
      official.nationalite.toLowerCase().includes(search)
    )
  }, [officials, searchText])

  const openNewModal = () => {
    setSelectedOfficial(null)
    reset({ prenom: '', nom: '', fonction: '', nationalite: '', numero_passeport: '', telephone: '', email: '', actif: true })
    setModalOpen(true)
  }

  const openEditModal = (record: OfficialRecord) => {
    setSelectedOfficial(record)
    reset({
      prenom: record.prenom,
      nom: record.nom,
      fonction: record.fonction,
      nationalite: record.nationalite,
      numero_passeport: record.numero_passeport ?? '',
      telephone: record.telephone ?? '',
      email: record.email ?? '',
      actif: record.actif
    })
    setModalOpen(true)
  }

  const handleDelete = (record: OfficialRecord) => {
    setDeleteCandidate(record)
  }

  const onSubmit = async (values: OfficialFormValues) => {
    if (!auth.user?.id) {
      addToast("Impossible de récupérer l'utilisateur connecté.", 'error')
      return
    }

    if (selectedOfficial) {
      await updateMutation.mutateAsync({ id: selectedOfficial.id, ...values })
      return
    }
    await createMutation.mutateAsync({ ...values, created_by: auth.user.id })
  }

  const actionLabel = selectedOfficial ? 'Modifier l\'officiel' : 'Créer l\'officiel'

  return (
    <AppShell title="Officiels" description="Gérez les officiels de la délégation.">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={openNewModal}
          aria-label="Créer un nouvel officiel"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto sm:px-4 sm:py-3 sm:text-sm"
        >
          Nouvel officiel
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
            placeholder="Rechercher par nom, fonction ou nationalité"
            aria-label="Rechercher un officiel"
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
        ) : filteredOfficials.length === 0 ? (
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p className="font-medium">Aucun officiel trouvé.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOfficials.map((official) => (
              <div key={official.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {official.prenom} {official.nom}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {official.fonction} — {official.nationalite}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(official)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(official)}
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
        title={selectedOfficial ? 'Modifier l\'officiel' : 'Nouvel officiel'}
        description="Remplissez les informations de l\'officiel."
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
              Fonction
              <select className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('fonction')}>
                <option value="">Sélectionner une fonction</option>
                <option value="Chef de délégation">Chef de délégation</option>
                <option value="Entraîneur">Entraîneur</option>
                <option value="Médecin">Médecin</option>
                <option value="Kinésithérapeute">Kinésithérapeute</option>
                <option value="Manager">Manager</option>
                <option value="Arbitre">Arbitre</option>
              </select>
              {errors.fonction ? <p className="text-xs text-red-600">{errors.fonction.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Nationalité
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('nationalite')} />
              {errors.nationalite ? <p className="text-xs text-red-600">{errors.nationalite.message}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Numéro de passeport
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('numero_passeport')} />
            </label>
            <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              Téléphone
              <input type="text" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('telephone')} />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Email
            <input type="email" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" {...register('email')} />
            {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
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
        title="Supprimer l\'officiel"
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