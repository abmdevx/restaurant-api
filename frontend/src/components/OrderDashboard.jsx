import { useEffect, useMemo, useState } from 'react'
import { getAllMenuItems } from '../api/menuApi'
import {
  addItemsToOrder,
  cancelOrder,
  getAllOrders,
  placeOrder,
  processPayment,
  updateOrderStatus,
} from '../api/orderApi'
import { getAllTables } from '../api/tableApi'
import { useToast } from '../hooks/useToast'

const ORDER_STATUSES = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'preparing', label: 'In Kitchen' },
  { id: 'ready', label: 'Ready' },
  { id: 'served', label: 'Served' },
  { id: 'cancelled', label: 'Cancelled' },
]

export function OrderDashboard({ user }) {
  const { toast, confirm } = useToast()

  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [tableFilter, setTableFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false)
  const [paymentModalOrder, setPaymentModalOrder] = useState(null)
  const [addItemsModalOrder, setAddItemsModalOrder] = useState(null)
  const [detailModalOrder, setDetailModalOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // New Order Form state
  const [selectedTableId, setSelectedTableId] = useState('')
  const [orderCart, setOrderCart] = useState([])
  const [orderNotes, setOrderNotes] = useState('')
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all')

  // Payment Form state
  const [paymentMethod, setPaymentMethod] = useState('card')

  // Add Items state
  const [additionalCart, setAdditionalCart] = useState([])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersRes, tablesRes, menuRes] = await Promise.all([
        getAllOrders(),
        getAllTables(),
        getAllMenuItems(),
      ])
      setOrders(ordersRes.data || [])
      setTables(tablesRes.data || [])
      setMenuItems(menuRes.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load order data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // KPI Calculations
  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) =>
      ['pending', 'preparing', 'ready'].includes(o.status)
    )
    const inKitchen = orders.filter((o) => o.status === 'preparing')
    const readyToServe = orders.filter((o) => o.status === 'ready')
    const servedPendingPayment = orders.filter(
      (o) => o.status === 'served' && o.paymentStatus !== 'paid'
    )
    const todayRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

    return {
      activeCount: activeOrders.length,
      inKitchenCount: inKitchen.length,
      readyCount: readyToServe.length,
      servedPendingPaymentCount: servedPendingPayment.length,
      todayRevenue,
    }
  }, [orders])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false
      }
      if (tableFilter !== 'all' && order.table?._id !== tableFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTable = `table ${order.table?.tableNumber}`.includes(q)
        const matchesServer = order.servedBy?.name?.toLowerCase().includes(q)
        const matchesItem = order.items?.some((i) =>
          i.name?.toLowerCase().includes(q)
        )
        if (!matchesTable && !matchesServer && !matchesItem) return false
      }
      return true
    })
  }, [orders, statusFilter, tableFilter, searchQuery])

  // Status Badge styles
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Approval',
          className:
            'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        }
      case 'preparing':
        return {
          label: 'In Kitchen',
          className:
            'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
        }
      case 'ready':
        return {
          label: 'Ready for Service',
          className:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        }
      case 'served':
        return {
          label: 'Served to Table',
          className:
            'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          className:
            'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
        }
      default:
        return {
          label: status,
          className:
            'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
        }
    }
  }

  // Handle Quick Status Advance
  const handleAdvanceStatus = async (order, nextStatus) => {
    try {
      await updateOrderStatus(order._id, nextStatus)
      toast.success(
        `Order for Table ${order.table?.tableNumber} is now ${nextStatus}!`,
        'Order Updated'
      )
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Could not update status', 'Error')
    }
  }

  // Handle Cancel Order
  const handleCancelOrder = async (order) => {
    const confirmed = await confirm({
      title: `Cancel Order for Table ${order.table?.tableNumber}?`,
      message:
        'Are you sure you want to cancel this order? Any reserved inventory ingredients will be restored.',
      confirmText: 'Cancel Order',
      cancelText: 'Keep Active',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      await cancelOrder(order._id)
      toast.success(
        `Order for Table ${order.table?.tableNumber} was cancelled.`,
        'Order Cancelled'
      )
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Could not cancel order', 'Action Failed')
    }
  }

  // Handle Payment Submit
  const handleProcessPaymentSubmit = async (e) => {
    e.preventDefault()
    if (!paymentModalOrder) return

    setSubmitting(true)
    try {
      await processPayment(paymentModalOrder._id, paymentMethod)
      toast.success(
        `Payment of $${paymentModalOrder.totalAmount?.toFixed(
          2
        )} collected via ${paymentMethod.toUpperCase()}! Table ${
          paymentModalOrder.table?.tableNumber
        } is now available.`,
        'Payment Settled'
      )
      setPaymentModalOrder(null)
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to process payment', 'Payment Error')
    } finally {
      setSubmitting(false)
    }
  }

  // Cart operations for New Order
  const handleAddToCart = (menuItem) => {
    setOrderCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem._id)
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItem._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [
        ...prev,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          notes: '',
        },
      ]
    })
  }

  const handleUpdateCartQty = (menuItemId, delta) => {
    setOrderCart((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const nextQty = i.quantity + delta
            return nextQty > 0 ? { ...i, quantity: nextQty } : null
          }
          return i
        })
        .filter(Boolean)
    )
  }

  const handleCartItemNotes = (menuItemId, notes) => {
    setOrderCart((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, notes } : i))
    )
  }

  const cartTotal = useMemo(() => {
    return orderCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [orderCart])

  // Submit New Order
  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault()

    if (!selectedTableId) {
      toast.warning('Please select a table for this order.')
      return
    }

    if (orderCart.length === 0) {
      toast.warning('Please add at least one menu item to the order ticket.')
      return
    }

    setSubmitting(true)
    try {
      const itemsPayload = orderCart.map((i) => ({
        menuItem: i.menuItemId,
        quantity: i.quantity,
        notes: i.notes?.trim() || undefined,
      }))

      await placeOrder({
        tableId: selectedTableId,
        items: itemsPayload,
        notes: orderNotes.trim() || undefined,
      })

      const targetTable = tables.find((t) => t._id === selectedTableId)
      toast.success(
        `Order placed successfully for Table ${
          targetTable?.tableNumber || ''
        }! Ticket sent to kitchen.`,
        'Order Placed'
      )
      setNewOrderModalOpen(false)
      setOrderCart([])
      setOrderNotes('')
      setSelectedTableId('')
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Could not place order', 'Order Failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Add Items Cart Operations
  const handleAddToAdditionalCart = (menuItem) => {
    setAdditionalCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem._id)
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItem._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [
        ...prev,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          notes: '',
        },
      ]
    })
  }

  const handleUpdateAdditionalQty = (menuItemId, delta) => {
    setAdditionalCart((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const nextQty = i.quantity + delta
            return nextQty > 0 ? { ...i, quantity: nextQty } : null
          }
          return i
        })
        .filter(Boolean)
    )
  }

  const handleAddItemsSubmit = async (e) => {
    e.preventDefault()
    if (!addItemsModalOrder) return

    if (additionalCart.length === 0) {
      toast.warning('Please select at least one item to add to the order.')
      return
    }

    setSubmitting(true)
    try {
      const itemsPayload = additionalCart.map((i) => ({
        menuItem: i.menuItemId,
        quantity: i.quantity,
        notes: i.notes?.trim() || undefined,
      }))

      await addItemsToOrder(addItemsModalOrder._id, itemsPayload)
      toast.success(
        `Added ${additionalCart.length} items to Table ${
          addItemsModalOrder.table?.tableNumber || ''
        }'s order.`,
        'Order Updated'
      )
      setAddItemsModalOrder(null)
      setAdditionalCart([])
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Could not add items', 'Action Failed')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredMenuItems = useMemo(() => {
    if (menuCategoryFilter === 'all') return menuItems
    return menuItems.filter((i) => i.category === menuCategoryFilter)
  }, [menuItems, menuCategoryFilter])

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">
            Kitchen & Dining Service
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            Order <span className="font-serif italic text-amber-600 dark:text-amber-400">Operations</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Manage live kitchen tickets, food preparation flow, table service, and bill settlements.
          </p>
        </div>

        <button
          onClick={() => {
            setOrderCart([])
            setOrderNotes('')
            setSelectedTableId('')
            setNewOrderModalOpen(true)
          }}
          className="flex items-center gap-2 self-start rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-600 sm:self-center"
        >
          <span>+ New Table Order</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Active Tickets
          </span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {stats.activeCount}{' '}
            <span className="text-xs font-normal text-stone-400">tables</span>
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              In Kitchen
            </span>
            {stats.inKitchenCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            )}
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
            {stats.inKitchenCount}{' '}
            <span className="text-xs font-normal text-stone-400">cooking</span>
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Ready to Serve
          </span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {stats.readyCount}{' '}
            <span className="text-xs font-normal text-stone-400">ready</span>
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
            Total Settled Revenue
          </span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            ${stats.todayRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by table, item, or server…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-[#fdfbf7] py-2 pl-9 pr-4 text-xs text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
            <span className="absolute left-3 top-2.5 text-stone-400 text-xs">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Table Filter Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-stone-600 dark:text-stone-400">
              Filter by Table:
            </span>
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="rounded-xl border border-stone-200 bg-[#fdfbf7] px-3 py-1.5 text-xs text-stone-800 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
            >
              <option value="all">All Tables</option>
              {tables.map((t) => (
                <option key={t._id} value={t._id}>
                  Table {t.tableNumber} ({t.location})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-3 dark:border-stone-800">
          {ORDER_STATUSES.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === st.id
                  ? 'bg-amber-500 text-white shadow-xs hover:bg-amber-600'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="py-24 text-center text-sm text-stone-400">
            Loading order tickets…
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-16 text-center dark:border-stone-800">
            <span className="text-3xl text-amber-500">✦</span>
            <p className="mt-3 text-base font-medium text-stone-800 dark:text-stone-200">
              {orders.length === 0
                ? 'No active orders placed yet'
                : 'No orders match this filter'}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {orders.length === 0
                ? 'Click "+ New Table Order" above to place your first dining order.'
                : 'Try switching status or table filters.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusBadge(order.status)
              const tableNum = order.table?.tableNumber || '—'
              const tableLocation = order.table?.location || ''
              const isPaid = order.paymentStatus === 'paid'

              return (
                <div
                  key={order._id}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-amber-400 dark:border-stone-800 dark:bg-stone-900/60"
                >
                  <div>
                    {/* Header: Table & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                            Table {tableNum}
                          </h3>
                          {tableLocation && (
                            <span className="capitalize text-[10px] text-stone-400 dark:text-stone-500 font-semibold">
                              · {tableLocation}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                        {isPaid ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.2 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            ✓ Paid ({order.paymentMethod})
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-stone-400">
                            Unpaid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Items Snapshot */}
                    <div className="mt-4 space-y-1.5 border-t border-stone-100 pt-3 dark:border-stone-800/80">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {item.quantity}×
                            </span>
                            <span className="truncate text-stone-800 dark:text-stone-200">
                              {item.name}
                            </span>
                          </div>
                          <span className="shrink-0 font-medium text-stone-500 dark:text-stone-400">
                            ${(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                      <p className="mt-3 rounded-lg bg-[#fdfbf7] p-2 text-[11px] italic text-stone-500 dark:bg-stone-800/50 dark:text-stone-400">
                        "{order.notes}"
                      </p>
                    )}

                    {/* Total Amount */}
                    <div className="mt-4 flex items-baseline justify-between border-t border-stone-100 pt-3 dark:border-stone-800/80">
                      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                        Total Amount
                      </span>
                      <span className="text-lg font-bold text-stone-900 dark:text-stone-100">
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 border-t border-stone-100 pt-3 dark:border-stone-800/80">
                    <div className="flex flex-col gap-2">
                      {/* Kitchen / Service Workflow Controls */}
                      {order.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleAdvanceStatus(order, 'preparing')
                            }
                            className="flex-1 rounded-xl bg-orange-500 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-orange-600"
                          >
                            🍳 Start Preparing
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 dark:border-stone-700 dark:hover:bg-rose-950/40"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {order.status === 'preparing' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAdvanceStatus(order, 'ready')}
                            className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                          >
                            🔔 Mark Ready for Server
                          </button>
                          <button
                            onClick={() => {
                              setAddItemsModalOrder(order)
                              setAdditionalCart([])
                            }}
                            className="rounded-xl border border-stone-200 px-2.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                            title="Add items to this order"
                          >
                            + Items
                          </button>
                        </div>
                      )}

                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleAdvanceStatus(order, 'served')}
                          className="w-full rounded-xl bg-sky-600 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-sky-700"
                        >
                          🍽️ Deliver & Mark Served
                        </button>
                      )}

                      {order.status === 'served' && !isPaid && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setPaymentModalOrder(order)
                              setPaymentMethod('card')
                            }}
                            className="flex-1 rounded-xl bg-amber-500 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600"
                          >
                            💳 Process Payment & Settle
                          </button>
                          <button
                            onClick={() => {
                              setAddItemsModalOrder(order)
                              setAdditionalCart([])
                            }}
                            className="rounded-xl border border-stone-200 px-2.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                            title="Add drinks or dessert"
                          >
                            + Add
                          </button>
                        </div>
                      )}

                      {isPaid && (
                        <div className="text-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Table checked out & settled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── New Table Order Modal (POS Style) ─────────────────────────── */}
      {newOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 p-6 dark:border-stone-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                  Point of Sale
                </span>
                <h3 className="mt-1 font-serif text-2xl font-medium">
                  Create Table Order
                </h3>
              </div>
              <button
                onClick={() => setNewOrderModalOpen(false)}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Split 2 columns (Menu Items Browser & Ticket Cart) */}
            <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px]">
              {/* Left Column: Menu Items Browser */}
              <div className="flex flex-col border-r border-stone-100 p-6 overflow-y-auto dark:border-stone-800">
                {/* Table Picker */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Select Dining Table
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-stone-200 bg-[#fdfbf7] p-3 text-xs text-stone-900 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  >
                    <option value="">-- Choose a table --</option>
                    {tables.map((t) => (
                      <option key={t._id} value={t._id}>
                        Table {t.tableNumber} ({t.capacity} seats ·{' '}
                        {t.location} · {t.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Pills */}
                <div className="mb-4 flex flex-wrap items-center gap-1.5">
                  {['all', 'starter', 'main', 'dessert', 'beverage', 'side'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setMenuCategoryFilter(cat)}
                        className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition ${
                          menuCategoryFilter === cat
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>

                {/* Menu Items Cards */}
                {filteredMenuItems.length === 0 ? (
                  <div className="py-16 text-center text-xs text-stone-400">
                    No menu items available in this category.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto">
                    {filteredMenuItems.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleAddToCart(item)}
                        className="flex cursor-pointer flex-col justify-between rounded-xl border border-stone-200 bg-[#fdfbf7] p-3 transition hover:border-amber-400 hover:bg-white dark:border-stone-800 dark:bg-stone-800/40 dark:hover:bg-stone-800"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                            {item.category}
                          </span>
                          <h4 className="mt-1 font-semibold text-xs text-stone-900 dark:text-stone-100 line-clamp-1">
                            {item.name}
                          </h4>
                          {item.description && (
                            <p className="mt-1 text-[11px] text-stone-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 dark:border-stone-800">
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                            ${item.price?.toFixed(2)}
                          </span>
                          <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            + Add
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Order Ticket / Cart */}
              <div className="flex flex-col justify-between bg-[#faf8f5] p-6 dark:bg-stone-950/40">
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3 dark:border-stone-800">
                    <h4 className="font-serif text-lg font-medium">
                      Order Ticket
                    </h4>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {orderCart.length} {orderCart.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto py-3 space-y-3">
                    {orderCart.length === 0 ? (
                      <div className="py-20 text-center text-xs text-stone-400">
                        Click on menu items to add them to this table order.
                      </div>
                    ) : (
                      orderCart.map((cartItem) => (
                        <div
                          key={cartItem.menuItemId}
                          className="rounded-xl border border-stone-200 bg-white p-3 shadow-2xs dark:border-stone-800 dark:bg-stone-900"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-stone-900 dark:text-stone-100 truncate pr-2">
                              {cartItem.name}
                            </span>
                            <span className="font-semibold text-stone-900 dark:text-stone-100 shrink-0">
                              ${(cartItem.price * cartItem.quantity).toFixed(2)}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateCartQty(cartItem.menuItemId, -1)
                                }
                                className="flex h-6 w-6 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                              >
                                -
                              </button>
                              <span className="font-bold text-xs">
                                {cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateCartQty(cartItem.menuItemId, 1)
                                }
                                className="flex h-6 w-6 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                              >
                                +
                              </button>
                            </div>

                            <input
                              type="text"
                              placeholder="Notes (e.g. no onions)"
                              value={cartItem.notes}
                              onChange={(e) =>
                                handleCartItemNotes(
                                  cartItem.menuItemId,
                                  e.target.value
                                )
                              }
                              className="w-32 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] outline-none dark:border-stone-700 dark:bg-stone-800"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Kitchen Special Instructions */}
                  <div className="border-t border-stone-200 pt-3 dark:border-stone-800">
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                      Table Instructions / Allergy Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Birthday table, guest allergic to shellfish"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-900"
                    />
                  </div>
                </div>

                {/* Total & Submit Button */}
                <div className="border-t border-stone-200 pt-4 dark:border-stone-800 mt-4">
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                      Total Due:
                    </span>
                    <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlaceOrderSubmit}
                    disabled={submitting || !selectedTableId || orderCart.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 disabled:opacity-50"
                  >
                    {submitting ? 'Placing Order…' : 'Send Ticket to Kitchen →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Items to Order Modal ──────────────────────────────────── */}
      {addItemsModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 p-6 dark:border-stone-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                  Append to Ticket
                </span>
                <h3 className="mt-1 font-serif text-2xl font-medium">
                  Add Items to Table {addItemsModalOrder.table?.tableNumber}
                </h3>
              </div>
              <button
                onClick={() => setAddItemsModalOrder(null)}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <p className="mb-3 text-xs font-semibold text-stone-600 dark:text-stone-400">
                Choose additional dishes or drinks:
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {menuItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleAddToAdditionalCart(item)}
                    className="flex cursor-pointer flex-col justify-between rounded-xl border border-stone-200 bg-[#fdfbf7] p-2.5 transition hover:border-amber-400 dark:border-stone-800 dark:bg-stone-800/40"
                  >
                    <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {item.name}
                    </span>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span>${item.price?.toFixed(2)}</span>
                      <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        + Add
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Additional Items */}
              {additionalCart.length > 0 && (
                <div className="mt-6 border-t border-stone-100 pt-4 dark:border-stone-800">
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    Items to Add ({additionalCart.length})
                  </h4>
                  <div className="space-y-2">
                    {additionalCart.map((i) => (
                      <div
                        key={i.menuItemId}
                        className="flex items-center justify-between rounded-lg bg-stone-50 p-2 text-xs dark:bg-stone-800/60"
                      >
                        <span className="font-medium">{i.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateAdditionalQty(i.menuItemId, -1)
                            }
                            className="h-5 w-5 rounded bg-white border text-center dark:bg-stone-700"
                          >
                            -
                          </button>
                          <span className="font-bold">{i.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateAdditionalQty(i.menuItemId, 1)
                            }
                            className="h-5 w-5 rounded bg-white border text-center dark:bg-stone-700"
                          >
                            +
                          </button>
                          <span className="font-bold ml-2">
                            ${(i.price * i.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-stone-100 p-5 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setAddItemsModalOrder(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddItemsSubmit}
                disabled={submitting || additionalCart.length === 0}
                className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600 disabled:opacity-50"
              >
                {submitting ? 'Updating Ticket…' : 'Confirm & Send to Kitchen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Process Payment Modal ─────────────────────────────────────── */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  Bill Settlement
                </span>
                <h3 className="mt-1 font-serif text-2xl font-medium">
                  Collect Payment
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Table {paymentModalOrder.table?.tableNumber} ·{' '}
                  {paymentModalOrder.items?.length} items
                </p>
              </div>
              <button
                onClick={() => setPaymentModalOrder(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            {/* Bill Receipt Preview */}
            <div className="mt-5 rounded-2xl border border-stone-200 bg-[#fdfbf7] p-4 text-xs dark:border-stone-800 dark:bg-stone-800/40">
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {paymentModalOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>${(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-stone-200 pt-3 font-bold text-sm text-stone-900 dark:border-stone-700 dark:text-stone-100">
                <span>Total Bill Amount:</span>
                <span className="font-serif text-xl text-amber-600 dark:text-amber-400">
                  ${paymentModalOrder.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleProcessPaymentSubmit} className="mt-5 grid gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Select Payment Method
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { id: 'card', label: '💳 Card' },
                    { id: 'cash', label: '💵 Cash' },
                    { id: 'online', label: '📱 Online' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`rounded-xl border p-2.5 text-center text-xs font-bold transition ${
                        paymentMethod === pm.id
                          ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Processing payment will mark this order as paid and immediately free
                Table {paymentModalOrder.table?.tableNumber} for new incoming guests.
              </p>

              <div className="mt-2 flex items-center justify-end gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalOrder(null)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {submitting ? 'Processing…' : `Confirm Payment ($${paymentModalOrder.totalAmount?.toFixed(2)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

