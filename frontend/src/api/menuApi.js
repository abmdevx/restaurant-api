import { apiRequest } from './client'

export function getAllMenuItems(params = {}) {
  const searchParams = new URLSearchParams()
  if (params.category && params.category !== 'all') {
    searchParams.append('category', params.category)
  }
  if (params.isAvailable !== undefined) {
    searchParams.append('isAvailable', String(params.isAvailable))
  }
  const qs = searchParams.toString()
  return apiRequest(`/menu/all-menu${qs ? `?${qs}` : ''}`)
}

export function getMenuItemById(id) {
  return apiRequest(`/menu/menu-item/${id}`)
}

export function createMenuItem(data) {
  return apiRequest('/menu/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateMenuItem(id, data) {
  return apiRequest(`/menu/update/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function toggleMenuItemAvailability(id) {
  return apiRequest(`/menu/toggle-availability/${id}`, {
    method: 'PATCH',
  })
}

export function deleteMenuItem(id) {
  return apiRequest(`/menu/delete/${id}`, {
    method: 'DELETE',
  })
}

