import client from './client'
import type { Contact, ContactRequest } from '../types/contact'

interface ApiResponse<T> {
  data: T
  message?: string
}

export async function listContacts(restaurantId: string): Promise<Contact[]> {
  const { data } = await client.get<ApiResponse<Contact[]>>(
    `/restaurants/${restaurantId}/contacts`
  )
  return data.data
}

export async function getContact(restaurantId: string, id: string): Promise<Contact> {
  const { data } = await client.get<ApiResponse<Contact>>(
    `/restaurants/${restaurantId}/contacts/${id}`
  )
  return data.data
}

export async function createContact(restaurantId: string, request: ContactRequest): Promise<Contact> {
  const { data } = await client.post<ApiResponse<Contact>>(
    `/restaurants/${restaurantId}/contacts`,
    request
  )
  return data.data
}

export async function updateContact(restaurantId: string, id: string, request: ContactRequest): Promise<Contact> {
  const { data } = await client.put<ApiResponse<Contact>>(
    `/restaurants/${restaurantId}/contacts/${id}`,
    request
  )
  return data.data
}

export async function deleteContact(restaurantId: string, id: string): Promise<void> {
  await client.delete(`/restaurants/${restaurantId}/contacts/${id}`)
}
