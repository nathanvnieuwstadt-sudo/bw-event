export type UserRole = 'OWNER' | 'GENERAL_MANAGER' | 'FLOOR_MANAGER' | 'KITCHEN' | 'DEV'

export interface User {
  id: string
  restaurantId: string | null
  email: string
  role: UserRole
  createdAt: string
}

export interface CreateStaffRequest {
  email: string
  password: string
  role: Exclude<UserRole, 'DEV'>
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: string
  email: string
  role: UserRole
  restaurantId: string | null
}
