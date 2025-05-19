import { z } from "zod"

export const adminSchema = (dictionary: any) =>
  z.object({
    name: z.string().min(1, { message: dictionary?.admin?.errors?.nameRequired || "Name is required" }),
    email: z
      .string()
      .min(1, { message: dictionary?.admin?.errors?.emailRequired || "Email is required" })
      .email({ message: dictionary?.admin?.errors?.emailInvalid || "Invalid email address" }),
    password: z
      .string()
      .min(1, { message: dictionary?.admin?.errors?.passwordRequired || "Password is required" })
      .min(6, { message: dictionary?.admin?.errors?.passwordMinLength || "Password must be at least 6 characters" }),
  })

export type AdminFormValues = z.infer<typeof adminSchema>
