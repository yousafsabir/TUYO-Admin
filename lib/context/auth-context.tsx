'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
	checkAuthStatus,
	logoutUser,
	getAuthToken,
	isTokenExpired,
	type Admin,
} from '@/lib/api/auth'
type AuthContextType = {
	user: Admin | null
	isLoading: boolean
	isAuthenticated: boolean
	isInitialized: boolean
	logout: () => Promise<void>
	refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname()
	const [user, setUser] = useState<Admin | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isInitialized, setIsInitialized] = useState(false)
	const router = useRouter()

	const refreshUser = async () => {
		try {
			setIsLoading(true)

			// Check if we have a token
			const token = getAuthToken()
			if (!token || isTokenExpired(token)) {
				throw new Error('No valid token')
			}

			// Get user data from API
			const response = await checkAuthStatus()

			// Extract user data from the response structure
			if (response.status === 'success' && response.data) {
				setUser(response.data)
				setIsAuthenticated(true)
				const path = pathname.slice(3)
				if (!path || path === '/login') {
					router.push('/dashboard')
				} else router.push(path)
			} else {
				throw new Error('Invalid response structure')
			}
		} catch (error) {
			setUser(null)
			setIsAuthenticated(false)
			router.push(`/login`)
			throw error
		} finally {
			setIsLoading(false)
			setIsInitialized(true)
		}
	}

	const logout = async () => {
		try {
			await logoutUser()
		} catch (error) {
			console.error('Logout error:', error)
		} finally {
			// Even if API call fails, clear local state
			setUser(null)
			setIsAuthenticated(false)
			router.push(`/login`)
		}
	}

	useEffect(() => {
		refreshUser()
	}, [])

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				isAuthenticated,
				isInitialized,
				logout,
				refreshUser,
			}}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		// Instead of throwing an error, return a default state
		console.warn('useAuth must be used within an AuthProvider')
		return {
			user: null,
			isLoading: true,
			isAuthenticated: false,
			isInitialized: false,
			logout: async () => {},
			refreshUser: async () => {},
		}
	}
	return context
}
