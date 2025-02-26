import { NextResponse } from "next/server"
import { getProducts, uploadProducts } from "../../../lib/blob-store"

export async function updateStock({ updatedProducts }) {
  const products = await getProducts()

  console.log("Current products:", products)
  console.log("Updated products:", updatedProducts)

  for (const updatedProduct of updatedProducts) {
    const productIndex = products.findIndex((p) => p.id === updatedProduct.id)
    if (productIndex !== -1) {
      const currentStock = products[productIndex].stock
      const newStock = Math.max(0, currentStock - updatedProduct.quantity)
      products[productIndex].stock = newStock

      console.log(
        `Product ${updatedProduct.id}: Current stock: ${currentStock}, Quantity purchased: ${updatedProduct.quantity}, New stock: ${newStock}`,
      )
    } else {
      console.log(`Product ${updatedProduct.id} not found in the database`)
    }
  }

  await uploadProducts(products)
  console.log("Updated products in Vercel Blob Store:", products)

  return products
}

export async function POST(request: Request) {
  try {
    const { updatedProducts } = await request.json()
    console.log("Received update request for products:", updatedProducts)

    const updatedProductList = await updateStock({ updatedProducts })

    return NextResponse.json({ success: true, updatedProducts: updatedProductList })
  } catch (error) {
    console.error("Error updating stock:", error)
    return NextResponse.json({ success: false, error: "Failed to update stock" }, { status: 500 })
  }
}

