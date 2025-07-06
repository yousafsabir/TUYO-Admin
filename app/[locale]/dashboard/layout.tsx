import type React from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<ProtectedRoute>
			<div className='flex h-screen overflow-hidden bg-background'>
				<DashboardSidebar />
				<div className='flex flex-1 flex-col overflow-hidden'>
					<DashboardHeader />
					<main className='flex-1 overflow-y-auto bg-background p-4 md:p-6'>
						{children}
					</main>
				</div>
				<Toaster />
			</div>
		</ProtectedRoute>
	)
}
