import { useEffect, useState } from 'react'
import { cancelReservation, createReservation, getAllReservations } from '../api/reservationApi'
import { getAllTables } from '../api/tableApi'
import { useToast } from '../hooks/useToast'

export function CustomerDashboard({ user }) {
  const { toast, confirm } = useToast()
  const [tables, setTables] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [locationFilter, setLocationFilter] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(true)

  // Reservation Modal State
  const [selectedTable, setSelectedTable] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  // Default booking datetime: tomorrow at 19:00 local time
  const getDefaultDateTime = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(19, 0, 0, 0)
    const tzOffset = tomorrow.getTimezoneOffset() * 60000
    return new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16)
  }

  const [bookingForm, setBookingForm] = useState({
    dateTime: getDefaultDateTime(),
    partySize: '2',
    customerName: user?.name || '',
    customerPhone: '',
    customerEmail: user?.email || '',
    notes: '',
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [tablesRes, reservationsRes] = await Promise.all([
        getAllTables(),
        getAllReservations().catch(() => ({ data: [] })),
      ])
      setTables(tablesRes.data || [])
      setReservations(reservationsRes.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load restaurant tables')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openReservationModal = (table) => {
    setSelectedTable(table)
    setBookingError('')
    setBookingForm({
      dateTime: getDefaultDateTime(),
      partySize: Math.min(2, table.capacity).toString(),
      customerName: user?.name || '',
      customerPhone: '',
      customerEmail: user?.email || '',
      notes: '',
    })
  }

  const closeReservationModal = () => {
    setSelectedTable(null)
    setBookingError('')
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setBookingError('')

    if (!selectedTable) return

    const guests = Number.parseInt(bookingForm.partySize, 10)
    if (!guests || guests <= 0) {
      setBookingError('Party size must be at least 1 guest.')
      return
    }

    if (guests > selectedTable.capacity) {
      setBookingError(`This table accommodates up to ${selectedTable.capacity} guests only.`)
      return
    }

    if (!bookingForm.customerPhone || bookingForm.customerPhone.trim().length < 7) {
      setBookingError('Please enter a valid phone number with at least 7 digits.')
      return
    }

    const selectedDate = new Date(bookingForm.dateTime)
    if (Number.isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
      setBookingError('Reservation date and time must be set in the future.')
      return
    }

    setBookingLoading(true)
    try {
      await createReservation({
        customerName: bookingForm.customerName.trim(),
        customerPhone: bookingForm.customerPhone.trim(),
        customerEmail: bookingForm.customerEmail.trim() || undefined,
        tableId: selectedTable._id,
        date: selectedDate.toISOString(),
        partySize: guests,
        notes: bookingForm.notes.trim() || undefined,
      })

      toast.success(
        `Table ${selectedTable.tableNumber} is reserved for ${bookingForm.customerName}!`,
        'Booking Confirmed'
      )
      closeReservationModal()
      await loadData()
    } catch (err) {
      const msg = err.message || 'Could not complete reservation.'
      setBookingError(msg)
      toast.error(msg, 'Reservation Error')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId, tableNum) => {
    const confirmed = await confirm({
      title: `Cancel Reservation for Table ${tableNum}?`,
      message: `Are you sure you want to cancel this booking? The table will immediately become open for other guests.`,
      confirmText: 'Yes, Cancel Booking',
      cancelText: 'Keep Booking',
      variant: 'warning',
    })

    if (!confirmed) return

    try {
      await cancelReservation(reservationId)
      toast.success(`Your reservation for Table ${tableNum} has been cancelled.`, 'Reservation Cancelled')
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Could not cancel reservation.', 'Action Failed')
    }
  }

  const filteredTables = tables.filter((table) => {
    if (onlyAvailable && table.status !== 'available') return false
    if (locationFilter !== 'all' && table.location !== locationFilter) return false
    return true
  })

  const availableCount = tables.filter((t) => t.status === 'available').length

  const inputClass = 'mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-600'

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
      {/* Welcome Hero */}
      <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-[#f8f2e7] via-[#fbf7f0] to-[#fffdf9] p-8 dark:border-stone-800 dark:from-[#261f17] dark:via-[#1c1814] dark:to-[#141210]">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">
          Guest Dining Lounge
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl">
          Reserve your table, <span className="font-serif italic text-amber-600 dark:text-amber-400">{user?.name?.split(' ')[0] || 'Friend'}.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          Browse our dining spaces, check live table availability, and reserve your dining experience in moments.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium shadow-sm dark:bg-stone-900">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <strong className="text-stone-900 dark:text-stone-100">{availableCount}</strong> tables available right now
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-medium shadow-sm dark:bg-stone-900">
            <span className="text-amber-500">✦</span>
            Instant confirmation
          </span>
        </div>
      </div>

      {/* Main Section */}
      <div className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-medium">Explore Tables</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Select any open table to book your dining spot
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-300">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              Available only
            </label>

            <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1 text-xs dark:border-stone-800 dark:bg-stone-900">
              {['all', 'indoor', 'outdoor', 'rooftop'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationFilter(loc)}
                  className={`rounded-lg px-3 py-1 font-medium capitalize transition ${
                    locationFilter === loc
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <div className="py-24 text-center text-sm text-stone-400">
            Checking restaurant floor…
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 p-16 text-center dark:border-stone-800">
            <span className="text-3xl text-amber-500">✦</span>
            <p className="mt-3 text-base font-medium text-stone-800 dark:text-stone-200">
              No matching tables found
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {tables.length === 0
                ? 'No tables have been added to the floor yet. Please check back shortly.'
                : 'Try loosening your filter criteria to view more tables.'}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTables.map((table) => {
              const isAvailable = table.status === 'available'

              return (
                <div
                  key={table._id}
                  className={`flex flex-col justify-between rounded-2xl border p-6 transition ${
                    isAvailable
                      ? 'border-stone-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-amber-400 dark:border-stone-800 dark:bg-stone-900/60'
                      : 'border-stone-200/60 bg-stone-50/50 opacity-70 dark:border-stone-800/40 dark:bg-stone-900/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                        Table {table.tableNumber}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {table.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                        <span>Seating capacity</span>
                        <strong className="font-semibold text-stone-900 dark:text-stone-200">
                          {table.capacity} {table.capacity === 1 ? 'person' : 'guests'}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                        <span>Setting</span>
                        <span className="capitalize font-medium text-stone-800 dark:text-stone-300">
                          {table.location === 'indoor' ? 'Indoor Dining' : table.location === 'outdoor' ? 'Patio' : 'Rooftop Lounge'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-stone-100 pt-4 dark:border-stone-800/60">
                    {isAvailable ? (
                      <button
                        onClick={() => openReservationModal(table)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600"
                      >
                        Reserve Table {table.tableNumber} →
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full cursor-not-allowed rounded-xl bg-stone-100 py-2.5 text-xs font-medium text-stone-400 dark:bg-stone-800 dark:text-stone-500"
                      >
                        Currently Unavailable
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Customer's Reservations Section */}
      <div className="mt-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-medium">My Reservations</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Your booked dining experiences at Restora
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {reservations.length} {reservations.length === 1 ? 'booking' : 'bookings'}
          </span>
        </div>

        {reservations.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900/60">
            <span className="text-2xl text-amber-500">✦</span>
            <p className="mt-2 text-sm font-medium text-stone-700 dark:text-stone-300">
              You don’t have any active reservations yet
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Pick any available table above to make your first booking!
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reservations.map((res) => {
              const resDate = new Date(res.date)
              const formattedDate = resDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              const formattedTime = resDate.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })

              const tableNum = res.table?.tableNumber || '—'
              const tableLoc = res.table?.location || ''
              const isCancelled = res.status === 'cancelled'

              return (
                <div
                  key={res._id}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900/60"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
                        Table {tableNum}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isCancelled
                            ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                            : res.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                      <div>
                        <strong>Date: </strong>
                        <span>{formattedDate} at {formattedTime}</span>
                      </div>
                      <div>
                        <strong>Party: </strong>
                        <span>{res.partySize} {res.partySize === 1 ? 'guest' : 'guests'}</span>
                      </div>
                      {tableLoc && (
                        <div>
                          <strong>Setting: </strong>
                          <span className="capitalize">{tableLoc}</span>
                        </div>
                      )}
                      {res.notes && (
                        <div className="italic text-stone-500 dark:text-stone-400">
                          "{res.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="mt-4 border-t border-stone-100 pt-3 dark:border-stone-800/60 flex justify-end">
                      <button
                        onClick={() => handleCancelReservation(res._id, tableNum)}
                        className="text-xs font-semibold text-stone-500 hover:text-red-600 dark:hover:text-red-400 transition"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reservation Booking Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-7 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                  New Reservation
                </span>
                <h3 className="mt-1 font-serif text-2xl font-medium">
                  Book Table {selectedTable.tableNumber}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {selectedTable.capacity} guests max · <span className="capitalize">{selectedTable.location}</span> setting
                </p>
              </div>
              <button
                onClick={closeReservationModal}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            {bookingError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="mt-5 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Reservation Date & Time
                  <input
                    className={inputClass}
                    type="datetime-local"
                    value={bookingForm.dateTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setBookingForm((f) => ({ ...f, dateTime: e.target.value }))}
                    required
                  />
                </label>

                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Party Size (Guests)
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    max={selectedTable.capacity}
                    value={bookingForm.partySize}
                    onChange={(e) => setBookingForm((f) => ({ ...f, partySize: e.target.value }))}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Contact Name
                  <input
                    className={inputClass}
                    type="text"
                    value={bookingForm.customerName}
                    onChange={(e) => setBookingForm((f) => ({ ...f, customerName: e.target.value }))}
                    placeholder="Your full name"
                    required
                  />
                </label>

                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Phone Number
                  <input
                    className={inputClass}
                    type="tel"
                    value={bookingForm.customerPhone}
                    onChange={(e) => setBookingForm((f) => ({ ...f, customerPhone: e.target.value }))}
                    placeholder="e.g. +1 555-0199"
                    required
                  />
                </label>
              </div>

              <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                Special Requests or Notes (Optional)
                <textarea
                  className={`${inputClass} resize-none`}
                  rows="2"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Anniversary dinner, high chair needed, dietary notes"
                />
              </label>

              <div className="mt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReservationModal}
                  className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 disabled:opacity-60"
                >
                  {bookingLoading ? 'Reserving Table…' : 'Confirm Table Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
