"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Check, AlertCircle } from "lucide-react"
import styles from "./product-card.module.css"

const ProductCard = ({ product, addToCart }) => {
  const [selectedSize, setSelectedSize] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const isOutOfStock = product.stock <= 0

  const handleAddToCart = () => {
    if (selectedSize && !isOutOfStock) {
      setIsAdding(true)
      addToCart({ ...product, selectedSize })
      setTimeout(() => {
        setIsAdding(false)
      }, 1000)
    } else if (!selectedSize) {
      alert("Por favor, selecciona una talla")
    } else {
      alert("Lo sentimos, este producto está agotado")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.card}
    >
      <div className={styles.imageContainer}>
        {isOutOfStock && (
          <div className={styles.outOfStock}>
            <AlertCircle size={16} className={styles.outOfStockIcon} />
            <span>Sin stock</span>
          </div>
        )}
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={300}
          className={`${styles.image} ${isOutOfStock ? styles.imageOutOfStock : ""}`}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <div className={styles.sizes}>
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`${styles.sizeButton} ${selectedSize === size ? styles.selectedSize : ""}`}
              disabled={isOutOfStock}
            >
              {size}
            </button>
          ))}
        </div>
        <motion.button
          onClick={handleAddToCart}
          className={`${styles.addButton} ${isOutOfStock ? styles.disabledButton : ""}`}
          whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
          disabled={isOutOfStock}
        >
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
            {isOutOfStock ? "Agotado" : "Añadir al Carrito"}
          </motion.span>
        </motion.button>
        <p className={`${styles.stockInfo} ${isOutOfStock ? styles.outOfStockText : styles.inStockText}`}>
          {isOutOfStock ? "Sin stock disponible" : `Stock disponible: ${product.stock}`}
        </p>
      </div>
    </motion.div>
  )
}

export default ProductCard

