"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import styles from "./product-card.module.css"

const ProductCard = ({ product, addToCart }) => {
  const [selectedSize, setSelectedSize] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    if (selectedSize) {
      setIsAdding(true)
      addToCart({ ...product, selectedSize })
      setTimeout(() => {
        setIsAdding(false)
      }, 1000)
    } else {
      alert("Please select a size")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.card}
    >
      <Image
        src={product.image || "/placeholder.svg"}
        alt={product.name}
        width={300}
        height={300}
        className={styles.image}
      />
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <div className={styles.sizes}>
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`${styles.sizeButton} ${selectedSize === size ? styles.selectedSize : ""}`}
            >
              {size}
            </button>
          ))}
        </div>
        <motion.button onClick={handleAddToCart} className={styles.addButton} whileTap={{ scale: 0.95 }}>
          <motion.div
            initial={false}
            animate={isAdding ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.checkIcon}
          >
            <Check className={styles.icon} />
          </motion.div>
          <motion.span
            initial={false}
            animate={isAdding ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Add to Cart
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ProductCard

