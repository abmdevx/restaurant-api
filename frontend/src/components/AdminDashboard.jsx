import { useEffect, useState } from 'react'
import { createTable, deleteTable, getAllTables } from '../api/tableApi'
import { useToast } from '../hooks/useToast'

export function AdminDashboard({ user }) {
  const { toast, confirm } = useToast()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('all')

  const [form, setForm] = useState({
    tableNumber: '',
    capacity: '4',
    location: 'indoor',
  })

  const loadTables = async () => {
    try {
      setLoading(true)
      const res = await getAllTables()
      setTables(res.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load tables')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTables()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateTable = async (e) => {
    e.preventDefault()

    const tableNum = Number.parseInt(form.tableNumber, 10)
    const cap = Number.parseInt(form.capacity, 10)

    if (!tableNum || tableNum <= 0) {
      toast.warning('Please enter a valid table number greater than 0.')
      return
    }

    if (!cap || cap <= 0) {
      toast.warning('Capacity must be at least 1 person.')
      return
    }

    setSubmitting(true)
    try {
      const res = await createTable({
        tableNumber: tableNum,
        capacity: cap,
        location: form.location,
      })

      toast.success(`Table ${res.data.tableNumber} added to dining floor!`, 'Table Created')
      setForm({
        tableNumber: '',
        capacity: '4',
        location: 'indoor',
      })
      await loadTables()
    } catch (err) {
      toast.error(err.message || 'Could not create table.', 'Creation Error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTable = async (tableId, tableNum) => {
    const confirmed = await confirm({
      title: `Delete Table ${tableNum}?`,
      message: `Are you sure you want to remove Table ${tableNum} from the restaurant floor? This action cannot be undone.`,
      confirmText: 'Delete Table',
      cancelText: 'Keep Table',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      await deleteTable(tableId)
      toast.success(`Table ${tableNum} was removed successfully.`, 'Table Deleted')
      setTables((prev) => prev.filter((t) => t._id !== tableId))
    } catch (err) {
      toast.error(err.message || 'Could not delete table.', 'Action Failed')
    }
  }

  const totalSeats = tables.reduce((acc, t) => acc + (t.capacity || 0), 0)
  const availableCount = tables.filter((t) => t.status === 'available').length
  const reservedCount = tables.filter((t) => t.status === 'reserved').length

  const filteredTables = selectedLocation === 'all'
    ? tables
    : tables.filter((t) => t.location === selectedLocation)

  const inputClass = 'mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-600'

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">
            Admin Management
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            Table <span className="font-serif italic text-amber-600 dark:text-amber-400">Operations</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Configure dining floor layouts, add new tables, and oversee real-time dining capacity.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Admin Workspace
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Total Tables</span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{tables.length}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Available</span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{availableCount}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Reserved</span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{reservedCount}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Total Capacity</span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{totalSeats} <span className="text-xs font-normal text-stone-400">seats</span></p>
        </div>
      </div>

      {/* Two Column Section: Create Table Form & Tables List */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Create Table Form */}
        <div className="h-fit rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex items-center gap-2">
            <span className="text-amber-500">✦</span>
            <h2 className="font-serif text-xl font-medium">Create New Table</h2>
          </div>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Add a physical table to the restaurant floor.
          </p>

          <form onSubmit={handleCreateTable} className="mt-6 grid gap-4">
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Table Number
              <input
                className={inputClass}
                type="number"
                name="tableNumber"
                min="1"
                placeholder="e.g. 1"
                value={form.tableNumber}
                onChange={handleInputChange}
                required
              />
            </label>

            <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Seating Capacity (Guests)
              <input
                className={inputClass}
                type="number"
                name="capacity"
                min="1"
                max="20"
                placeholder="e.g. 4"
                value={form.capacity}
                onChange={handleInputChange}
                required
              />
            </label>

            <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Floor Location
              <select
                className={inputClass}
                name="location"
                value={form.location}
                onChange={handleInputChange}
              >
                <option value="indoor">Indoor Dining Room</option>
                <option value="outdoor">Outdoor Patio</option>
                <option value="rooftop">Rooftop Lounge</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-600 disabled:opacity-60"
            >
              {submitting ? 'Creating Table…' : '+ Add Table to Floor'}
            </button>
          </form>
        </div>

        {/* Existing Tables List */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-xl font-medium">Floor Tables</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {tables.length} {tables.length === 1 ? 'table' : 'tables'} registered
              </p>
            </div>

            {/* Location Filter */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['all', 'indoor', 'outdoor', 'rooftop'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`rounded-lg px-2.5 py-1 font-medium capitalize transition ${
                    selectedLocation === loc
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-stone-400">
              Loading tables…
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-stone-300 py-16 text-center dark:border-stone-700">
              <span className="text-3xl text-amber-500">✦</span>
              <p className="mt-3 text-sm font-medium text-stone-700 dark:text-stone-300">
                {tables.length === 0 ? 'No tables created yet' : 'No tables match this filter'}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                {tables.length === 0
                  ? 'Use the form to create your restaurant’s first table.'
                  : 'Try selecting a different floor location filter.'}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTables.map((table) => {
                const isAvailable = table.status === 'available'
                const isReserved = table.status === 'reserved'

                return (
                  <div
                    key={table._id}
                    className="relative flex flex-col justify-between rounded-xl border border-stone-200 bg-[#fdfbf7] p-4 transition hover:border-amber-400 dark:border-stone-800 dark:bg-stone-900/40"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                          Table {table.tableNumber}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : isReserved
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                          }`}
                        >
                          {table.status}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-stone-700 dark:text-stone-300">Capacity:</span>
                          <span>{table.capacity} {table.capacity === 1 ? 'guest' : 'guests'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-stone-700 dark:text-stone-300">Location:</span>
                          <span className="capitalize">{table.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end border-t border-stone-200/60 pt-3 dark:border-stone-800/60">
                      <button
                        onClick={() => handleDeleteTable(table._id, table.tableNumber)}
                        className="text-[11px] font-semibold text-red-600 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete table"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
