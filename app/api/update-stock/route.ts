import { NextResponse } from "next/server"
import { getProducts, uploadProducts } from "../../../lib/blob-store"

export async function updateStock({ updatedProducts }) {
  console.log("Starting stock update for products:", JSON.stringify(updatedProducts))

  try {
    const currentProducts = await getProducts()
    console.log("Current products in store:", JSON.stringify(currentProducts))

    let stockUpdated = false
    const errors = []

    for (const updatedProduct of updatedProducts) {
      const productIndex = currentProducts.findIndex((p) => p.id === updatedProduct.id)

      if (productIndex !== -1) {
        const currentStock = currentProducts[productIndex].stock || 0

        if (currentStock < updatedProduct.quantity) {
          console.warn(
            `Not enough stock for product ${updatedProduct.id}: requested ${updatedProduct.quantity}, available ${currentStock}`,
          )
          errors.push({
            productId: updatedProduct.id,
            name: currentProducts[productIndex].name,
            requested: updatedProduct.quantity,
            available: currentStock,
          })
          continue
        }

        const newStock = Math.max(0, currentStock - updatedProduct.quantity)
        console.log(`Updating product ${updatedProduct.id} stock: ${currentStock} -> ${newStock}`)

        currentProducts[productIndex].stock = newStock
        stockUpdated = true
      } else {
        console.warn(`Product with ID ${updatedProduct.id} not found in database`)
        errors.push({
          productId: updatedProduct.id,
          error: "Product not found",
        })
      }
    }

    if (errors.length > 0) {
      console.error("Stock update errors:", errors)
      throw new Error(
        JSON.stringify({
          message: "Some products could not be updated",
          errors,
        }),
      )
    }

    if (stockUpdated) {
      await uploadProducts(currentProducts)
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

    let errorMessage = "Failed to update stock"
    let errorDetails = error.message
    let status = 500

    try {
      const parsedError = JSON.parse(error.message)
      if (parsedError.message && parsedError.errors) {
        errorMessage = parsedError.message
        errorDetails = parsedError.errors
        status = 400
      }
    } catch (e) {
      // Si no se puede parsear el error, usar el mensaje original
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
      },
      { status },
    )
  }
}

