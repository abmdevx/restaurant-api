import { useOutletContext } from 'react-router-dom'
import { AdminDashboard } from '../components/AdminDashboard'
import { CustomerDashboard } from '../components/CustomerDashboard'
import { InventoryDashboard } from '../components/InventoryDashboard'
import { MenuDashboard } from '../components/MenuDashboard'
import { OrderDashboard } from '../components/OrderDashboard'
import { useAuth } from '../hooks/useAuth'

export function DashboardPage({ defaultAdminTab = 'tables' }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  // previewCustomer is controlled by DashboardLayout (header toggle button)
  const { previewCustomer } = useOutletContext() ?? {}

  // Non-admins always see customer view; admins can toggle
  if (!isAdmin || previewCustomer) {
    return (
      <main className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
        <CustomerDashboard user={user} />
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
      {defaultAdminTab === 'orders' ? (
        <OrderDashboard user={user} />
      ) : defaultAdminTab === 'menu' ? (
        <MenuDashboard user={user} />
      ) : defaultAdminTab === 'inventory' ? (
        <InventoryDashboard user={user} />
      ) : (
        <AdminDashboard user={user} />
      )}
    </main>
  )
}
