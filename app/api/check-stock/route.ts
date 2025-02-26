import { NextResponse } from "next/server"
import { getProducts } from "../../../lib/blob-store"

export async function POST(request: Request) {
  try {
    const { cart } = await request.json()
    const products = await getProducts()

    for (const cartItem of cart) {
      const product = products.find((p) => p.id === cartItem.id)
      if (!product || product.stock < cartItem.quantity) {
        return NextResponse.json({ inStock: false, error: `Not enough stock for ${cartItem.name}` }, { status: 400 })
      }
    }

    return NextResponse.json({ inStock: true })
  } catch (error) {
    console.error("Error checking stock:", error)
    return NextResponse.json({ error: "Failed to check stock" }, { status: 500 })
  }
}

