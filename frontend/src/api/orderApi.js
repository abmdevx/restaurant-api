import { apiRequest } from './client'

export function getAllOrders(params = {}) {
  const searchParams = new URLSearchParams()
  if (params.status && params.status !== 'all') {
    searchParams.append('status', params.status)
  }
  if (params.tableId) {
    searchParams.append('tableId', params.tableId)
  }
  if (params.date) {
    searchParams.append('date', params.date)
  }
  const qs = searchParams.toString()
  return apiRequest(`/orders/get-all${qs ? `?${qs}` : ''}`)
}

export function getOrderById(orderId) {
  return apiRequest(`/orders/get-order/${orderId}`)
}

export function getOrdersByTable(tableId) {
  return apiRequest(`/orders/table-order/${tableId}`)
}

export function placeOrder(orderData) {
  return apiRequest('/orders/create', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

export function updateOrderStatus(orderId, status) {
  return apiRequest(`/orders/update-status/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function addItemsToOrder(orderId, items) {
  return apiRequest(`/orders/add-items/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ items }),
  })
}

export function processPayment(orderId, paymentMethod) {
  return apiRequest(`/orders/process-payment/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentMethod }),
  })
}

export function cancelOrder(orderId) {
  return apiRequest(`/orders/cancel/${orderId}`, {
    method: 'PATCH',
  })
}

