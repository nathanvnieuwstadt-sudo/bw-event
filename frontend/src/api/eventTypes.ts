import client from './client'
import type { EventType, EventTypeRequest } from '../types/eventType'

interface ApiResponse<T> {
  data: T
}

export async function listEventTypes(restaurantId: string): Promise<EventType[]> {
  const { data } = await client.get<ApiResponse<EventType[]>>(
    `/restaurants/${restaurantId}/event-types`
  )
  return data.data
}

export async function createEventType(restaurantId: string, request: EventTypeRequest): Promise<EventType> {
  const { data } = await client.post<ApiResponse<EventType>>(
    `/restaurants/${restaurantId}/event-types`,
    request
  )
  return data.data
}

export async function updateEventType(restaurantId: string, id: string, request: EventTypeRequest): Promise<EventType> {
  const { data } = await client.put<ApiResponse<EventType>>(
    `/restaurants/${restaurantId}/event-types/${id}`,
    request
  )
  return data.data
}

export async function deleteEventType(restaurantId: string, id: string): Promise<void> {
  await client.delete(`/restaurants/${restaurantId}/event-types/${id}`)
}
