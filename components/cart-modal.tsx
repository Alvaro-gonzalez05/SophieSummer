"use client"

import { useCart } from "../app/cart-context"
import { X, Plus, Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import styles from "./cart-modal.module.css"

const CartModal = () => {
  const { cart, isCartOpen, closeCart, addToCart, removeFromCart } = useCart()
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isCartEmpty = cart.length === 0

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        router.push("/checkout")
        setIsClosing(false)
      }, 300) // This should match the exit animation duration
      return () => clearTimeout(timer)
    }
  }, [isClosing, router])

  const handleCheckout = () => {
    if (!isCartEmpty) {
      setIsClosing(true)
      closeCart()
    }
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.overlay}
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className={styles.modal}
          >
            <div className={styles.content}>
              <div className={styles.header}>
                <h2 className={styles.title}>TU CARRITO</h2>
                <button onClick={closeCart} className={styles.closeButton}>
                  <X className={styles.closeIcon} />
                </button>
              </div>
              {isCartEmpty ? (
                <p className={styles.emptyCartMessage}>Tu carrito esta vacio.</p>
              ) : (
                <ul className={styles.itemList}>
                  {cart.map((item) => (
                    <li key={`${item.id}-${item.selectedSize}`} className={styles.item}>
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        <p className={styles.itemSize}>Size: {item.selectedSize}</p>
                        <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                      </div>
                      <div className={styles.itemActions}>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className={styles.quantityButton}
                        >
                          <Minus className={styles.icon} />
                        </button>
                        <span className={styles.quantity}>{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className={styles.quantityButton}>
                          <Plus className={styles.icon} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className={styles.footer}>
              <p className={styles.total}>Total: ${total.toFixed(2)}</p>
              <button
                onClick={handleCheckout}
                className={`${styles.checkoutButton} ${isCartEmpty ? styles.disabledButton : ""}`}
                disabled={isCartEmpty}
              >
                {isCartEmpty ? "Carrito Vacío......." : "Finalizar orden"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartModal

