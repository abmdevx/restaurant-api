import { useEffect, useMemo, useState } from 'react'
import {
  addInventoryItem,
  deductInventory,
  deleteInventoryItem,
  getAllInventory,
  restockInventory,
  updateInventoryItem,
} from '../api/inventoryApi'
import { useToast } from '../hooks/useToast'

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'produce', label: 'Produce' },
  { id: 'meat', label: 'Meat & Poultry' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'beverage', label: 'Beverages' },
  { id: 'dry-goods', label: 'Dry Goods' },
  { id: 'other', label: 'Other' },
]

export function InventoryDashboard({ user }) {
  const { toast, confirm } = useToast()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [onlyLowStock, setOnlyLowStock] = useState(false)

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [restockModalItem, setRestockModalItem] = useState(null)
  const [deductModalItem, setDeductModalItem] = useState(null)
  const [historyModalItem, setHistoryModalItem] = useState(null)
  const [modalSubmitting, setModalSubmitting] = useState(false)

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'produce',
    quantity: '0',
    unit: 'kg',
    lowStockThreshold: '10',
    costPerUnit: '',
    supplier: '',
  })

  const [adjustmentForm, setAdjustmentForm] = useState({
    quantity: '',
    reason: '',
  })

  const loadInventory = async () => {
    try {
      setLoading(true)
      const res = await getAllInventory()
      setItems(res.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load inventory items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  // KPI Calculations
  const stats = useMemo(() => {
    const totalCount = items.length
    const lowStockItems = items.filter((i) => i.quantity <= i.lowStockThreshold)
    const lowStockCount = lowStockItems.length
    const totalValuation = items.reduce(
      (sum, i) => sum + (i.quantity || 0) * (i.costPerUnit || 0),
      0
    )
    const activeCategories = new Set(items.map((i) => i.category)).size

    return {
      totalCount,
      lowStockItems,
      lowStockCount,
      totalValuation,
      activeCategories,
    }
  }, [items])

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (onlyLowStock && item.quantity > item.lowStockThreshold) {
        return false
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = item.name?.toLowerCase().includes(q)
        const matchesSupplier = item.supplier?.toLowerCase().includes(q)
        const matchesCategory = item.category?.toLowerCase().includes(q)
        if (!matchesName && !matchesSupplier && !matchesCategory) return false
      }
      return true
    })
  }, [items, selectedCategory, onlyLowStock, searchQuery])

  // Open Add Item Modal
  const handleOpenAddModal = () => {
    setEditingItem(null)
    setItemForm({
      name: '',
      category: 'produce',
      quantity: '0',
      unit: 'kg',
      lowStockThreshold: '10',
      costPerUnit: '',
      supplier: '',
    })
    setItemModalOpen(true)
  }

  // Open Edit Item Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item)
    setItemForm({
      name: item.name || '',
      category: item.category || 'produce',
      quantity: (item.quantity ?? 0).toString(),
      unit: item.unit || 'kg',
      lowStockThreshold: (item.lowStockThreshold ?? 10).toString(),
      costPerUnit: item.costPerUnit ? item.costPerUnit.toString() : '',
      supplier: item.supplier || '',
    })
    setItemModalOpen(true)
  }

  // Save Add/Edit Item
  const handleSaveItem = async (e) => {
    e.preventDefault()

    const name = itemForm.name.trim()
    const unit = itemForm.unit.trim()
    const category = itemForm.category
    const lowStockThreshold = Number.parseFloat(itemForm.lowStockThreshold) || 10
    const costPerUnit = itemForm.costPerUnit ? Number.parseFloat(itemForm.costPerUnit) : undefined
    const supplier = itemForm.supplier.trim() || undefined

    if (!name) {
      toast.warning('Please enter an item name.')
      return
    }
    if (!unit) {
      toast.warning('Please specify a measurement unit.')
      return
    }

    setModalSubmitting(true)
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem._id, {
          name,
          category,
          unit,
          lowStockThreshold,
          costPerUnit,
          supplier,
        })
        toast.success(`"${name}" was updated successfully!`, 'Item Updated')
      } else {
        const quantity = Number.parseFloat(itemForm.quantity) || 0
        await addInventoryItem({
          name,
          category,
          quantity,
          unit,
          lowStockThreshold,
          costPerUnit,
          supplier,
        })
        toast.success(`"${name}" added to inventory!`, 'Item Added')
      }

      setItemModalOpen(false)
      await loadInventory()
    } catch (err) {
      toast.error(err.message || 'Could not save inventory item.', 'Error')
    } finally {
      setModalSubmitting(false)
    }
  }

  // Handle Restock Submit
  const handleRestockSubmit = async (e) => {
    e.preventDefault()
    if (!restockModalItem) return

    const qty = Number.parseFloat(adjustmentForm.quantity)
    if (!qty || qty <= 0) {
      toast.warning('Restock quantity must be greater than 0.')
      return
    }

    setModalSubmitting(true)
    try {
      await restockInventory(restockModalItem._id, {
        quantity: qty,
        reason: adjustmentForm.reason.trim() || 'Manual Restock',
      })
      toast.success(
        `Added ${qty} ${restockModalItem.unit} to ${restockModalItem.name}!`,
        'Restock Complete'
      )
      setRestockModalItem(null)
      setAdjustmentForm({ quantity: '', reason: '' })
      await loadInventory()
    } catch (err) {
      toast.error(err.message || 'Could not restock item.', 'Restock Failed')
    } finally {
      setModalSubmitting(false)
    }
  }

  // Handle Deduct Submit
  const handleDeductSubmit = async (e) => {
    e.preventDefault()
    if (!deductModalItem) return

    const qty = Number.parseFloat(adjustmentForm.quantity)
    if (!qty || qty <= 0) {
      toast.warning('Deduction quantity must be greater than 0.')
      return
    }

    if (qty > deductModalItem.quantity) {
      toast.warning(
        `Cannot deduct ${qty} ${deductModalItem.unit}. Available stock is only ${deductModalItem.quantity} ${deductModalItem.unit}.`
      )
      return
    }

    setModalSubmitting(true)
    try {
      await deductInventory(deductModalItem._id, {
        quantity: qty,
        reason: adjustmentForm.reason.trim() || 'Manual Deduction',
      })
      toast.success(
        `Deducted ${qty} ${deductModalItem.unit} from ${deductModalItem.name}!`,
        'Stock Deducted'
      )
      setDeductModalItem(null)
      setAdjustmentForm({ quantity: '', reason: '' })
      await loadInventory()
    } catch (err) {
      toast.error(err.message || 'Could not deduct stock.', 'Deduction Failed')
    } finally {
      setModalSubmitting(false)
    }
  }

  // Delete Item with confirmation
  const handleDeleteItem = async (item) => {
    const confirmed = await confirm({
      title: `Delete "${item.name}"?`,
      message: `Are you sure you want to delete ${item.name} from the inventory? This will permanently remove its tracking history.`,
      confirmText: 'Delete Item',
      cancelText: 'Keep Item',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      await deleteInventoryItem(item._id)
      toast.success(`"${item.name}" has been removed from inventory.`, 'Item Deleted')
      setItems((prev) => prev.filter((i) => i._id !== item._id))
    } catch (err) {
      toast.error(err.message || 'Could not delete item.', 'Action Failed')
    }
  }

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'produce':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
      case 'meat':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
      case 'dairy':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
      case 'beverage':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
      case 'dry-goods':
        return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
      default:
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
    }
  }

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-600'

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">
            Kitchen & Bar Supply
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            Inventory <span className="font-serif italic text-amber-600 dark:text-amber-400">Management</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Track ingredients, control stock levels, set low-stock thresholds, and log stock movements.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 self-start rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-600 sm:self-center"
        >
          <span>+ Add Stock Item</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Total Items</span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {stats.totalCount} <span className="text-xs font-normal text-stone-400">items</span>
          </p>
        </div>

        <div
          onClick={() => setOnlyLowStock((prev) => !prev)}
          className={`cursor-pointer rounded-2xl border p-5 shadow-xs transition hover:border-amber-400 ${
            onlyLowStock
              ? 'border-amber-500 bg-amber-50/40 dark:border-amber-500 dark:bg-amber-950/20'
              : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Low Stock Alerts</span>
            {stats.lowStockCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${
              stats.lowStockCount > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {stats.lowStockCount}{' '}
            <span className="text-xs font-normal text-stone-400">
              {stats.lowStockCount === 1 ? 'needs restock' : 'need restock'}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Stock Valuation</span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            ${stats.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Categories</span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {stats.activeCategories} <span className="text-xs font-normal text-stone-400">active</span>
          </p>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {stats.lowStockCount > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-300/80 bg-amber-50/70 p-4 text-xs dark:border-amber-900/60 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-200/80 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold">
              ⚠
            </span>
            <span>
              <strong>{stats.lowStockCount} {stats.lowStockCount === 1 ? 'item is' : 'items are'} below their minimum threshold: </strong>
              {stats.lowStockItems.map((i) => `${i.name} (${i.quantity} ${i.unit})`).slice(0, 3).join(', ')}
              {stats.lowStockCount > 3 ? ` and ${stats.lowStockCount - 3} more.` : '.'}
            </span>
          </div>

          <button
            onClick={() => setOnlyLowStock(true)}
            className="self-start rounded-lg bg-amber-600 px-3 py-1.5 font-bold text-white transition hover:bg-amber-700 sm:self-center"
          >
            Filter Low Stock Items
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by ingredient or supplier…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-[#fdfbf7] py-2 pl-9 pr-4 text-xs text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
            <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter: Low Stock Checkbox */}
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
            Show Low Stock Only
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-3 dark:border-stone-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-xs hover:bg-amber-600'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items List */}
      <div className="mt-6">
        {loading ? (
          <div className="py-24 text-center text-sm text-stone-400">
            Fetching inventory records…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-16 text-center dark:border-stone-800">
            <span className="text-3xl text-amber-500">✦</span>
            <p className="mt-3 text-base font-medium text-stone-800 dark:text-stone-200">
              {items.length === 0 ? 'No inventory items yet' : 'No items match your filter criteria'}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {items.length === 0
                ? 'Click "+ Add Stock Item" above to add your first ingredient or bar supply.'
                : 'Try adjusting your search query or category filter.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const isLowStock = item.quantity <= item.lowStockThreshold
              const stockRatio = Math.min(
                100,
                Math.round((item.quantity / Math.max(item.lowStockThreshold * 2, 1)) * 100)
              )

              return (
                <div
                  key={item._id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition hover:border-amber-400 ${
                    isLowStock
                      ? 'border-rose-200/80 bg-rose-50/20 dark:border-rose-950/40 dark:bg-rose-950/10'
                      : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/60'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                        <h3 className="mt-2 text-base font-bold text-stone-900 dark:text-stone-100">
                          {item.name}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isLowStock
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {isLowStock ? '⚠ Low Stock' : '✓ In Stock'}
                      </span>
                    </div>

                    {/* Quantity Display */}
                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                        {item.quantity}{' '}
                        <span className="text-sm font-normal text-stone-500 dark:text-stone-400">
                          {item.unit}
                        </span>
                      </span>

                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        Min threshold: <strong className="text-stone-700 dark:text-stone-300">{item.lowStockThreshold} {item.unit}</strong>
                      </span>
                    </div>

                    {/* Stock Level Progress Gauge */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isLowStock ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(5, stockRatio)}%` }}
                      />
                    </div>

                    {/* Details: Cost & Supplier */}
                    <div className="mt-4 space-y-1 text-xs text-stone-600 dark:text-stone-400">
                      {item.costPerUnit !== undefined && (
                        <div className="flex items-center justify-between">
                          <span>Cost per {item.unit}:</span>
                          <strong className="text-stone-900 dark:text-stone-200">
                            ${Number(item.costPerUnit).toFixed(2)}
                          </strong>
                        </div>
                      )}

                      {item.costPerUnit !== undefined && (
                        <div className="flex items-center justify-between">
                          <span>Total value:</span>
                          <span className="font-semibold text-amber-700 dark:text-amber-400">
                            ${(item.quantity * item.costPerUnit).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {item.supplier && (
                        <div className="flex items-center justify-between">
                          <span>Supplier:</span>
                          <span className="truncate max-w-37.5 font-medium text-stone-800 dark:text-stone-300" title={item.supplier}>
                            {item.supplier}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 border-t border-stone-100 pt-3 dark:border-stone-800/80">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setRestockModalItem(item)
                            setAdjustmentForm({ quantity: '', reason: '' })
                          }}
                          className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900"
                          title="Add restocked quantity"
                        >
                          + Restock
                        </button>

                        <button
                          onClick={() => {
                            setDeductModalItem(item)
                            setAdjustmentForm({ quantity: '', reason: '' })
                          }}
                          className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-900"
                          title="Record stock usage or deduction"
                        >
                          - Deduct
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-xs">
                        <button
                          onClick={() => setHistoryModalItem(item)}
                          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                          title="View Stock History / Logs"
                        >
                          📜
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                          title="Edit Item Details"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                          title="Delete Item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Add / Edit Item Modal ─────────────────────────────────────── */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-7 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                  {editingItem ? 'Edit Item' : 'New Stock'}
                </span>
                <h3 className="mt-1 font-serif text-2xl font-medium">
                  {editingItem ? `Edit ${editingItem.name}` : 'Add Inventory Item'}
                </h3>
              </div>
              <button
                onClick={() => setItemModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-5 grid gap-4">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                Item Name
                <input
                  className={inputClass}
                  type="text"
                  placeholder="e.g. San Marzano Tomatoes"
                  value={itemForm.name}
                  onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Category
                  <select
                    className={inputClass}
                    value={itemForm.category}
                    onChange={(e) => setItemForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option value="produce">Produce</option>
                    <option value="meat">Meat & Poultry</option>
                    <option value="dairy">Dairy</option>
                    <option value="beverage">Beverages</option>
                    <option value="dry-goods">Dry Goods</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Unit of Measurement
                  <input
                    className={inputClass}
                    type="text"
                    placeholder="e.g. kg, litre, boxes, pieces"
                    value={itemForm.unit}
                    onChange={(e) => setItemForm((f) => ({ ...f, unit: e.target.value }))}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {!editingItem && (
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                    Initial Stock Quantity
                    <input
                      className={inputClass}
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0"
                      value={itemForm.quantity}
                      onChange={(e) => setItemForm((f) => ({ ...f, quantity: e.target.value }))}
                    />
                  </label>
                )}

                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Low Stock Alert Threshold
                  <input
                    className={inputClass}
                    type="number"
                    step="any"
                    min="0"
                    placeholder="10"
                    value={itemForm.lowStockThreshold}
                    onChange={(e) => setItemForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Cost Per Unit ($) (Optional)
                  <input
                    className={inputClass}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 4.50"
                    value={itemForm.costPerUnit}
                    onChange={(e) => setItemForm((f) => ({ ...f, costPerUnit: e.target.value }))}
                  />
                </label>

                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Supplier / Vendor (Optional)
                  <input
                    className={inputClass}
                    type="text"
                    placeholder="e.g. Farm Fresh Organics"
                    value={itemForm.supplier}
                    onChange={(e) => setItemForm((f) => ({ ...f, supplier: e.target.value }))}
                  />
                </label>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 disabled:opacity-60"
                >
                  {modalSubmitting ? 'Saving…' : editingItem ? 'Save Changes' : '+ Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Restock Modal ───────────────────────────────────────────── */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  Stock Inflow
                </span>
                <h3 className="mt-1 font-serif text-2xl font-medium">
                  Restock {restockModalItem.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Current stock: <strong className="text-stone-800 dark:text-stone-200">{restockModalItem.quantity} {restockModalItem.unit}</strong>
                </p>
              </div>
              <button
                onClick={() => setRestockModalItem(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="mt-5 grid gap-4">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                Quantity to Add ({restockModalItem.unit})
                <input
                  className={inputClass}
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="e.g. 10"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm((f) => ({ ...f, quantity: e.target.value }))}
                  required
                  autoFocus
                />
              </label>

              {adjustmentForm.quantity && Number.parseFloat(adjustmentForm.quantity) > 0 && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  New expected total: <strong>{(restockModalItem.quantity + Number.parseFloat(adjustmentForm.quantity)).toFixed(2)} {restockModalItem.unit}</strong>
                </div>
              )}

              <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                Restock Reason / PO Number (Optional)
                <input
                  className={inputClass}
                  type="text"
                  placeholder="e.g. Weekly vendor shipment, emergency purchase"
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </label>

              <div className="mt-3 flex items-center justify-end gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {modalSubmitting ? 'Restocking…' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Deduct Modal ────────────────────────────────────────────── */}
      {deductModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
                  Stock Deduction
                </span>
                <h3 className="mt-1 font-serif text-2xl font-medium">
                  Deduct {deductModalItem.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Available stock: <strong className="text-stone-800 dark:text-stone-200">{deductModalItem.quantity} {deductModalItem.unit}</strong>
                </p>
              </div>
              <button
                onClick={() => setDeductModalItem(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeductSubmit} className="mt-5 grid gap-4">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                Quantity to Deduct ({deductModalItem.unit})
                <input
                  className={inputClass}
                  type="number"
                  step="any"
                  min="0.01"
                  max={deductModalItem.quantity}
                  placeholder="e.g. 3"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm((f) => ({ ...f, quantity: e.target.value }))}
                  required
                  autoFocus
                />
              </label>

              {adjustmentForm.quantity && Number.parseFloat(adjustmentForm.quantity) > 0 && (
                <div
                  className={`rounded-xl p-3 text-xs ${
                    Number.parseFloat(adjustmentForm.quantity) > deductModalItem.quantity
                      ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  {Number.parseFloat(adjustmentForm.quantity) > deductModalItem.quantity ? (
                    <span>Cannot deduct more than available {deductModalItem.quantity} {deductModalItem.unit}!</span>
                  ) : (
                    <span>
                      Remaining after deduction: <strong>{(deductModalItem.quantity - Number.parseFloat(adjustmentForm.quantity)).toFixed(2)} {deductModalItem.unit}</strong>
                    </span>
                  )}
                </div>
              )}

              <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                Reason / Note (Optional)
                <input
                  className={inputClass}
                  type="text"
                  placeholder="e.g. Dinner prep, spoilage / waste, damaged"
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </label>

              <div className="mt-3 flex items-center justify-end gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setDeductModalItem(null)}
                  className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    modalSubmitting ||
                    Number.parseFloat(adjustmentForm.quantity) > deductModalItem.quantity
                  }
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60"
                >
                  {modalSubmitting ? 'Deducting…' : 'Confirm Deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Item History / Audit Log Modal ───────────────────────────── */}
      {historyModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-7 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                  Stock Audit Trail
                </span>
                <h3 className="mt-1 font-serif text-2xl font-medium">
                  {historyModalItem.name} History
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Current Stock: <strong className="text-stone-800 dark:text-stone-200">{historyModalItem.quantity} {historyModalItem.unit}</strong>
                </p>
              </div>
              <button
                onClick={() => setHistoryModalItem(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 max-h-80 overflow-y-auto">
              {!historyModalItem.history || historyModalItem.history.length === 0 ? (
                <div className="py-10 text-center text-xs text-stone-400">
                  No stock adjustment logs recorded for this item yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[...historyModalItem.history]
                    .reverse()
                    .map((entry, idx) => {
                      const isRestock = entry.type === 'restock'
                      const dateStr = entry.createdAt
                        ? new Date(entry.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : '—'

                      return (
                        <div
                          key={entry._id || idx}
                          className="flex items-center justify-between rounded-xl border border-stone-100 bg-[#fdfbf7] p-3 text-xs dark:border-stone-800 dark:bg-stone-800/40"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold ${
                                isRestock
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {isRestock ? '↑' : '↓'}
                            </span>
                            <div>
                              <p className="font-semibold text-stone-900 dark:text-stone-100">
                                {isRestock ? '+' : '-'}{entry.quantity} {historyModalItem.unit}
                              </p>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                {entry.reason || (isRestock ? 'Restock' : 'Deduction')}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] text-stone-400 dark:text-stone-500">
                            {dateStr}
                          </span>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-stone-100 pt-4 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setHistoryModalItem(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

