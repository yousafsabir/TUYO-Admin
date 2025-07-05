import { AccessoriesSvg } from "@/components/svgs/subcategories/accessories"
import { CapsSvg } from "@/components/svgs/subcategories/caps"
import { CoatsSvg } from "@/components/svgs/subcategories/coats"
import { DressesSvg } from "@/components/svgs/subcategories/dresses"
import { HeelsSvg } from "@/components/svgs/subcategories/heels"
import { HoodiesSvg } from "@/components/svgs/subcategories/hoodies"
import { JacketsSvg } from "@/components/svgs/subcategories/jackets"
import { LadiesPantsSvg } from "@/components/svgs/subcategories/ladies-pants"
import { LadiesPolosSvg } from "@/components/svgs/subcategories/ladies-polos"
import { LadiesShirtsSvg } from "@/components/svgs/subcategories/ladies-shirts"
import { PantsSvg } from "@/components/svgs/subcategories/pants"
import { PolosSvg } from "@/components/svgs/subcategories/polos"
import { ShirtsSvg } from "@/components/svgs/subcategories/shirts"
import { ShoesSvg } from "@/components/svgs/subcategories/shoes"
import { ShortsSvg } from "@/components/svgs/subcategories/shorts"
import { SkirtsSvg } from "@/components/svgs/subcategories/skirts"
import { StrapsSvg } from "@/components/svgs/subcategories/straps"
import { TopsSvg } from "@/components/svgs/subcategories/tops"

export const subcategoriesIcons = {
  accessories: <AccessoriesSvg className="w-6 h-6" />,
  caps: <CapsSvg className="w-6 h-6" />,
  coats: <CoatsSvg className="w-6 h-6" />,
  dresses: <DressesSvg className="w-6 h-6" />,
  heels: <HeelsSvg className="w-6 h-6" />,
  hoodies: <HoodiesSvg className="w-6 h-6" />,
  jackets: <JacketsSvg className="w-6 h-6" />,
  "ladies-pants": <LadiesPantsSvg className="w-6 h-6" />,
  "ladies-polos": <LadiesPolosSvg className="w-6 h-6" />,
  "ladies-shirts": <LadiesShirtsSvg className="w-6 h-6" />,
  pants: <PantsSvg className="w-6 h-6" />,
  polos: <PolosSvg className="w-6 h-6" />,
  shirts: <ShirtsSvg className="w-6 h-6" />,
  shoes: <ShoesSvg className="w-6 h-6" />,
  shorts: <ShortsSvg className="w-6 h-6" />,
  skirts: <SkirtsSvg className="w-6 h-6" />,
  straps: <StrapsSvg className="w-6 h-6" />,
  tops: <TopsSvg className="w-6 h-6" />,
} as const

export type SubcategoryIconKey = keyof typeof subcategoriesIcons

// Function to get user-friendly labels for icon keys
export function getSubcategoryIconLabel(key: SubcategoryIconKey): string {
  // Convert kebab-case to title case
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export const subcategoryIconOptions = Object.keys(subcategoriesIcons).map((key) => ({
  value: key,
  label: getSubcategoryIconLabel(key as SubcategoryIconKey),
  icon: subcategoriesIcons[key as SubcategoryIconKey],
}))
