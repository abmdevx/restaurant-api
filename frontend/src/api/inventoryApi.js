import { apiRequest } from './client'

export function getAllInventory(params = {}) {
  const searchParams = new URLSearchParams()
  if (params.category && params.category !== 'all') {
    searchParams.append('category', params.category)
  }
  if (params.lowStock) {
    searchParams.append('lowStock', 'true')
  }
  const qs = searchParams.toString()
  return apiRequest(`/inventory/all-items${qs ? `?${qs}` : ''}`)
}

export function getLowStockAlerts() {
  return apiRequest('/inventory/low-stock')
}

export function getInventoryItemById(id) {
  return apiRequest(`/inventory/item/${id}`)
}

export function addInventoryItem(itemData) {
  return apiRequest('/inventory/add-item', {
    method: 'POST',
    body: JSON.stringify(itemData),
  })
}

export function updateInventoryItem(id, itemData) {
  return apiRequest(`/inventory/update/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(itemData),
  })
}

export function restockInventory(id, { quantity, reason }) {
  return apiRequest(`/inventory/restock/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity, reason }),
  })
}

export function deductInventory(id, { quantity, reason }) {
  return apiRequest(`/inventory/deduct/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity, reason }),
  })
}

export function deleteInventoryItem(id) {
  return apiRequest(`/inventory/delete/${id}`, {
    method: 'DELETE',
  })
}

