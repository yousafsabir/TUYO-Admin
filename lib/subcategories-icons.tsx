import { AccessoriesSvg } from '@/components/svgs/subcategories/accessories'
import { CapsSvg } from '@/components/svgs/subcategories/caps'
import { CoatsSvg } from '@/components/svgs/subcategories/coats'
import { DressesSvg } from '@/components/svgs/subcategories/dresses'
import { HeelsSvg } from '@/components/svgs/subcategories/heels'
import { HoodiesSvg } from '@/components/svgs/subcategories/hoodies'
import { JacketsSvg } from '@/components/svgs/subcategories/jackets'
import { LadiesPantsSvg } from '@/components/svgs/subcategories/ladies-pants'
import { LadiesPolosSvg } from '@/components/svgs/subcategories/ladies-polos'
import { LadiesShirtsSvg } from '@/components/svgs/subcategories/ladies-shirts'
import { PantsSvg } from '@/components/svgs/subcategories/pants'
import { PolosSvg } from '@/components/svgs/subcategories/polos'
import { ShirtsSvg } from '@/components/svgs/subcategories/shirts'
import { ShoesSvg } from '@/components/svgs/subcategories/shoes'
import { ShortsSvg } from '@/components/svgs/subcategories/shorts'
import { SkirtsSvg } from '@/components/svgs/subcategories/skirts'
import { StrapsSvg } from '@/components/svgs/subcategories/straps'
import { TopsSvg } from '@/components/svgs/subcategories/tops'

export const subcategoriesIcons = {
	accessories: <AccessoriesSvg className='h-6 w-6' />,
	caps: <CapsSvg className='h-6 w-6' />,
	coats: <CoatsSvg className='h-6 w-6' />,
	dresses: <DressesSvg className='h-6 w-6' />,
	heels: <HeelsSvg className='h-6 w-6' />,
	hoodies: <HoodiesSvg className='h-6 w-6' />,
	jackets: <JacketsSvg className='h-6 w-6' />,
	'ladies-pants': <LadiesPantsSvg className='h-6 w-6' />,
	'ladies-polos': <LadiesPolosSvg className='h-6 w-6' />,
	'ladies-shirts': <LadiesShirtsSvg className='h-6 w-6' />,
	pants: <PantsSvg className='h-6 w-6' />,
	polos: <PolosSvg className='h-6 w-6' />,
	shirts: <ShirtsSvg className='h-6 w-6' />,
	shoes: <ShoesSvg className='h-6 w-6' />,
	shorts: <ShortsSvg className='h-6 w-6' />,
	skirts: <SkirtsSvg className='h-6 w-6' />,
	straps: <StrapsSvg className='h-6 w-6' />,
	tops: <TopsSvg className='h-6 w-6' />,
} as const

export type SubcategoryIconKey = keyof typeof subcategoriesIcons

// Function to get user-friendly labels for icon keys
export function getSubcategoryIconLabel(key: SubcategoryIconKey): string {
	// Convert kebab-case to title case
	return key
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

const subcategoryIconOptions = Object.keys(subcategoriesIcons).map((key) => ({
	value: key,
	label: getSubcategoryIconLabel(key as SubcategoryIconKey),
	icon: subcategoriesIcons[key as SubcategoryIconKey],
}))
