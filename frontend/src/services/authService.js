
import { api, setAccessToken, clearAccessToken } from './api'

const AUTH_ENDPOINTS = {
  login: '/auth/login/',
  register: '/auth/register/',
  logout: '/auth/logout/',
  me: '/auth/me/',
}

export async function loginUser(credentials) {
  const data = await api.post(AUTH_ENDPOINTS.login, credentials)

  if (data?.access) {
    setAccessToken(data.access)
  }

  return data
}

export async function registerUser(userData) {
  const data = await api.post(AUTH_ENDPOINTS.register, userData)

  if (data?.access) {
    setAccessToken(data.access)
  }

  return data
}

export async function logoutUser() {
  try {
    return await api.post(AUTH_ENDPOINTS.logout, {})
  } finally {
    clearAccessToken()
  }
}

export async function getCurrentUser() {
  return api.get(AUTH_ENDPOINTS.me)
}
