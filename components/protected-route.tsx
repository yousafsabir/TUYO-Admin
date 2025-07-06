'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const authState = useAuth()
	const { isAuthenticated, isLoading } = authState
	const router = useRouter()
	const pathname = usePathname()
	const [isClient, setIsClient] = useState(false)

	useEffect(() => {
		setIsClient(true)
	}, [])

	useEffect(() => {
		if (isClient) {
			try {
				if (!isLoading && !isAuthenticated) {
					// Store the attempted URL to redirect back after login
					if (typeof window !== 'undefined') {
						sessionStorage.setItem('redirectAfterLogin', pathname)
					}
					router.push(`/login`)
				}
			} catch (error) {
				console.error('Auth context not available yet:', error)
				// If auth context isn't available, redirect to login as a fallback
				router.push(`/login`)
			}
		}
	}, [isAuthenticated, isLoading, router, pathname, isClient])

	// Don't render anything on the server or during initial client load
	// to prevent flash of unauthorized content
	if (!isClient || isLoading) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
			</div>
		)
	}

	// If authenticated, render the children
	return isAuthenticated ? <>{children}</> : null
}
