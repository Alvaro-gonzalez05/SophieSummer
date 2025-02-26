"use client"

import { useCart } from "../app/cart-context"
import ProductCardWrapper from "./product-card-wrapper"
import styles from "./category-section.module.css"

const CategorySection = ({ title, initialProducts }) => {
  const { products } = useCart()

  // Filter and update products based on the latest data from the context
  const updatedProducts = initialProducts.map((initialProduct) => {
    const latestProduct = products.find((p) => p.id === initialProduct.id)
    return latestProduct || initialProduct
  })

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.productGrid}>
        {updatedProducts.map((product) => (
          <ProductCardWrapper key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default CategorySection

