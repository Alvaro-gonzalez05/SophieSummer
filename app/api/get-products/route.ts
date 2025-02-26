import { NextResponse } from "next/server"
import { getProducts, productsExist, uploadProducts } from "../../../lib/blob-store"
import fs from "fs/promises"
import path from "path"

async function loadInitialProducts() {
  try {
    const filePath = path.join(process.cwd(), "public", "products.json")
    const fileContents = await fs.readFile(filePath, "utf8")
    const products = JSON.parse(fileContents)

    const productsWithStock = products.map((product) => ({
      ...product,
      stock: typeof product.stock === "number" ? product.stock : 10,
    }))

    await uploadProducts(productsWithStock)
    console.log("Initial products loaded into Blob Store")
    return productsWithStock
  } catch (error) {
    console.error("Error loading initial products:", error)
    throw error
  }
}

export const dynamic = "force-dynamic" // Importante: Esto fuerza a que la ruta sea dinámica
export const revalidate = 0 // Importante: Esto desactiva el caché

export async function GET() {
  try {
    console.log("GET /api/get-products - Fetching products")
    let products

    if (!(await productsExist())) {
      console.log("Products don't exist in Blob Store. Loading initial products...")
      products = await loadInitialProducts()
    } else {
      products = await getProducts()
      console.log(`Retrieved ${products.length} products from Blob Store`)
    }

    // Asegurarse de que el stock sea siempre un número
    products = products.map((product) => ({
      ...product,
      stock: typeof product.stock === "number" ? product.stock : 0,
    }))

    // Agregar headers para evitar el caché
    return new NextResponse(JSON.stringify(products), {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products", details: error.message }, { status: 500 })
  }
}

