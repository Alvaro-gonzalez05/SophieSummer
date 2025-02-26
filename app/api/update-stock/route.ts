import { NextResponse } from "next/server"
import { getProducts, uploadProducts } from "../../../lib/blob-store"

export async function updateStock({ updatedProducts }) {
  const products = await getProducts()

  for (const updatedProduct of updatedProducts) {
    const productIndex = products.findIndex((p) => p.id === updatedProduct.id)
    if (productIndex !== -1) {
      products[productIndex].stock = Math.max(0, products[productIndex].stock - updatedProduct.quantity)
      products[productIndex].inStock = products[productIndex].stock > 0
    }
  }

  await uploadProducts(products)
  console.log("Stock updated in Vercel Blob Store")
}

export async function POST(request: Request) {
  try {
    const { updatedProducts } = await request.json()
    await updateStock({ updatedProducts })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating stock:", error)
    return NextResponse.json({ success: false, error: "Failed to update stock" }, { status: 500 })
  }
}

