import { useEffect, useMemo, useState } from 'react'
import { getAllInventoryItems } from '../api/inventoryApi'
import {
  createMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  toggleMenuItemAvailability,
  updateMenuItem,
} from '../api/menuApi'
import { useToast } from '../hooks/useToast'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'starter', label: '🥗 Starter' },
  { id: 'main', label: '🍽️ Main' },
  { id: 'side', label: '🥙 Side' },
  { id: 'dessert', label: '🍰 Dessert' },
  { id: 'beverage', label: '🥤 Beverage' },
]

const CATEGORY_COLORS = {
  starter: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  main: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  side: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  dessert: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
  beverage: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
}

const EMPTY_FORM = {
  name: '',
  description: '',
  category: 'main',
  price: '',
  isAvailable: true,
  ingredients: [],
}

export function MenuDashboard() {
  const { toast, confirm } = useToast()

  const [items, setItems] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUnavailable, setShowUnavailable] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // Ingredient picker
  const [ingredientPickerOpen, setIngredientPickerOpen] = useState(false)
  const [ingredientSearch, setIngredientSearch] = useState('')

  // ── Data Loading ──────────────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true)
      const [menuRes, invRes] = await Promise.all([getAllMenuItems(), getAllInventoryItems()])
      setItems(menuRes.data || [])
      setInventory(invRes.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load menu data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ── KPI Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const available = items.filter((i) => i.isAvailable)
    const avgPrice =
      items.length > 0
        ? (items.reduce((sum, i) => sum + i.price, 0) / items.length).toFixed(2)
        : '0.00'
    const categories = [...new Set(items.map((i) => i.category))].length
    return { total: items.length, available: available.length, avgPrice, categories }
  }, [items])

  // ── Filtered Items ────────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (!showUnavailable && !item.isAvailable) return false
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false
      return true
    })
  }, [items, categoryFilter, searchQuery, showUnavailable])

  // ── Modal Helpers ─────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setIngredientPickerOpen(false)
    setIngredientSearch('')
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: String(item.price),
      isAvailable: item.isAvailable,
      ingredients: item.ingredients || [],
    })
    setIngredientPickerOpen(false)
    setIngredientSearch('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setIngredientPickerOpen(false)
    setIngredientSearch('')
  }

  // ── Ingredient Helpers ────────────────────────────────────────────────────────
  const addIngredient = (invItem) => {
    if (form.ingredients.find((i) => i.inventoryItem === invItem._id)) return
    setForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { inventoryItem: invItem._id, inventoryItemName: invItem.name, unit: invItem.unit, quantity: 1 },
      ],
    }))
  }

  const updateIngredientQty = (inventoryItemId, qty) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((i) =>
        i.inventoryItem === inventoryItemId ? { ...i, quantity: Math.max(0.01, Number(qty)) } : i
      ),
    }))
  }

  const removeIngredient = (inventoryItemId) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i.inventoryItem !== inventoryItemId),
    }))
  }

  const filteredInventory = inventory.filter(
    (inv) =>
      inv.name.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
      !form.ingredients.find((i) => i.inventoryItem === inv._id)
  )

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.warning('Item name is required')
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      return toast.warning('Enter a valid price')

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      isAvailable: form.isAvailable,
      // only send inventoryItem id + quantity
      ingredients: form.ingredients.map(({ inventoryItem, quantity }) => ({
        inventoryItem,
        quantity,
      })),
    }

    try {
      setSubmitting(true)
      if (editingItem) {
        await updateMenuItem(editingItem._id, payload)
        toast.success(`"${payload.name}" updated successfully`)
      } else {
        await createMenuItem(payload)
        toast.success(`"${payload.name}" added to the menu!`)
      }
      await loadData()
      closeModal()
    } catch (err) {
      toast.error(err.message || 'Failed to save menu item')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Toggle Availability ───────────────────────────────────────────────────────
  const handleToggle = async (item) => {
    try {
      await toggleMenuItemAvailability(item._id)
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i))
      )
      toast.info(`"${item.name}" marked as ${item.isAvailable ? 'unavailable' : 'available'}`)
    } catch (err) {
      toast.error(err.message || 'Failed to toggle availability')
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    const ok = await confirm({
      title: 'Remove Menu Item?',
      message: `"${item.name}" will be permanently removed from the menu. This cannot be undone.`,
      confirmLabel: 'Yes, Remove',
      cancelLabel: 'Keep It',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await deleteMenuItem(item._id)
      setItems((prev) => prev.filter((i) => i._id !== item._id))
      toast.success(`"${item.name}" removed from menu`)
    } catch (err) {
      toast.error(err.message || 'Failed to delete item')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
            🍴 Menu Management
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Manage dishes, beverages, and availability across your restaurant menu.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 active:scale-95"
        >
          <span className="text-base">+</span> Add Menu Item
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Items', value: stats.total, icon: '🍽️', color: 'amber' },
          { label: 'Available Now', value: stats.available, icon: '✅', color: 'emerald' },
          { label: 'Avg Price', value: `$${stats.avgPrice}`, icon: '💰', color: 'sky' },
          { label: 'Categories', value: stats.categories, icon: '📂', color: 'rose' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">{card.icon}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  card.color === 'amber'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                    : card.color === 'emerald'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : card.color === 'sky'
                        ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                }`}
              >
                {card.color === 'emerald' ? 'live' : 'total'}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-100">
              {card.value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
            🔍
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-4 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-500 dark:focus:ring-amber-900/40"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                categoryFilter === cat.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
            <input
              type="checkbox"
              checked={showUnavailable}
              onChange={(e) => setShowUnavailable(e.target.checked)}
              className="accent-amber-500"
            />
            Show unavailable
          </label>
        </div>
      </div>

      {/* Item Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 py-20 text-center dark:border-stone-800">
          <span className="text-5xl">🍴</span>
          <p className="mt-4 text-base font-semibold text-stone-600 dark:text-stone-400">
            No menu items found
          </p>
          <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
            {items.length === 0
              ? 'Get started by adding your first dish.'
              : 'Try adjusting your search or filters.'}
          </p>
          {items.length === 0 && (
            <button
              onClick={openAddModal}
              className="mt-5 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              + Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              inventory={inventory}
              onEdit={() => openEditModal(item)}
              onDelete={() => handleDelete(item)}
              onToggle={() => handleToggle(item)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-stone-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 dark:border-stone-800">
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {editingItem ? '✏️ Edit Menu Item' : '+ New Menu Item'}
              </h2>
              <button
                onClick={closeModal}
                className="text-2xl leading-none text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col gap-0 overflow-y-auto px-6 py-5"
            >
              <div className="flex flex-col gap-4">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-400">
                    Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Grilled Salmon"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-amber-500 dark:focus:ring-amber-900/40"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-400">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="A short description of the dish..."
                    className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-amber-500 dark:focus:ring-amber-900/40"
                  />
                </div>

                {/* Category + Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-400">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-amber-500 dark:focus:ring-amber-900/40"
                    >
                      <option value="starter">🥗 Starter</option>
                      <option value="main">🍽️ Main</option>
                      <option value="side">🥙 Side</option>
                      <option value="dessert">🍰 Dessert</option>
                      <option value="beverage">🥤 Beverage</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-400">
                      Price ($) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-amber-500 dark:focus:ring-amber-900/40"
                    />
                  </div>
                </div>

                {/* Availability Toggle */}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800">
                  <div
                    onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      form.isAvailable ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        form.isAvailable ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {form.isAvailable ? 'Available on menu' : 'Hidden / Unavailable'}
                  </span>
                </label>

                {/* Ingredients Section */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                      Ingredients (optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIngredientPickerOpen(!ingredientPickerOpen)}
                      className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                    >
                      {ingredientPickerOpen ? '✕ Close Picker' : '+ Link Inventory'}
                    </button>
                  </div>

                  {/* Ingredient Picker Dropdown */}
                  {ingredientPickerOpen && (
                    <div className="mb-3 rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
                      <div className="p-2">
                        <input
                          value={ingredientSearch}
                          onChange={(e) => setIngredientSearch(e.target.value)}
                          placeholder="Search inventory..."
                          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-900 outline-none focus:border-amber-400 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
                        />
                      </div>
                      <div className="max-h-36 overflow-y-auto">
                        {filteredInventory.length === 0 ? (
                          <p className="px-3 py-2 text-xs text-stone-400">
                            {inventory.length === 0
                              ? 'No inventory items yet'
                              : 'All items already linked'}
                          </p>
                        ) : (
                          filteredInventory.map((inv) => (
                            <button
                              key={inv._id}
                              type="button"
                              onClick={() => addIngredient(inv)}
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-amber-50 dark:hover:bg-amber-950/20"
                            >
                              <span className="font-medium text-stone-800 dark:text-stone-200">
                                {inv.name}
                              </span>
                              <span className="text-stone-400">{inv.unit}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Ingredients */}
                  {form.ingredients.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {form.ingredients.map((ing) => (
                        <div
                          key={ing.inventoryItem}
                          className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-800"
                        >
                          <span className="flex-1 text-xs font-medium text-stone-800 dark:text-stone-200">
                            {ing.inventoryItemName ||
                              inventory.find((i) => i._id === ing.inventoryItem)?.name ||
                              ing.inventoryItem}
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={ing.quantity}
                              onChange={(e) =>
                                updateIngredientQty(ing.inventoryItem, e.target.value)
                              }
                              className="w-16 rounded-lg border border-stone-200 bg-white px-2 py-1 text-center text-xs text-stone-900 outline-none focus:border-amber-400 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
                            />
                            <span className="text-[10px] text-stone-400">
                              {ing.unit ||
                                inventory.find((i) => i._id === ing.inventoryItem)?.unit ||
                                'unit'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeIngredient(ing.inventoryItem)}
                            className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.ingredients.length === 0 && !ingredientPickerOpen && (
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      No ingredients linked. Click "Link Inventory" to connect inventory items for
                      auto-stock deduction on order.
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : editingItem ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Menu Item Card ─────────────────────────────────────────────────────────────
function MenuItemCard({ item, inventory, onEdit, onDelete, onToggle }) {
  const categoryColor = CATEGORY_COLORS[item.category] || 'bg-stone-100 text-stone-700'
  const categoryLabel = CATEGORIES.find((c) => c.id === item.category)?.label || item.category

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md dark:bg-stone-900 ${
        item.isAvailable
          ? 'border-stone-100 dark:border-stone-800'
          : 'border-dashed border-stone-200 opacity-65 dark:border-stone-700'
      }`}
    >
      {/* Colour banner */}
      <div
        className={`h-2 w-full ${
          item.category === 'starter'
            ? 'bg-emerald-400'
            : item.category === 'main'
              ? 'bg-amber-400'
              : item.category === 'side'
                ? 'bg-orange-400'
                : item.category === 'dessert'
                  ? 'bg-rose-400'
                  : 'bg-sky-400'
        }`}
      />

      <div className="flex flex-1 flex-col p-4">
        {/* Top Row */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="line-clamp-1 font-serif text-base font-bold text-stone-900 dark:text-stone-100">
              {item.name}
            </h3>
            {item.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
                {item.description}
              </p>
            )}
          </div>
          <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold ${categoryColor}`}>
            {categoryLabel}
          </span>
        </div>

        {/* Price */}
        <p className="mb-3 font-mono text-xl font-bold text-amber-600 dark:text-amber-400">
          ${item.price.toFixed(2)}
        </p>

        {/* Ingredients */}
        {item.ingredients?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {item.ingredients.slice(0, 4).map((ing, i) => {
              const invItem = inventory.find((iv) => iv._id === ing.inventoryItem)
              return (
                <span
                  key={i}
                  className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                >
                  {invItem?.name || ing.inventoryItem} × {ing.quantity}
                </span>
              )
            })}
            {item.ingredients.length > 4 && (
              <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500 dark:bg-stone-800">
                +{item.ingredients.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-auto flex items-center gap-2">
          {/* Availability Toggle */}
          <button
            onClick={onToggle}
            title={item.isAvailable ? 'Click to hide from menu' : 'Click to make available'}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              item.isAvailable
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/60'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'
            }`}
          >
            <span>{item.isAvailable ? '✅' : '🚫'}</span>
            {item.isAvailable ? 'Available' : 'Hidden'}
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={onEdit}
              title="Edit item"
              className="rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            >
              ✏️
            </button>
            <button
              onClick={onDelete}
              title="Delete item"
              className="rounded-lg p-2 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

