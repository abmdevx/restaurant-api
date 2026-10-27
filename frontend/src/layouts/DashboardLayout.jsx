import { Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../hooks/useAuth'

export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const name = user?.name?.split(' ')[0] || 'there'
  const role = user?.role || 'customer'
  const logout = async () => { await signOut(); navigate('/', { replace: true }) }

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-stone-900 dark:bg-[#141210] dark:text-stone-100">
      <header className="flex h-20 items-center justify-between border-b border-stone-200 bg-white px-5 dark:border-stone-800 dark:bg-stone-900/60 sm:px-10">
        <Logo />
        <div className="flex items-center gap-4 sm:gap-5">
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-sm text-stone-600 dark:text-stone-400">Hi, {name}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              role === 'admin'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
            }`}>
              {role}
            </span>
          </div>
          <button
            className="text-xs font-bold text-amber-600 transition hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
