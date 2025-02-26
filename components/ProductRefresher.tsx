"use client"

import { useEffect } from "react"
import { useCart } from "../app/cart-context"

const ProductRefresher = () => {
  const { fetchProducts } = useCart()

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchProducts()
    }, 10000) // Refresh every 60 seconds

    return () => clearInterval(intervalId)
  }, [fetchProducts])

  return null
}

export default ProductRefresher

