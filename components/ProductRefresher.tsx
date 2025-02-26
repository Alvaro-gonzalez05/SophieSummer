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
    // Refresh immediately on mount
    refreshProducts()

    // Set up interval for periodic refreshes
    const intervalId = setInterval(refreshProducts, 5000) // Refresh every 5 seconds

    // Refresh on window focus
    const handleFocus = () => {
      refreshProducts()
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("focus", handleFocus)
    }
  }, [refreshProducts])

  return null
}

export default ProductRefresher

