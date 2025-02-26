"use client"

import { useEffect, useCallback, useRef } from "react"
import { useCart } from "../app/cart-context"

const ProductRefresher = () => {
  const { fetchProducts } = useCart()
  const lastFetchTime = useRef(0)
  const isFetching = useRef(false)

  const refreshProducts = useCallback(
    async (force = false) => {
      const now = Date.now()
      // Evitar actualizaciones muy frecuentes (mínimo 1 segundo entre actualizaciones)
      if (!force && (now - lastFetchTime.current < 1000 || isFetching.current)) {
        return
      }

      try {
        isFetching.current = true
        await fetchProducts()
        lastFetchTime.current = now
      } catch (error) {
        console.error("Error refreshing products:", error)
      } finally {
        isFetching.current = false
      }
    },
    [fetchProducts],
  )

  useEffect(() => {
    // Refresh inmediato al montar
    refreshProducts(true)

    // Configurar intervalo para refrescos periódicos
    const intervalId = setInterval(() => refreshProducts(), 2000) // Cada 2 segundos

    // Refrescar en eventos específicos
    const events = ["visibilitychange", "focus", "pageshow"]
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshProducts(true)
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

