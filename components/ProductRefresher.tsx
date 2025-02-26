"use client"

import { useEffect, useCallback } from "react"
import { useCart } from "../app/cart-context"

const ProductRefresher = () => {
  const { fetchProducts } = useCart()

  const refreshProducts = useCallback(async () => {
    try {
      await fetchProducts()
    } catch (error) {
      console.error("Error refreshing products:", error)
    }
  }, [fetchProducts])

  useEffect(() => {
    // Refresh inmediato al montar
    refreshProducts()

    // Configurar intervalo para refrescos periódicos
    const intervalId = setInterval(refreshProducts, 3000) // Cada 3 segundos

    // Refrescar en eventos específicos
    const events = ["visibilitychange", "focus", "pageshow"]
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshProducts()
      }
    }

    events.forEach((event) => {
      window.addEventListener(event, handleVisibilityChange)
    })

    // Cleanup
    return () => {
      clearInterval(intervalId)
      events.forEach((event) => {
        window.removeEventListener(event, handleVisibilityChange)
      })
    }
  }, [refreshProducts])

  return null
}

export default ProductRefresher

