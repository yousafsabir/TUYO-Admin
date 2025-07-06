'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DebugTheme() {
	const { theme, setTheme, resolvedTheme, systemTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return <div>Loading theme debug...</div>
	}

	return (
		<Card className='w-full max-w-md'>
			<CardHeader>
				<CardTitle>Theme Debug</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='space-y-2'>
					<p>
						<strong>Current theme:</strong> {theme}
					</p>
					<p>
						<strong>Resolved theme:</strong> {resolvedTheme}
					</p>
					<p>
						<strong>System theme:</strong> {systemTheme}
					</p>
					<p>
						<strong>HTML class:</strong> {document.documentElement.className}
					</p>
				</div>

				<div className='flex gap-2'>
					<Button size='sm' onClick={() => setTheme('light')}>
						Light
					</Button>
					<Button size='sm' onClick={() => setTheme('dark')}>
						Dark
					</Button>
					<Button size='sm' onClick={() => setTheme('system')}>
						System
					</Button>
				</div>

				<div className='rounded border p-4'>
					<p className='text-sm'>
						This card should change colors when you switch themes. Background:{' '}
						<span className='rounded bg-muted px-2 py-1'>muted</span>
					</p>
				</div>
			</CardContent>
		</Card>
	)
}
