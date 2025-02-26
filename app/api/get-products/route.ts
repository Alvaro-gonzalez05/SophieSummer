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

    // Ensure products with no stock are handled correctly
    products = products.map((product) => ({
      ...product,
      inStock: product.stock > 0,
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

