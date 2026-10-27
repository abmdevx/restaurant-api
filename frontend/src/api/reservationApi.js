import { apiRequest } from './client'

export function getAllReservations(params = {}) {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.append('status', params.status)
  if (params.date) searchParams.append('date', params.date)
  const qs = searchParams.toString()
  return apiRequest(`/reservations/all-reservations${qs ? `?${qs}` : ''}`)
}

export function createReservation(reservationData) {
  return apiRequest('/reservations/create', {
    method: 'POST',
    body: JSON.stringify(reservationData),
  })
}

export function cancelReservation(reservationId) {
  return apiRequest(`/reservations/cancel/${reservationId}`, {
    method: 'PATCH',
  })
}

