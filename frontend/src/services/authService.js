
import { api } from './api'

const AUTH_ENDPOINTS = {
  login: 'auth/login/',
  register: 'auth/register/',
  logout: 'auth/logout/',
  me: 'auth/status/',
}


export async function loginUser(credentials) {
  return api.post(AUTH_ENDPOINTS.login, {
    username: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  })
}


export async function registerUser(userData) {
  const username = userData.email?.trim().toLowerCase()

  const data = await api.post(AUTH_ENDPOINTS.register, {
    username,
    email: userData.email.trim(),
    password: userData.password,
    first_name: userData.name.trim(),
  })

  return data
}

export async function logoutUser() {
  return api.post(AUTH_ENDPOINTS.logout, {})
}

export async function getCurrentUser() {
  return api.get(AUTH_ENDPOINTS.me)
}
