import { useState } from 'react'
import { AdminDashboard } from '../components/AdminDashboard'
import { CustomerDashboard } from '../components/CustomerDashboard'
import { useAuth } from '../hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [viewMode, setViewMode] = useState(isAdmin ? 'admin' : 'customer')

  return (
    <main className="min-h-[calc(100vh-5rem)]">
      {isAdmin && (
        <div className="border-b border-stone-200 bg-amber-500/5 px-5 py-2.5 dark:border-stone-800 sm:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between text-xs">
            <span className="text-stone-600 dark:text-stone-400">
              Logged in as <strong className="text-amber-600 dark:text-amber-400">Administrator</strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-stone-500">View as:</span>
              <button
                onClick={() => setViewMode('admin')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  viewMode === 'admin'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                Admin (Table Management)
              </button>
              <button
                onClick={() => setViewMode('customer')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  viewMode === 'customer'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                Customer (Reservations)
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'admin' ? (
        <AdminDashboard user={user} />
      ) : (
        <CustomerDashboard user={user} />
      )}
    </main>
  )
}
