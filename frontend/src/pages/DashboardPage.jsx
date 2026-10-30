import { useEffect, useState } from 'react'
import { AdminDashboard } from '../components/AdminDashboard'
import { CustomerDashboard } from '../components/CustomerDashboard'
import { InventoryDashboard } from '../components/InventoryDashboard'
import { MenuDashboard } from '../components/MenuDashboard'
import { OrderDashboard } from '../components/OrderDashboard'
import { useAuth } from '../hooks/useAuth'

// Admin tabs config
const ADMIN_TABS = [
  { id: 'tables', label: '🍽️ Floor Tables' },
  { id: 'orders', label: '📝 Kitchen & Orders' },
  { id: 'menu', label: '🍴 Menu' },
  { id: 'inventory', label: '📦 Inventory & Stock' },
]

export function DashboardPage({ defaultAdminTab = 'tables' }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [viewMode, setViewMode] = useState(isAdmin ? 'admin' : 'customer')
  const [adminTab, setAdminTab] = useState(defaultAdminTab) // 'tables' | 'orders' | 'menu' | 'inventory'

  useEffect(() => {
    if (defaultAdminTab) {
      setAdminTab(defaultAdminTab)
    }
  }, [defaultAdminTab])

  return (
    <main className="min-h-[calc(100vh-5rem)]">
      {isAdmin && (
        <div className="border-b border-stone-200 bg-amber-500/5 px-5 py-2.5 dark:border-stone-800 sm:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
            {/* Admin Modules Switcher */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-500 dark:text-stone-400">
                Admin Module:
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-900">
                {ADMIN_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setViewMode('admin')
                      setAdminTab(tab.id)
                    }}
                    className={`rounded-lg px-3 py-1 font-semibold transition ${
                      viewMode === 'admin' && adminTab === tab.id
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Switcher */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-stone-500">Mode:</span>
              <button
                onClick={() => setViewMode(viewMode === 'admin' ? 'customer' : 'admin')}
                className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                {viewMode === 'admin' ? '👀 Preview as Customer' : '🛡️ Return to Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'customer' ? (
        <CustomerDashboard user={user} />
      ) : adminTab === 'orders' ? (
        <OrderDashboard user={user} />
      ) : adminTab === 'menu' ? (
        <MenuDashboard user={user} />
      ) : adminTab === 'inventory' ? (
        <InventoryDashboard user={user} />
      ) : (
        <AdminDashboard user={user} />
      )}
    </main>
  )
}
