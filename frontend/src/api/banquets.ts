import client from './client'
import type { Banquet, BanquetRequest, BanquetSummary } from '../types/banquet'

interface ApiResponse<T> {
  data: T
  message?: string
}

export async function listBanquets(restaurantId: string): Promise<BanquetSummary[]> {
  const { data } = await client.get<ApiResponse<BanquetSummary[]>>(
    `/restaurants/${restaurantId}/banquets`
  )
  return data.data
}

export async function listUpcomingBanquets(restaurantId: string, days = 30): Promise<BanquetSummary[]> {
  const { data } = await client.get<ApiResponse<BanquetSummary[]>>(
    `/restaurants/${restaurantId}/banquets/upcoming`,
    { params: { days } }
  )
  return data.data
}

export async function getBanquet(restaurantId: string, id: string): Promise<Banquet> {
  const { data } = await client.get<ApiResponse<Banquet>>(
    `/restaurants/${restaurantId}/banquets/${id}`
  )
  return data.data
}

export async function createBanquet(restaurantId: string, request: BanquetRequest): Promise<Banquet> {
  const { data } = await client.post<ApiResponse<Banquet>>(
    `/restaurants/${restaurantId}/banquets`,
    request
  )
  return data.data
}

export async function updateBanquet(restaurantId: string, id: string, request: BanquetRequest): Promise<Banquet> {
  const { data } = await client.put<ApiResponse<Banquet>>(
    `/restaurants/${restaurantId}/banquets/${id}`,
    request
  )
  return data.data
}

export async function deleteBanquet(restaurantId: string, id: string): Promise<void> {
  await client.delete(`/restaurants/${restaurantId}/banquets/${id}`)
}
