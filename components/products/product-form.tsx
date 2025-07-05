"use client"
import { useState, useEffect, useRef, type ComponentRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import SizeSettingModal from "./size-setting-modal"
import { Info, ChevronDown, XCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getAllBrands } from "@/lib/api/brands"
import { getAllCategoriesSubcategories } from "@/lib/api/categories"
import { Form, FormControl, FormLabel, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import ProductImages, { type UploadedImage } from "./product-images"
import type { Product } from "@/lib/api/products"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { xxHash } from "@/lib/utils/xxhash"

export type ProductFormRef = {
  setDefaultValues: (value: Product) => void
  submit: () => void
}

interface ProductFormProps {
  updateMode?: boolean
  submit: (values: any) => void
  loading?: boolean
  mutationPending?: boolean
  error?: boolean
  dictionary?: any
}

export default function ProductForm(props: ProductFormProps & { ref?: any }) {
  const { toast } = useToast()
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const submitProductForm = useRef<ComponentRef<"button">>(null)
  const [publishMode, setPublishMode] = useState<"publish" | "draft">("draft")
  const [imagesHash, setImagesHash] = useState("")
  const [sizeSettingOpen, setSizeSettingOpen] = useState(false)

  // Fetch brands and categories
  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getAllBrands(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ["categories-subcategories"],
    queryFn: () => getAllCategoriesSubcategories(),
  })

  const productFormSchema = z.object({
    images: z.array(z.any()).min(props.updateMode ? 0 : 1, {
      message: "At least 1 image is required",
    }),
    title: z.string({ message: "Title is required" }).min(10, { message: "Title must be at least 10 characters" }),
    brand: z.string().min(1, { message: "Brand is required" }),
    brandImage: z.string().optional(),
    price: z.string().min(1, { message: "Price is required" }),
    size: z.string().min(1, { message: "Size is required" }),
    category: z.string().min(1, { message: "Category is required" }),
    subcategory: z.string().min(1, {
      message: "Subcategory is required",
    }),
    condition: z.string().min(1, {
      message: "Condition is required",
    }),
    description: z
      .string({ message: "Description is required" })
      .min(10, { message: "Description must be at least 10 characters" }),
    material: z.string().optional(),
    color: z.string().optional(),
    colorCode: z.string().optional(),
    isAuction: z.boolean(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    productHeight: z.string().optional(),
    chestMeasurement: z.string().optional(),
    waistMeasurement: z.string().optional(),
    hipsMeasurement: z.string().optional(),
    // New admin fields
    sellerId: z.string().min(1, { message: "Seller ID is required" }),
    status: z.enum(["pending_approval", "draft", "live", "auction_ended", "sold", "archived"], {
      message: "Status is required",
    }),
    isFeatured: z.boolean(),
    isPremium: z.boolean(),
  })

  type ProductFormSchema = z.infer<typeof productFormSchema>

  const productForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      brand: "",
      brandImage: "",
      price: "",
      size: "",
      category: "",
      subcategory: "",
      condition: "",
      description: "",
      color: "",
      material: "",
      colorCode: "",
      isAuction: false,
      startDate: "",
      endDate: "",
      productHeight: "",
      chestMeasurement: "",
      waistMeasurement: "",
      hipsMeasurement: "",
      // New admin fields defaults
      sellerId: "",
      status: "draft",
      isFeatured: false,
      isPremium: false,
      images: [],
    },
  })

  async function setDefaultValues(values: Product) {
    try {
      Object.entries(values).forEach(([k, v]) => {
        if (["number", "string", "boolean"].includes(typeof v)) {
          if (k === "startDate" || k === "endDate") {
            // @ts-ignore
            productForm.setValue(k, new Date(v).toISOString().slice(0, 16))
          } else if (k === "price") {
            // @ts-ignore
            productForm.setValue(k, v?.toString())
          } else {
            // @ts-ignore
            productForm.setValue(k, v)
          }
        }
      })
      // setting images
      const initialImages = values.images.map((v) => ({
        ...v,
        image: null,
        filename: null,
      }))
      setUploadedImages(initialImages)
      const hash = await xxHash(JSON.stringify(initialImages))
      setImagesHash(hash)
    } catch (error) {
      console.error("Error setting default values:", error)
    }
  }

  function triggerSubmit(mode?: "publish" | "draft") {
    try {
      if (!props.updateMode && mode) setPublishMode(mode)
      productForm.setValue(
        "images",
        uploadedImages.filter((v) => v.image).map((v) => v.image),
      )
      // Trigger form submission
      setTimeout(() => {
        if (submitProductForm.current) {
          submitProductForm.current.click()
        }
      }, 100)
    } catch (error) {
      console.error("Error in triggerSubmit:", error)
    }
  }

  function handleResetCategory() {
    productForm.setValue("category", "")
    productForm.setValue("subcategory", "")
  }

  async function onSubmit(values: ProductFormSchema) {
    try {
      console.log("Form submission values:", values)
      // @ts-ignore
      if (!props.updateMode) values.mode = publishMode
      if (props.updateMode) {
        // Check if the user updated images.
        const newHash = await xxHash(JSON.stringify(uploadedImages))
        if (newHash === imagesHash) {
          props.submit(values)
          return
        }

        const sortedImages = uploadedImages.map((v) =>
          v.image ? { url: null, filename: v.filename } : { url: v.url, filename: null },
        )
        // @ts-ignore
        if (!values.images.length && !sortedImages.length) {
          toast({
            title: "Error",
            description: "At least 1 image is required",
            variant: "destructive",
          })
          return
        }
        // @ts-ignore
        values.sortedImages = JSON.stringify(sortedImages)
      }
      props.submit(values)
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (props.ref && !props.ref.current) props.ref.current = { setDefaultValues, submit: triggerSubmit }
  }, [])

  if (props.loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (props.error) {
    return (
      <div className="py-10 flex justify-center">
        <p className="text-destructive">Error loading form</p>
      </div>
    )
  }

  return (
    <Form {...productForm}>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={productForm.handleSubmit(onSubmit)}>
        {/* Image Upload Section */}
        <div className="col-span-full border rounded-xl p-6">
          <div className="mb-4 text-muted-foreground">
            <p>
              Upload up to 20 photos.{" "}
              <a href="#" className="text-primary hover:underline">
                Tips
              </a>
            </p>
            <p>First photo will be the cover photo.</p>
          </div>

          <ProductImages uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} />

          {/* Warning Message */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 text-muted-foreground p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 flex gap-2">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Important Notice</p>
              <p>Make sure your product images are clear and show the item accurately.</p>
              <a href="#" className="text-primary hover:underline">
                Read more
              </a>
            </div>
          </div>

          <FormField
            control={productForm.control}
            name="images"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Title */}
        <div className="px-3 py-2 rounded-xl border">
          <FormField
            control={productForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter product title"
                    className="border-0 px-0 focus-visible:ring-0"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Brand */}
        <div className="px-3 py-2 rounded-xl border">
          <FormField
            control={productForm.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Brand</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      const brandData = brandsData?.data
                      if (brandData && value) {
                        const brand = brandData.find((w) => w.name === value)
                        if (brand) {
                          productForm.setValue("brandImage", brand.imageUrl || "")
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="border-0 px-0 focus:ring-0">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandsData?.data?.map((brand) => (
                        <SelectItem key={brand.name} value={brand.name}>
                          <div className="flex items-center">
                            <img
                              src={brand.imageUrl || "/placeholder.svg"}
                              alt={brand.name}
                              className="w-6 h-6 mr-2 rounded-full"
                            />
                            {brand.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Price */}
        <div className="px-3 py-2 rounded-xl border">
          <FormField
            control={productForm.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Price</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold mr-2">$</span>
                    <Input
                      type="number"
                      className="border-0 px-0 focus-visible:ring-0"
                      min="10.00"
                      step="0.01"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Size */}
        <div className="px-3 py-2 space-y-2 rounded-xl border">
          <label className="text-sm text-muted-foreground">Size</label>
          <div
            className="flex justify-between px-2 py-1 text-sm items-center cursor-pointer"
            onClick={() => setSizeSettingOpen(true)}
          >
            <p>{productForm.watch("size") || "Select a size"}</p>
            <ChevronDown className="w-4 text-muted-foreground" />
          </div>
          <FormField
            control={productForm.control}
            name="size"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
          <SizeSettingModal
            isOpen={sizeSettingOpen}
            formControl={productForm.control}
            onClose={() => setSizeSettingOpen(false)}
            onSubmit={() => setSizeSettingOpen(false)}
          />
        </div>

        {/* Category */}
        <div className="px-3 space-y-2 py-2 rounded-xl border">
          <label className="text-sm text-muted-foreground">Category / Subcategory</label>
          {productForm.watch("category") ? (
            <>
              <div className="flex items-center px-3 text-sm gap-3">
                <button type="button" onClick={handleResetCategory}>
                  <XCircle className="text-muted-foreground size-[18px]" />
                </button>
                <p className="text-nowrap">{productForm.watch("category")}</p>
                <p className="text-[22px] text-muted-foreground">→</p>
                <FormField
                  control={productForm.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="border-0 px-0 focus:ring-0">
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesData?.data &&
                              categoriesData.data[productForm.watch("category")]?.subcategories?.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          ) : (
            <FormField
              control={productForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-0 px-0 focus-visible:ring-0 text-sm">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesData?.data &&
                          Object.keys(categoriesData.data).map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Condition */}
        <div className="px-3 py-2 rounded-xl border">
          <FormField
            control={productForm.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Condition</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-0 px-0 focus:ring-0">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="very_good">Very Good</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <div className="col-span-full px-3 py-2 rounded-xl border">
          <FormField
            control={productForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your product..."
                    className="border-0 px-0 focus-visible:ring-0 min-h-[100px]"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Material */}
        <div className="px-3 py-2 rounded-xl border">
          <FormField
            control={productForm.control}
            name="material"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Material</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Cotton, Polyester"
                    className="border-0 px-0 focus-visible:ring-0"
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Color */}
        <div className="px-3 py-2 rounded-xl border">
          <FormField
            control={productForm.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Color</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="e.g., Red, Blue"
                      className="border-0 px-0 focus-visible:ring-0"
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                    {field.value && (
                      <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <label
                          htmlFor="product-color-picker-input"
                          className="px-3 py-1 block w-[120px] rounded-md text-sm font-semibold cursor-pointer text-muted-foreground border"
                          style={{
                            backgroundColor: productForm.watch("colorCode") || "#f9f9f9",
                          }}
                        >
                          {!productForm.watch("colorCode") ? "Pick color" : ""}
                          <input
                            id="product-color-picker-input"
                            type="color"
                            className="w-0 h-0 invisible"
                            onChange={(e) => {
                              productForm.setValue("colorCode", e.target.value)
                            }}
                            value={productForm.watch("colorCode") || "#ffffff"}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Seller ID */}
        <div className="px-3 py-2 rounded-xl border">
          <FormField
            control={productForm.control}
            name="sellerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Seller ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter seller ID"
                    className="border-0 px-0 focus-visible:ring-0"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status */}
        <div className="px-3 py-2 rounded-xl border">
          <FormField
            control={productForm.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-0 px-0 focus:ring-0">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="auction_ended">Auction Ended</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Is Featured */}
        <div className="col-span-full">
          <FormField
            control={productForm.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-base text-muted-foreground">Featured Product</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Is Premium */}
        <div className="col-span-full">
          <FormField
            control={productForm.control}
            name="isPremium"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-base text-muted-foreground">Premium Product</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Is Auction */}
        <div className="col-span-full">
          <FormField
            control={productForm.control}
            name="isAuction"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-base text-muted-foreground">Is Auction</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {productForm.watch("isAuction") && (
          <>
            {/* Auction Start Date */}
            <div className="px-3 py-2 rounded-xl border">
              <FormField
                control={productForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">Auction Start Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="border-0 px-0 focus-visible:ring-0"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Auction End Date */}
            <div className="px-3 py-2 rounded-xl border">
              <FormField
                control={productForm.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">Auction End Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="border-0 px-0 focus-visible:ring-0"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="col-span-full flex flex-col items-center sm:flex-row sm:justify-end gap-4">
          {props.updateMode ? (
            <Button
              type="button"
              className="w-[200px] lg:w-[250px] py-4 text-lg font-bold h-auto px-8"
              onClick={() => triggerSubmit()}
              disabled={props.mutationPending}
            >
              {props.mutationPending ? "Updating..." : "Update Product"}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                className="w-[200px] lg:w-[250px] py-4 text-lg font-bold h-auto px-8"
                onClick={() => triggerSubmit("draft")}
                disabled={props.mutationPending}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                className="w-[200px] lg:w-[250px] py-4 text-lg font-bold h-auto px-8"
                onClick={() => triggerSubmit("publish")}
                disabled={props.mutationPending}
              >
                {props.mutationPending ? "Publishing..." : "Publish Product"}
              </Button>
            </>
          )}
          <button ref={submitProductForm} type="submit" className="invisible" disabled={props.mutationPending} />
        </div>
      </form>
    </Form>
  )
}
