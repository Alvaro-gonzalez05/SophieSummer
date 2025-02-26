"use client"

import { useCart } from "../app/cart-context"
import ProductCardWrapper from "./product-card-wrapper"
import styles from "./category-section.module.css"
import { useEffect } from "react"

const CategorySection = ({ title, initialProducts }) => {
  const { products, fetchProducts } = useCart()

  // Actualizar productos cuando cambie la categoría
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Filtrar y actualizar productos basados en los últimos datos del contexto
  const updatedProducts = initialProducts.map((initialProduct) => {
    const latestProduct = products.find((p) => p.id === initialProduct.id)
    return latestProduct || initialProduct
  })

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.productGrid}>
        {updatedProducts.map((product) => (
          <ProductCardWrapper
            key={`${product.id}-${product.stock}`} // Importante: Incluir el stock en la key
            product={product}
          />
        ))}
      </div>
    </section>
  )
}

export default CategorySection

