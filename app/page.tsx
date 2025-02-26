import { Suspense } from "react"
import Carousel from "../components/carousel"
import CategorySection from "../components/category-section"
import HeroSection from "../components/HeroSection"
import styles from "./page.module.css"
import ClientSideScrollHandler from "../components/ClientSideScrollHandler"
import ProductRefresher from "../components/ProductRefresher"

// Función para obtener productos con timestamp para evitar caché
async function getProducts() {
  const timestamp = new Date().getTime()
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-products?t=${timestamp}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      Pragma: "no-cache",
    },
  })

  if (!res.ok) {
    console.error("Failed to fetch products:", res.status, res.statusText)
    throw new Error("Failed to fetch products")
  }

  return res.json()
}

// Marcar la página como dinámica
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const products = await getProducts()
  console.log(
    "Loaded products with stock information:",
    products.map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
  )

  const categories = ["bikinis", "ropa interior", "conjuntos"]
  const productsByCategory = categories.reduce((acc, category) => {
    acc[category] = products.filter((product) => product.category === category)
    return acc
  }, {})

  return (
    <div>
      <ClientSideScrollHandler />
      <HeroSection />
      <Carousel />
      <ProductRefresher />
      <main className={styles.main}>
        <div id="products-section">
          <Suspense fallback={<div>Loading...</div>}>
            {categories.map((category) => (
              <CategorySection
                key={`${category}-${Date.now()}`} // Forzar re-render con timestamp
                title={category}
                initialProducts={productsByCategory[category]}
              />
            ))}
          </Suspense>
        </div>
      </main>
    </div>
  )
}

