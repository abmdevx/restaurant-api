import { apiRequest } from './client'

export function loginUser(credentials) {
  return apiRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function registerUser(details) {
  return apiRequest('/users/register', {
    method: 'POST',
    body: JSON.stringify(details),
  })
}

export function logoutUser() {
  return apiRequest('/users/logout', { method: 'POST' })
}
