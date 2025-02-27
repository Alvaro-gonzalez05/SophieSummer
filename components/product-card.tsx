"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertCircle, AlertTriangle } from "lucide-react"
import styles from "./product-card.module.css"
import { Fade } from "react-awesome-reveal"

const ProductCard = ({ product, addToCart }) => {
  const [selectedSize, setSelectedSize] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [stockStatus, setStockStatus] = useState({
    isOutOfStock: false,
    isLowStock: false,
  })

  useEffect(() => {
    // Actualizar el estado del stock cuando cambia el producto
    setStockStatus({
      isOutOfStock: product.stock <= 0,
      isLowStock: product.stock > 0 && product.stock <= 3,
    })
  }, [product.stock])

  const handleAddToCart = () => {
    if (selectedSize && !stockStatus.isOutOfStock) {
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
    <Fade cascade><motion.div
      key={`${product.id}-${product.stock}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.card}
    >
      <div className={styles.imageContainer}>
        {stockStatus.isOutOfStock && (
          <div className={styles.outOfStock}>
            <span>Sin stock</span>
          </div>
        )}
        {stockStatus.isLowStock && !stockStatus.isOutOfStock && (
          <div className={`${styles.outOfStock} ${styles.lowStock}`}>
            <span>¡Últimas unidades!</span>
          </div>
        )}
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={300}
          className={`${styles.image} ${stockStatus.isOutOfStock ? styles.imageOutOfStock : ""}`}
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
              disabled={stockStatus.isOutOfStock}
            >
              {size}
            </button>
          ))}
        </div>
        <motion.button
          onClick={handleAddToCart}
          className={`${styles.addButton} ${stockStatus.isOutOfStock ? styles.disabledButton : ""}`}
          whileTap={{ scale: stockStatus.isOutOfStock ? 1 : 0.95 }}
          disabled={stockStatus.isOutOfStock}
        >
          <AnimatePresence>
            {isAdding ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={styles.checkIcon}
              >
                <Check className={styles.icon} />
              </motion.div>
            ) : (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {stockStatus.isOutOfStock ? "Agotado" : "Añadir al Carrito"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div></Fade>
  )
}

export default ProductCard

