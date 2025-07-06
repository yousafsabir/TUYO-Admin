'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, Monitor } from 'lucide-react'

export function ThemeToggle() {
	const { setTheme, theme } = useTheme()
	const [mounted, setMounted] = React.useState(false)

	// useEffect only runs on the client, so now we can safely show the UI
	React.useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<Button variant='ghost' size='icon' className='rounded-full'>
				<Sun className='h-5 w-5' />
				<span className='sr-only'>Toggle theme</span>
			</Button>
		)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='icon' className='rounded-full'>
					<Sun className='h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
					<Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
					<span className='sr-only'>Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem
					onClick={() => setTheme('light')}
					className={theme === 'light' ? 'bg-muted font-medium' : ''}>
					<Sun className='mr-2 h-4 w-4' />
					Light
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme('dark')}
					className={theme === 'dark' ? 'bg-muted font-medium' : ''}>
					<Moon className='mr-2 h-4 w-4' />
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme('system')}
					className={theme === 'system' ? 'bg-muted font-medium' : ''}>
					<Monitor className='mr-2 h-4 w-4' />
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
