import client from './client'
import type { User, CreateStaffRequest } from '../types/user'

interface ApiResponse<T> {
  data: T
  message?: string
}

export async function listStaff(restaurantId: string): Promise<User[]> {
  const { data } = await client.get<ApiResponse<User[]>>(
    `/restaurants/${restaurantId}/users`
  )
  return data.data
}

export async function createStaff(restaurantId: string, request: CreateStaffRequest): Promise<User> {
  const { data } = await client.post<ApiResponse<User>>(
    `/restaurants/${restaurantId}/users`,
    request
  )
  return data.data
}

export async function deleteStaff(restaurantId: string, id: string): Promise<void> {
  await client.delete(`/restaurants/${restaurantId}/users/${id}`)
}
