import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function updateStock({ updatedProducts }) {
  const filePath = path.join(process.cwd(), "public", "products.json")
  const fileContents = await fs.readFile(filePath, "utf8")
  const products = JSON.parse(fileContents)

  // Update the stock for each product
  updatedProducts.forEach((updatedProduct: any) => {
    const productIndex = products.findIndex((p: any) => p.id === updatedProduct.id)
    if (productIndex !== -1) {
      products[productIndex].stock -= updatedProduct.quantity
    }
  })

  // Write the updated products back to the file
  await fs.writeFile(filePath, JSON.stringify(products, null, 2))
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

