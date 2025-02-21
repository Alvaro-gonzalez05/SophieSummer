"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "../cart-context"
import { motion } from "framer-motion"
import { Check, ArrowLeft } from "lucide-react"
import styles from "./checkout.module.css"

export default function Checkout() {
  const { cart, clearCart } = useCart()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    try {
      const response = await fetch("/api/send-order-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData, cart, total }),
      })

      if (response.ok) {
        clearCart()
        router.push("/order-confirmation")
      } else {
        throw new Error("Failed to send order email")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("There was an error submitting your order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <main className={styles.main}>
      <BackButton />
      <h1 className={styles.title}>Checkout</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="address" className={styles.label}>
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            required
            value={formData.address}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.orderSummary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <ul className={styles.itemList}>
            {cart.map((item) => (
              <li key={`${item.id}-${item.selectedSize}`} className={styles.item}>
                <span>
                  {item.name} (Size: {item.selectedSize}) x{item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.total}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <motion.button type="submit" className={styles.submitButton} whileTap={{ scale: 0.95 }} disabled={isSubmitting}>
          <motion.div
            initial={false}
            animate={isSubmitting ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.checkIcon}
          >
            <Check className={styles.icon} />
          </motion.div>
          <motion.span
            initial={false}
            animate={isSubmitting ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Place Order
          </motion.span>
        </motion.button>
      </form>
    </main>
  )
}

const BackButton = () => {
  const router = useRouter()

  return (
    <button onClick={() => router.back()} className={styles.backButton} aria-label="Go back to cart">
      <ArrowLeft className={styles.backIcon} />
    </button>
  )
}

