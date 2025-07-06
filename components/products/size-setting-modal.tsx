'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface SizeSettingModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (measurements: {
		size: string
		height: string
		chest: string
		waist: string
		hip: string
	}) => void
	currentValues?: {
		size: string
		height: string
		chest: string
		waist: string
		hip: string
	}
}

export default function SizeSettingModal({
	isOpen,
	onClose,
	onSubmit,
	currentValues,
}: SizeSettingModalProps) {
	const [measurements, setMeasurements] = useState({
		size: '',
		height: '',
		chest: '',
		waist: '',
		hip: '',
	})

	// Update local state when currentValues change
	useEffect(() => {
		if (currentValues) {
			setMeasurements(currentValues)
		}
	}, [currentValues])

	const updateMeasurement = (field: keyof typeof measurements, value: string) => {
		setMeasurements((prev) => ({ ...prev, [field]: value }))
	}

	const handleSubmit = () => {
		onSubmit(measurements)
	}

	const handleClose = () => {
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-w-[350px] rounded-2xl sm:max-w-md'>
				<DialogHeader>
					<DialogTitle className='text-center text-2xl font-bold'>
						Specify Size
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Size Selector */}
					<div className='space-y-2'>
						<Label className='text-sm text-muted-foreground'>Size</Label>
						<Select
							value={measurements.size}
							onValueChange={(value) => updateMeasurement('size', value)}>
							<SelectTrigger>
								<SelectValue placeholder='Select a size' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='XS'>XS</SelectItem>
								<SelectItem value='S'>S</SelectItem>
								<SelectItem value='M'>M</SelectItem>
								<SelectItem value='L'>L</SelectItem>
								<SelectItem value='XL'>XL</SelectItem>
								<SelectItem value='XXL'>XXL</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Exact Measurements Section */}
					<div className='space-y-4'>
						<h3 className='text-lg font-semibold'>Enter Exact Measurements</h3>

						<div className='space-y-4'>
							<div className='space-y-2'>
								<Label className='text-sm text-muted-foreground'>Height (CM)</Label>
								<Input
									type='number'
									placeholder='Enter height'
									value={measurements.height}
									onChange={(e) => updateMeasurement('height', e.target.value)}
								/>
							</div>

							<div className='space-y-2'>
								<Label className='text-sm text-muted-foreground'>Chest (CM)</Label>
								<Input
									type='number'
									placeholder='Enter chest measurement'
									value={measurements.chest}
									onChange={(e) => updateMeasurement('chest', e.target.value)}
								/>
							</div>

							<div className='space-y-2'>
								<Label className='text-sm text-muted-foreground'>Waist (CM)</Label>
								<Input
									type='number'
									placeholder='Enter waist measurement'
									value={measurements.waist}
									onChange={(e) => updateMeasurement('waist', e.target.value)}
								/>
							</div>

							<div className='space-y-2'>
								<Label className='text-sm text-muted-foreground'>Hips (CM)</Label>
								<Input
									type='number'
									placeholder='Enter hip measurement'
									value={measurements.hip}
									onChange={(e) => updateMeasurement('hip', e.target.value)}
								/>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex gap-3'>
						<Button
							type='button'
							variant='outline'
							onClick={handleClose}
							className='flex-1'>
							Cancel
						</Button>
						<Button type='button' onClick={handleSubmit} className='flex-1'>
							Save
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
