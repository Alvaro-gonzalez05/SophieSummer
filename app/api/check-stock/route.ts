import { NextResponse } from "next/server"
import { getProducts } from "../../../lib/blob-store"

export async function POST(request: Request) {
  try {
    console.log("POST /api/check-stock - Checking stock availability")
    const { cart } = await request.json()
    console.log("Cart items to check:", JSON.stringify(cart))

    const products = await getProducts()
    console.log(`Retrieved ${products.length} products from Blob Store`)

    const outOfStockItems = []

    for (const cartItem of cart) {
      const product = products.find((p) => p.id === cartItem.id)

      if (!product) {
        console.warn(`Product with ID ${cartItem.id} not found in database`)
        outOfStockItems.push({ id: cartItem.id, name: cartItem.name, reason: "not_found" })
        continue
      }

      const currentStock = product.stock || 0

      if (currentStock < cartItem.quantity) {
        console.warn(
          `Not enough stock for product ${cartItem.id}: requested ${cartItem.quantity}, available ${currentStock}`,
        )
        outOfStockItems.push({
          id: cartItem.id,
          name: cartItem.name,
          reason: "insufficient_stock",
          requested: cartItem.quantity,
          available: currentStock,
        })
      }
    }

    if (outOfStockItems.length > 0) {
      console.log("Stock check failed. Out of stock items:", JSON.stringify(outOfStockItems))
      return NextResponse.json(
        {
          inStock: false,
          error: `Not enough stock for ${outOfStockItems.map((item) => item.name).join(", ")}`,
          outOfStockItems,
        },
        { status: 400 },
      )
    }

    console.log("Stock check passed. All items are available.")
    return NextResponse.json({ inStock: true })
  } catch (error) {
    console.error("Error checking stock:", error)
    return NextResponse.json({ error: "Failed to check stock", details: error.message }, { status: 500 })
  }
}

