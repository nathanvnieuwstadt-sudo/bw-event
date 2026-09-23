import client from './client'
import type { Menu, MenuRequest } from '../types/menu'

interface ApiResponse<T> {
  data: T
}

export async function listMenus(restaurantId: string): Promise<Menu[]> {
  const { data } = await client.get<ApiResponse<Menu[]>>(
    `/restaurants/${restaurantId}/menus`
  )
  return data.data
}

export async function createMenu(restaurantId: string, request: MenuRequest): Promise<Menu> {
  const { data } = await client.post<ApiResponse<Menu>>(
    `/restaurants/${restaurantId}/menus`,
    request
  )
  return data.data
}

export async function updateMenu(restaurantId: string, id: string, request: MenuRequest): Promise<Menu> {
  const { data } = await client.put<ApiResponse<Menu>>(
    `/restaurants/${restaurantId}/menus/${id}`,
    request
  )
  return data.data
}

export async function deleteMenu(restaurantId: string, id: string): Promise<void> {
  await client.delete(`/restaurants/${restaurantId}/menus/${id}`)
}
