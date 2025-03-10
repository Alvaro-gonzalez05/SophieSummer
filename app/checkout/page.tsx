"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "../cart-context"
import { motion } from "framer-motion"
import { Check, Loader, ArrowLeft } from "lucide-react"
import Script from "next/script"
import styles from "./checkout.module.css"

declare global {
  interface Window {
    MercadoPago: any
  }
}

export default function Checkout() {
  const { cart, clearCart, fetchProducts } = useCart()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [mercadoPagoPreferenceId, setMercadoPagoPreferenceId] = useState(null)
  const [stockError, setStockError] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStockError(null)

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    try {
      // Check stock availability
      const stockCheckResponse = await fetch("/api/check-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart }),
      })

      if (!stockCheckResponse.ok) {
        const errorData = await stockCheckResponse.json()
        throw new Error(errorData.error || "Failed to check stock")
      }

      const stockData = await stockCheckResponse.json()
      if (!stockData.inStock) {
        setStockError("Some items in your cart are no longer available. Please review your cart.")
        setIsSubmitting(false)
        return
      }

      // Send order email
      const emailResponse = await fetch("/api/send-order-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData, cart, total }),
      })

      if (!emailResponse.ok) {
        throw new Error("Failed to send order email")
      }

      // Update stock AFTER email confirmation
      const stockResponse = await fetch("/api/update-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updatedProducts: cart }),
      })

      if (!stockResponse.ok) {
        throw new Error("Failed to update stock")
      }

      setIsSuccess(true)
      setTimeout(() => {
        clearCart()
        fetchProducts() // Refresh product data
        router.push("/order-confirmation")
      }, 2000)
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("There was an error submitting your order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMercadoPagoPayment = async () => {
    setIsSubmitting(true)
    setStockError(null)
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    try {
      // Primero verificamos el stock
      const stockCheckResponse = await fetch("/api/check-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart }),
      })

      if (!stockCheckResponse.ok) {
        const errorData = await stockCheckResponse.json()
        throw new Error(errorData.error || "Failed to check stock")
      }

      const stockData = await stockCheckResponse.json()
      if (!stockData.inStock) {
        setStockError("Some items in your cart are no longer available. Please review your cart.")
        setIsSubmitting(false)
        return
      }

      // Enviamos los emails
      console.log("Sending order emails...")
      const emailResponse = await fetch("/api/send-order-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData, cart, total }),
      })

      if (!emailResponse.ok) {
        throw new Error("Failed to send order email")
      }

      // Actualizamos el stock
      console.log("Updating stock...")
      const stockResponse = await fetch("/api/update-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updatedProducts: cart }),
      })

      if (!stockResponse.ok) {
        throw new Error("Failed to update stock")
      }

      // Si todo salió bien, creamos la preferencia de Mercado Pago
      console.log("Creating Mercado Pago preference...")
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData, cart, total }),
      })

      if (!response.ok) {
        throw new Error("Failed to create Mercado Pago preference")
      }

      const { id } = await response.json()
      setMercadoPagoPreferenceId(id)

      // Limpiamos el carrito y actualizamos los productos
      clearCart()
      fetchProducts()
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("There was an error creating the payment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (mercadoPagoPreferenceId) {
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY, {
        locale: "es-AR",
      })

      mp.checkout({
        preference: {
          id: mercadoPagoPreferenceId,
        },
        render: {
          container: ".cho-container",
          label: "Pagar con Mercado Pago",
        },
        autoOpen: true,
      })
    }
  }, [mercadoPagoPreferenceId])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <main className={styles.main}>
      <Script src="https://sdk.mercadopago.com/js/v2" />
      <BackButton />
      <h1 className={styles.title}>Finalizar Compra</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Form fields */}
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Nombre
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
            Direccion
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
            Telefono
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
          <h2 className={styles.summaryTitle}>Detalle de compra: </h2>
          <ul className={styles.itemList}>
            {cart.map((item) => (
              <li key={`${item.id}-${item.selectedSize}`} className={styles.item}>
                <span>
                  {item.name} (Talle: {item.selectedSize}) x{item.quantity}
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
        {stockError && <p className={styles.error}>{stockError}</p>}
        <div className={styles.paymentOptions}>
          <motion.button
            type="submit"
            className={`${styles.submitButton} ${isSuccess ? styles.success : ""}`}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting || isSuccess}
          >
            <motion.div
              initial={false}
              animate={isSubmitting || isSuccess ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.3 }}
              className={styles.iconWrapper}
            >
              {isSuccess ? (
                <Check className={styles.icon} />
              ) : (
                <Loader className={`${styles.icon} ${styles.spinAnimation}`} />
              )}
            </motion.div>
            <motion.span
              initial={false}
              animate={isSubmitting || isSuccess ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isSubmitting ? "Processing..." : isSuccess ? "Order Placed!" : "Cordinar pago con vendedor (10%OFF *TRANSFERENCIA)"}
            </motion.span>
          </motion.button>
          <button
            type="button"
            onClick={handleMercadoPagoPayment}
            className={styles.mercadoPagoButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Pagar Con Mercado Pago"}
          </button>
          <div className="cho-container"></div>
        </div>
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

