import { createContext, useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import type { LoginResponse, UserRole } from '../types/user'

interface AuthState {
  token: string | null
  userId: string | null
  email: string | null
  role: UserRole | null
  restaurantId: string | null
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean
  setAuth: (response: LoginResponse) => void
  clearAuth: () => void
  hasRole: (...roles: UserRole[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const email = localStorage.getItem('email')
    const role = localStorage.getItem('role') as UserRole | null
    const restaurantId = localStorage.getItem('restaurantId')
    return { token, userId, email, role, restaurantId }
  })

  const setAuth = useCallback((response: LoginResponse) => {
    localStorage.setItem('token', response.token)
    localStorage.setItem('userId', response.userId)
    localStorage.setItem('email', response.email)
    localStorage.setItem('role', response.role)
    if (response.restaurantId) {
      localStorage.setItem('restaurantId', response.restaurantId)
    } else {
      localStorage.removeItem('restaurantId')
    }
    setState({
      token: response.token,
      userId: response.userId,
      email: response.email,
      role: response.role,
      restaurantId: response.restaurantId,
    })
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    localStorage.removeItem('restaurantId')
    setState({ token: null, userId: null, email: null, role: null, restaurantId: null })
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => state.role !== null && roles.includes(state.role),
    [state.role]
  )

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: state.token !== null,
        setAuth,
        clearAuth,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
