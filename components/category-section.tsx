import ProductCardWrapper from "./product-card-wrapper"
import styles from "./category-section.module.css"

const CategorySection = ({ title, products }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <ProductCardWrapper key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default CategorySection

