import { put, list, del } from "@vercel/blob"
import type { PutBlobResult } from "@vercel/blob"

let lastUpdate = 0
let updateQueue: Promise<any> = Promise.resolve()

export async function uploadProducts(products: any[]): Promise<PutBlobResult> {
  // Implementar sistema de cola para evitar conflictos
  return new Promise((resolve, reject) => {
    updateQueue = updateQueue
      .then(async () => {
        const now = Date.now()
        // Asegurar un mínimo de 500ms entre actualizaciones
        if (now - lastUpdate < 500) {
          await new Promise((r) => setTimeout(r, 500))
        }

        try {
          const blob = await put("products.json", JSON.stringify(products), {
            access: "public",
            addRandomSuffix: false, // Importante: mantener el mismo nombre
            override: true, // Sobrescribir archivo existente
          })
          lastUpdate = Date.now()
          resolve(blob)
        } catch (error) {
          console.error("Error uploading products:", error)
          reject(error)
        }
      })
      .catch(reject)
  })
}

export async function getProducts(): Promise<any[]> {
  let retries = 3
  let lastError = null

  while (retries > 0) {
    try {
      const { blobs } = await list()
      const productBlob = blobs.find((blob) => blob.pathname === "products.json")

      if (!productBlob) {
        return []
      }

      // Agregar timestamp para evitar caché
      const url = `${productBlob.url}?t=${Date.now()}`
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const products = await response.json()
      return products
    } catch (error) {
      lastError = error
      retries--
      if (retries > 0) {
        // Esperar antes de reintentar
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
  }

  console.error("Failed to get products after retries:", lastError)
  throw lastError
}

export async function deleteProducts(): Promise<void> {
  await del("products.json")
}

export async function productsExist(): Promise<boolean> {
  try {
    const { blobs } = await list()
    return blobs.some((blob) => blob.pathname === "products.json")
  } catch (error) {
    console.error("Error checking if products exist:", error)
    return false
  }
}

