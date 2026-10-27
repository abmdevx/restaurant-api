import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../api/authApi'
import { Button } from '../components/Button'
import { useAuth } from '../hooks/useAuth'

function EyeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  )
}

function EyeOffIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  )
}

export function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const baseInputClass = 'w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-600'
  return <form className="mt-9 grid gap-5" onSubmit={submit}>
    {isRegister && <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">Full name<input className={`mt-2 ${baseInputClass}`} name="name" type="text" autoComplete="name" placeholder="Your name" value={form.name} onChange={update} minLength="2" required /></label>}
    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">Email address<input className={`mt-2 ${baseInputClass}`} name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required /></label>
    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">
      Password
      <div className="relative mt-2">
        <input
          className={`${baseInputClass} pr-11`}
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
          value={form.password}
          onChange={update}
          minLength={isRegister ? '8' : undefined}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 transition hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:text-stone-500 dark:hover:text-stone-300"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
    </label>
    {isRegister && (
      <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">
        Confirm password
        <div className="relative mt-2">
          <input
            className={`${baseInputClass} pr-11`}
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={update}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-stone-400 transition hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:text-stone-500 dark:hover:text-stone-300"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            title={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </label>
    )}
    {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">{error}</p>}
    <Button type="submit" disabled={loading}>{loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <span aria-hidden="true">→</span></Button>
    <p className="text-center text-xs text-stone-500 dark:text-stone-400">{isRegister ? 'Already have an account?' : 'New to Restora?'} <Link className="font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
  </form>
}
