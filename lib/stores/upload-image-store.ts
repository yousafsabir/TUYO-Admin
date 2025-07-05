import { create } from "zustand"

export interface UploadedImage {
  id: string | number
  url: string
  image: File | null
  filename: string | null
}

interface UploadedImageStore {
  uploadedImages: UploadedImage[]
  setUploadedImages: (images: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[])) => void
}

export const useUploadedImageStore = create<UploadedImageStore>((set) => ({
  uploadedImages: [],
  setUploadedImages: (images) =>
    set((state) => ({
      uploadedImages: typeof images === "function" ? images(state.uploadedImages) : images,
    })),
}))
