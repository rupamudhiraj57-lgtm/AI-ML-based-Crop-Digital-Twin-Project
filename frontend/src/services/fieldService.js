
import { api } from './api'

export async function getFields() {
  return api.get('/fields/')
}

export async function getFieldById(fieldId) {
  return api.get(`/fields/${fieldId}/`)
}
