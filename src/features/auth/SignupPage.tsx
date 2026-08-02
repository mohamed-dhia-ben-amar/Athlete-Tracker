import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

const signupSchema = z
  .object({
    email: z.string().email({ message: 'Adresse e-mail invalide' }),
    password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
    confirmPassword: z.string().min(6, { message: 'Confirmation requise' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit = async (values: SignupFormValues) => {
    setError(null)
    const { error } = await auth.signUp(values.email, values.password)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Athletes Tracker</p>
          <h1 className="mt-3 text-3xl font-semibold">Créer un compte</h1>
          <p className="mt-2 text-sm text-slate-500">Inscrivez-vous pour gérer vos compétitions.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Adresse e-mail</label>
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
              {...register('email')}
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</label>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
              {...register('password')}
            />
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmer le mot de passe</label>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-200">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Création du compte…' : 'Créer un compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline dark:text-slate-100">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
