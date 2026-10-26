import { Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../hooks/useAuth'

export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const name = user?.name?.split(' ')[0] || 'there'
  const logout = async () => { await signOut(); navigate('/', { replace: true }) }

  return <div className="min-h-screen bg-[#fcfaf6] text-stone-900 dark:bg-[#141210] dark:text-stone-100">
    <header className="flex h-20 items-center justify-between border-b border-stone-200 bg-white px-5 dark:border-stone-800 dark:bg-stone-900/60 sm:px-10">
      <Logo />
      <div className="flex items-center gap-5">
        <ThemeToggle />
        <span className="hidden text-sm text-stone-500 sm:inline dark:text-stone-400">Hi, {name}</span>
        <button className="text-xs font-bold text-amber-600 dark:text-amber-400" onClick={logout}>Sign out</button>
      </div>
    </header>
    <Outlet />
  </div>
}
