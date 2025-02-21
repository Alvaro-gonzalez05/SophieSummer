import { Suspense } from "react"
import Carousel from "../components/carousel"
import CategorySection from "../components/category-section"
import * as path from "path"
import * as fs from "fs/promises"
import styles from "./page.module.css"

async function getProducts() {
  const filePath = path.join(process.cwd(), "public", "products.json")
  const fileContents = await fs.readFile(filePath, "utf8")
  return JSON.parse(fileContents)
}

export default async function Home() {
  const products = await getProducts()

  const categories = ["bikinis", "ropa interior", "conjuntos"]
  const productsByCategory = categories.reduce((acc, category) => {
    acc[category] = products.filter((product) => product.category === category)
    return acc
  }, {})

  return (
    <div>
      <Carousel />
      <main className={styles.main}>
        <Suspense fallback={<div>Loading...</div>}>
          {categories.map((category) => (
            <CategorySection key={category} title={category} products={productsByCategory[category]} />
          ))}
        </Suspense>
      </main>
    </div>
  )
}

