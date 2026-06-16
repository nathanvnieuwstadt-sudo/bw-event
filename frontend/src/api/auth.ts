import client from './client'
import type { LoginRequest, LoginResponse } from '../types/user'

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/auth/login', request)
  return data
}
