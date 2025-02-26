import { NextResponse } from "next/server"
import { getProducts, productsExist, uploadProducts } from "../../../lib/blob-store"
import fs from "fs/promises"
import path from "path"

async function loadInitialProducts() {
  const filePath = path.join(process.cwd(), "public", "products.json")
  const fileContents = await fs.readFile(filePath, "utf8")
  const products = JSON.parse(fileContents)
  await uploadProducts(products)
  return products
}

export async function GET() {
  try {
    let products

    if (!(await productsExist())) {
      console.log("Products don't exist in Blob Store. Loading initial products...")
      products = await loadInitialProducts()
    } else {
      products = await getProducts()
    }

    // Ensure that the stock information is included in the response
    products = products.map((product) => ({
      ...product,
      stock: product.stock || 0, // Ensure stock is always a number
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

