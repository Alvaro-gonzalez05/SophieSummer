import { NextResponse } from "next/server"
import { getProducts, uploadProducts } from "../../../lib/blob-store"

export async function updateStock({ updatedProducts }) {
  console.log("Starting stock update for products:", JSON.stringify(updatedProducts))

  try {
    const products = await getProducts()
    console.log("Current products in store:", JSON.stringify(products))

    let stockUpdated = false

    for (const updatedProduct of updatedProducts) {
      const productIndex = products.findIndex((p) => p.id === updatedProduct.id)

      if (productIndex !== -1) {
        const currentStock = products[productIndex].stock || 0
        const newStock = Math.max(0, currentStock - updatedProduct.quantity)

        console.log(`Updating product ${updatedProduct.id} stock: ${currentStock} -> ${newStock}`)

        products[productIndex].stock = newStock
        stockUpdated = true
      } else {
        console.warn(`Product with ID ${updatedProduct.id} not found in database`)
      }
    }

    if (stockUpdated) {
      await uploadProducts(products)
      console.log("Stock updated successfully in Vercel Blob Store")
    } else {
      console.log("No stock updates were needed")
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating stock:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const { updatedProducts } = await request.json()
    console.log("Received request to update stock for products:", JSON.stringify(updatedProducts))

    const result = await updateStock({ updatedProducts })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in stock update API route:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update stock", details: error.message },
      { status: 500 },
    )
  }
}

