'use client'

import { use, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { fetchWithNgrok } from '@/lib/api/fetch-utils'
import { imageUrl } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Loader2,
	MessageSquare,
	MapPin,
	Phone,
	Mail,
	User,
	CreditCard,
	Package,
	ShoppingCart,
	Star,
	ArrowLeft,
	MoveLeft,
	BanknoteArrowDown,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import UsersProductsTable from './products-table'
import UsersSalesTable from './sales-table'
import { UsersSubscriptionsTable } from './subscriptions-table'
import UsersWithdrawalRequests from './withdrawal-requests'
import Link from 'next/link'

// Types & Interfaces
interface Address {
	id: number
	userId: number
	recipientName: string
	phoneNumber: string
	country: string
	state: string
	city: string
	municipality: string
	neighborhood: string
	street: string
	exteriorReference: string
	interiorReference: string
	postalCode: number
	isPrimary: boolean
	status: string
	createdAt: string
	updatedAt: string
}

interface Balance {
	availableBalance: number
	lockedBalance: number
}

interface User {
	id: number
	firstName: string
	lastName: string
	username: string
	email: string
	avatarUrl: string
	isInfluencer: boolean
	phoneNumber: string
	addresses: Address[]
	balance: Balance
}

interface UserResponse {
	statusCode: number
	status: string
	message: string
	data: User
}

// Query hook
const useUser = (id: string) => {
	return useQuery<UserResponse>({
		queryKey: ['user', id],
		queryFn: async () => {
			const response = await fetchWithNgrok(`/users/${id}`, {
				method: 'GET',
			})

			if (!response.ok) {
				throw new Error(`Failed to fetch user: ${response.status}`)
			}

			return response.json()
		},
		enabled: !isNaN(parseInt(id, 10)),
	})
}

// Utility functions
const formatCurrency = (amount: number) => {
	return `$${amount.toFixed(2)}`
}

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString()
}

// Address Modal Component
function AddressModal({ addresses }: { addresses: Address[] }) {
	const t = useTranslations()

	const formatAddress = (address: Address) => {
		const parts = [
			address.street,
			address.exteriorReference,
			address.interiorReference && `Int. ${address.interiorReference}`,
			address.neighborhood,
			address.municipality,
			address.city,
			address.state,
			address.country,
			`CP ${address.postalCode}`,
		].filter(Boolean)

		return parts.join(', ')
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='outline' className='gap-2'>
					<MapPin className='h-4 w-4' />
					{t('userDetail.addresses')} ({addresses.length})
				</Button>
			</DialogTrigger>
			<DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{t('userDetail.userAddresses')}</DialogTitle>
					<DialogDescription>
						{t('userDetail.userAddressesDescription')}
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4'>
					{addresses.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('userDetail.table.recipient')}</TableHead>
									<TableHead>{t('userDetail.table.address')}</TableHead>
									<TableHead>{t('userDetail.table.phone')}</TableHead>
									<TableHead>{t('userDetail.table.status')}</TableHead>
									<TableHead>{t('userDetail.table.primary')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{addresses.map((address) => (
									<TableRow key={address.id}>
										<TableCell>
											<div className='font-medium'>
												{address.recipientName}
											</div>
										</TableCell>
										<TableCell>
											<div className='max-w-xs'>
												<p className='text-sm'>{formatAddress(address)}</p>
											</div>
										</TableCell>
										<TableCell>
											<div className='text-sm'>{address.phoneNumber}</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													address.status === 'active'
														? 'default'
														: 'secondary'
												}>
												{address.status}
											</Badge>
										</TableCell>
										<TableCell>
											{address.isPrimary ? (
												<Badge variant='outline'>
													{t('userDetail.primary')}
												</Badge>
											) : (
												<span className='text-muted-foreground'>-</span>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className='py-8 text-center text-muted-foreground'>
							{t('userDetail.noAddresses')}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

// User Avatar Component
function UserAvatar({
	avatarUrl,
	firstName,
	lastName,
}: {
	avatarUrl: string
	firstName: string
	lastName: string
}) {
	const [imageError, setImageError] = useState(false)

	return (
		<div className='h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg'>
			{!imageError && avatarUrl ? (
				<img
					src={imageUrl(avatarUrl)}
					alt={`${firstName} ${lastName}`}
					className='h-full w-full object-cover'
					onError={() => setImageError(true)}
				/>
			) : (
				<div className='flex h-full w-full items-center justify-center bg-muted'>
					<User className='h-8 w-8 text-muted-foreground' />
				</div>
			)}
		</div>
	)
}

export default function UserDetailPage(props: { params: Promise<{ id: string }> }) {
	const t = useTranslations()
	const { id } = use(props.params)

	if (!id || isNaN(parseInt(id, 10))) {
		return (
			<div className='flex h-[100px] items-center justify-center'>
				<Alert variant='destructive' className='max-w-md'>
					<AlertDescription>{t('userDetail.invalidId')}</AlertDescription>
				</Alert>
			</div>
		)
	}

	const { data, isLoading, isError, error } = useUser(id)

	if (isLoading) {
		return (
			<div className='flex h-[100px] items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		)
	}

	if (isError) {
		return (
			<div className='flex h-[100px] items-center justify-center'>
				<Alert variant='destructive' className='max-w-md'>
					<AlertDescription>
						{error instanceof Error ? error.message : t('userDetail.loadError')}
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	const user = data?.data

	if (!user) {
		return (
			<div className='flex h-[100px] items-center justify-center'>
				<Alert className='max-w-md'>
					<AlertDescription>{t('userDetail.noData')}</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			<Link href='/dashboard/users' className='flex items-center gap-2'>
				<MoveLeft className='size-6' />
				{t('common.go-back')}
			</Link>
			{/* User Header Card */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex items-start gap-6'>
						{/* Avatar */}
						<UserAvatar
							avatarUrl={user.avatarUrl}
							firstName={user.firstName}
							lastName={user.lastName}
						/>

						{/* User Info */}
						<div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
							<div>
								<div className='flex items-center gap-3'>
									<h1 className='text-2xl font-bold'>
										{user.firstName} {user.lastName}
									</h1>
									{user.isInfluencer && (
										<Badge variant='default' className='gap-1'>
											<Star className='h-3 w-3' />
											{t('userDetail.influencer')}
										</Badge>
									)}
								</div>
								<p className='font-bold'>ID: {user.id}</p>
								<p className='text-muted-foreground'>@{user.username}</p>
							</div>
							{/* Action Buttons */}
							<div className='flex gap-3'>
								<Button className='gap-2'>
									<MessageSquare className='h-4 w-4' />
									{t('userDetail.sendMessage')}
								</Button>
								<AddressModal addresses={user.addresses} />
							</div>

							{/* Contact Info */}
							<div className='space-y-[6px]'>
								<div className='flex items-center gap-2 text-sm'>
									<Mail className='h-4 w-4 text-muted-foreground' />
									<span>{user.email}</span>
								</div>
								<div className='flex items-center gap-2 text-sm'>
									<Phone className='h-4 w-4 text-muted-foreground' />
									<span>{user.phoneNumber ? user.phoneNumber : '-'}</span>
								</div>
							</div>

							{/* Balance Info */}
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<div className='flex gap-2'>
									<CreditCard className='mt-[2px] size-4' />
									<div className='grid grid-cols-2 gap-x-2 gap-y-[2px]'>
										<p className='col-span-full text-sm font-bold'>
											{t('userDetail.balance')}
										</p>
										<p className='text-sm text-muted-foreground'>
											{t('userDetail.availableBalance')}:
										</p>
										<p className='text-muted-foreground'>
											{formatCurrency(user.balance.availableBalance)}
										</p>
										<p className='text-sm text-muted-foreground'>
											{t('userDetail.lockedBalance')}:
										</p>
										<p className='text-muted-foreground'>
											{formatCurrency(user.balance.lockedBalance)}
										</p>
										<p className='text-sm font-bold'>{t('common.total')}:</p>
										<p>
											{formatCurrency(
												user.balance.availableBalance +
													user.balance.lockedBalance,
											)}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs Section */}
			<Card>
				<CardContent className='p-0'>
					<Tabs defaultValue='products' className='w-full'>
						<TabsList className='grid w-full grid-cols-4 rounded-none border-b'>
							<TabsTrigger value='products' className='gap-2'>
								<Package className='h-4 w-4' />
								{t('userDetail.tabs.products')}
							</TabsTrigger>
							<TabsTrigger value='sales' className='gap-2'>
								<ShoppingCart className='h-4 w-4' />
								{t('userDetail.tabs.sales')}
							</TabsTrigger>
							<TabsTrigger value='subscription' className='gap-2'>
								<Star className='h-4 w-4' />
								{t('userDetail.tabs.subscription')}
							</TabsTrigger>
							<TabsTrigger value='withdrawal' className='gap-2'>
								<BanknoteArrowDown className='h-4 w-4' />
								{t('userDetail.tabs.withdrawal')}
							</TabsTrigger>
						</TabsList>

						<div className='p-6'>
							<TabsContent value='products' className='mt-0'>
								<UsersProductsTable userId={id} />
							</TabsContent>

							<TabsContent value='sales' className='mt-0'>
								<UsersSalesTable userId={id} />
							</TabsContent>

							<TabsContent value='subscription' className='mt-0'>
								<UsersSubscriptionsTable userId={id} />
							</TabsContent>

							<TabsContent value='withdrawal' className='mt-0'>
								<UsersWithdrawalRequests userId={id} />
							</TabsContent>
						</div>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	)
}
