import axios from 'axios'

export function apiMessage(error: unknown) {
  return axios.isAxiosError(error)
    ? error.response?.data?.message ?? 'No fue posible completar la operación'
    : 'Error inesperado'
}
