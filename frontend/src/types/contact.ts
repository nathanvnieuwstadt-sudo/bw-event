export interface Contact {
  id: string
  restaurantId: string
  name: string
  email: string
  phone: string | null
  organization: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactRequest {
  name: string
  email: string
  phone?: string
  organization?: string
}
