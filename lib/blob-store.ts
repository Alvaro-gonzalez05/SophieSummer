import { put, list, del } from "@vercel/blob"
import type { PutBlobResult } from "@vercel/blob"

export async function uploadProducts(products: any[]): Promise<PutBlobResult> {
  const blob = await put("products.json", JSON.stringify(products), {
    access: "public",
  })
  return blob
}

export async function getProducts(): Promise<any[]> {
  const { blobs } = await list()
  const productBlob = blobs.find((blob) => blob.pathname === "products.json")

  if (!productBlob) {
    return []
  }

  const response = await fetch(productBlob.url)
  const products = await response.json()
  return products
}

export async function deleteProducts(): Promise<void> {
  await del("products.json")
}

export async function productsExist(): Promise<boolean> {
  const { blobs } = await list()
  return blobs.some((blob) => blob.pathname === "products.json")
}

