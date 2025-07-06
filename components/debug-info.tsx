'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { DebugTheme } from './debug-theme'

export function DebugInfo() {
	const [showDebug, setShowDebug] = useState(false)
	const [apiInfo, setApiInfo] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [envVars, setEnvVars] = useState<Record<string, string>>({})

	useEffect(() => {
		// Collect environment variables that start with NEXT_PUBLIC_
		const publicEnvVars: Record<string, string> = {}
		Object.keys(process.env).forEach((key) => {
			if (key.startsWith('NEXT_PUBLIC_')) {
				publicEnvVars[key] = process.env[key] as string
			}
		})
		setEnvVars(publicEnvVars)
	}, [])

	const checkApiConnection = async () => {
		setError(null)
		setApiInfo(null)

		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL
			setApiInfo(`Checking connection to: ${apiUrl}`)

			const response = await fetchWithNgrok(`${apiUrl}/api/v1/health`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})

			if (response.ok) {
				const data = await response.json()
				setApiInfo(`Connection successful: ${JSON.stringify(data)}`)
			} else {
				setApiInfo(`Connection failed with status: ${response.status}`)
			}
		} catch (err) {
			setError(`Error checking API: ${err instanceof Error ? err.message : String(err)}`)
		}
	}

	if (!showDebug) {
		return (
			<div className='fixed bottom-4 right-4'>
				<Button variant='outline' size='sm' onClick={() => setShowDebug(true)}>
					Debug
				</Button>
			</div>
		)
	}

	return (
		<div className='fixed bottom-4 right-4 z-50 max-h-[80vh] w-96 overflow-y-auto rounded-lg border bg-card p-4 shadow-lg'>
			<div className='mb-2 flex items-center justify-between'>
				<h3 className='font-medium'>Debug Information</h3>
				<Button variant='ghost' size='sm' onClick={() => setShowDebug(false)}>
					Close
				</Button>
			</div>

			<div className='space-y-4 text-sm'>
				{/* Theme Debug Section */}
				<div>
					<h4 className='mb-2 font-semibold'>Theme Debug:</h4>
					<DebugTheme />
				</div>

				{/* Environment Variables */}
				<div>
					<h4 className='mb-2 font-semibold'>Environment Variables:</h4>
					{Object.entries(envVars).map(([key, value]) => (
						<div key={key} className='break-all rounded bg-muted p-1 text-xs'>
							<strong>{key}:</strong> {value}
						</div>
					))}
				</div>

				{/* API Test */}
				<div>
					<h4 className='mb-2 font-semibold'>API Test:</h4>
					<Button size='sm' onClick={checkApiConnection}>
						Test API Connection
					</Button>
				</div>

				{apiInfo && <div className='break-all rounded bg-muted p-2 text-xs'>{apiInfo}</div>}

				{error && (
					<Alert variant='destructive' className='py-2'>
						<AlertDescription className='text-xs'>{error}</AlertDescription>
					</Alert>
				)}
			</div>
		</div>
	)
}
