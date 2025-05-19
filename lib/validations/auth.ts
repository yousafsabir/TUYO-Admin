import { z } from "zod"

export const loginSchema = (dictionary: any) =>
  z.object({
    email: z
      .string()
      .min(1, { message: dictionary.login.errors.emailRequired })
      .email({ message: dictionary.login.errors.emailInvalid }),
    password: z
      .string()
      .min(1, { message: dictionary.login.errors.passwordRequired })
      .min(6, { message: dictionary.login.errors.passwordMinLength }),
  })

export type LoginFormValues = z.infer<typeof loginSchema>
