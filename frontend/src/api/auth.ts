import client from './client'
import type { LoginRequest, LoginResponse } from '../types/user'

interface ApiResponse<T> {
  data: T
  message?: string
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await client.post<ApiResponse<LoginResponse>>('/auth/login', request)
  return data.data
}
