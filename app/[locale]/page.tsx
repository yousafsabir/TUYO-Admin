'use client'

import { useAuth } from '@/lib/context/auth-context'
import { useEffect, useState } from 'react'

export default function HomePage() {
	const { isLoading } = useAuth()
	const [isClient, setIsClient] = useState(false)

	useEffect(() => {
		setIsClient(true)
	}, [])

	if (!isClient || isLoading) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
			</div>
		)
	}
	return <div></div>
}
