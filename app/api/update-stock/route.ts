import { NextResponse } from "next/server"
import { getProducts, uploadProducts } from "../../../lib/blob-store"

// Implementar sistema de bloqueo simple
let isUpdating = false
const updateQueue: any[] = []

export async function updateStock({ updatedProducts }) {
  if (isUpdating) {
    // Si hay una actualización en proceso, agregar a la cola
    return new Promise((resolve, reject) => {
      updateQueue.push({ updatedProducts, resolve, reject })
    })
  }

  isUpdating = true
  console.log("Starting stock update for products:", JSON.stringify(updatedProducts))

  try {
    // Obtener productos actuales
    const currentProducts = await getProducts()
    console.log("Current products in store:", JSON.stringify(currentProducts))

    let stockUpdated = false
    const errors = []

    // Actualizar el stock para cada producto
    for (const updatedProduct of updatedProducts) {
      const productIndex = currentProducts.findIndex((p) => p.id === updatedProduct.id)

      if (productIndex !== -1) {
        const currentStock = currentProducts[productIndex].stock || 0

        // Verificar que haya suficiente stock
        if (currentStock < updatedProduct.quantity) {
          errors.push({
            productId: updatedProduct.id,
            name: currentProducts[productIndex].name,
            requested: updatedProduct.quantity,
            available: currentStock,
          })
          continue
        }

        // Actualizar el stock
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

    // Si hay errores, lanzar una excepción
    if (errors.length > 0) {
      throw new Error(
        JSON.stringify({
          message: "Some products could not be updated",
          errors,
        }),
      )
    }

    // Guardar los cambios solo si se actualizó algún stock
    if (stockUpdated) {
      await uploadProducts(currentProducts)
      console.log("Stock updated successfully in Vercel Blob Store")
    }

    const result = { success: true }

    // Procesar la cola de actualizaciones
    while (updateQueue.length > 0) {
      const nextUpdate = updateQueue.shift()
      try {
        await updateStock(nextUpdate.updatedProducts)
        nextUpdate.resolve({ success: true })
      } catch (error) {
        nextUpdate.reject(error)
      }
    }

    return result
  } catch (error) {
    console.error("Error updating stock:", error)
    throw error
  } finally {
    isUpdating = false
  }
}

export async function POST(request: Request) {
  try {
    const { updatedProducts } = await request.json()
    console.log("Received request to update stock for products:", JSON.stringify(updatedProducts))

    const result = await updateStock({ updatedProducts })

    // Forzar revalidación de la caché
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: "/" }),
    })

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

