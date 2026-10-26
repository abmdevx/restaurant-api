import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../api/authApi'
import { Button } from '../components/Button'
import { useAuth } from '../hooks/useAuth'

export function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (isRegister && form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const payload = isRegister
        ? await registerUser({ name: form.name, email: form.email, password: form.password })
        : await loginUser({ email: form.email, password: form.password })
      if (isRegister) navigate('/login', { replace: true, state: { registered: true } })
      else { signIn(payload.data); navigate('/dashboard', { replace: true }) }
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-600'
  return <form className="mt-9 grid gap-5" onSubmit={submit}>
    {isRegister && <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Full name<input className={inputClass} name="name" type="text" autoComplete="name" placeholder="Your name" value={form.name} onChange={update} minLength="2" required /></label>}
    <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Email address<input className={inputClass} name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required /></label>
    <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Password<input className={inputClass} name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? 'At least 8 characters' : 'Your password'} value={form.password} onChange={update} minLength={isRegister ? '8' : undefined} required /></label>
    {isRegister && <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Confirm password<input className={inputClass} name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat your password" value={form.confirmPassword} onChange={update} required /></label>}
    {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">{error}</p>}
    <Button type="submit" disabled={loading}>{loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <span aria-hidden="true">→</span></Button>
    <p className="text-center text-xs text-stone-500 dark:text-stone-400">{isRegister ? 'Already have an account?' : 'New to Restora?'} <Link className="font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
  </form>
}
