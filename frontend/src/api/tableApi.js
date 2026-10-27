import { apiRequest } from './client'

export function getAllTables(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiRequest(`/tables/all-tables${query}`)
}

export function createTable(tableData) {
  return apiRequest('/tables/create', {
    method: 'POST',
    body: JSON.stringify(tableData),
  })
}

export function deleteTable(tableId) {
  return apiRequest(`/tables/delete/${tableId}`, {
    method: 'DELETE',
  })
}

