import { xxhash64 } from "hash-wasm"

export async function xxHash(input: string) {
  try {
    const encoder = new TextEncoder()
    const encodedData = encoder.encode(input)

    const hashValue = await xxhash64(encodedData)
    return hashValue
  } catch (error) {
    console.error("Hashing error:", error)
    return ""
  }
}
