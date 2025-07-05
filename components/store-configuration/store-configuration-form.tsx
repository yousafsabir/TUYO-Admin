"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { BrandsTable } from "@/components/brands/brands-table"
import { AddBrandModal } from "@/components/brands/add-brand-modal"
import { CategoriesSubcategoriesTable } from "@/components/categories/categories-subcategories-table"
import { SubscriptionPlansTable } from "@/components/subscription-plans/subscription-plans-table"
import { ColorsTable } from "@/components/colors/colors-table"
import { AddColorModal } from "@/components/colors/add-color-modal"

interface StoreConfigurationFormProps {
  dictionary: any
}

export function StoreConfigurationForm({ dictionary }: StoreConfigurationFormProps) {
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false)
  const [isAddColorModalOpen, setIsAddColorModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Brands Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{dictionary?.brands?.title || "Brands"}</CardTitle>
              <CardDescription>
                {dictionary?.brands?.description || "Manage brands available for products."}
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddBrandModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {dictionary?.brands?.addBrand || "Add Brand"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BrandsTable dictionary={dictionary} />
        </CardContent>
      </Card>

      {/* Categories/Subcategories Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{dictionary?.categories?.title || "Categories & Subcategories"}</CardTitle>
            <CardDescription>
              {dictionary?.categories?.description || "Manage product categories and their subcategories."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <CategoriesSubcategoriesTable dictionary={dictionary} />
        </CardContent>
      </Card>

      {/* Subscription Plans Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{dictionary?.subscriptionPlans?.title || "Subscription Plans"}</CardTitle>
            <CardDescription>
              {dictionary?.subscriptionPlans?.description || "Manage subscription plans and their features."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SubscriptionPlansTable dictionary={dictionary} />
        </CardContent>
      </Card>

      {/* Colors Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{dictionary?.colors?.title || "Colors"}</CardTitle>
              <CardDescription>
                {dictionary?.colors?.description || "Manage colors available for products."}
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddColorModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {dictionary?.colors?.addColor || "Add Color"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ColorsTable dictionary={dictionary} />
        </CardContent>
      </Card>

      {/* Add Brand Modal */}
      <AddBrandModal
        isOpen={isAddBrandModalOpen}
        onClose={() => setIsAddBrandModalOpen(false)}
        dictionary={dictionary}
      />

      {/* Add Color Modal */}
      <AddColorModal
        isOpen={isAddColorModalOpen}
        onClose={() => setIsAddColorModalOpen(false)}
        dictionary={dictionary}
      />
    </div>
  )
}
