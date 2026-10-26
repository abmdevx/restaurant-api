import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

export function PublicHeader() {
  const { user } = useAuth()
  return <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
    <Logo />
    <nav className="hidden items-center gap-8 text-sm text-stone-500 lg:flex dark:text-stone-400" aria-label="Main navigation">
      <a className="transition hover:text-amber-600 dark:hover:text-amber-400" href="#experience">Experience</a>
      <a className="transition hover:text-amber-600 dark:hover:text-amber-400" href="#features">Features</a>
      <a className="transition hover:text-amber-600 dark:hover:text-amber-400" href="#story">Our story</a>
    </nav>
    <div className="flex items-center gap-2 sm:gap-3">
      <ThemeToggle />
      {user ? <Link className="hidden rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 sm:inline-block dark:text-stone-200 dark:hover:bg-stone-800" to="/dashboard">Dashboard</Link> : <Link className="hidden rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 sm:inline-block dark:text-stone-200 dark:hover:bg-stone-800" to="/login">Sign in</Link>}
      {!user && <Link className="rounded-full bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-600 sm:px-5 sm:text-sm" to="/register">Get started <span aria-hidden="true">↗</span></Link>}
    </div>
  </header>
}
