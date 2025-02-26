import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { uploadProducts } from "../../../lib/blob-store"

export async function POST() {
  try {
    const filePath = path.join(process.cwd(), "public", "products.json")
    const fileContents = await fs.readFile(filePath, "utf8")
    const products = JSON.parse(fileContents)

    await uploadProducts(products)

    return NextResponse.json({ success: true, message: "Initial products uploaded to Vercel Blob Store" })
  } catch (error) {
    console.error("Error uploading initial products:", error)
    return NextResponse.json({ error: "Failed to upload initial products" }, { status: 500 })
  }
}

