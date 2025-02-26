"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load cart from localStorage when the component mounts
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    // Initial fetch of products
    fetchProducts()
  }, [])

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    // Toggle body scroll when cart is opened/closed
    if (isCartOpen) {
      document.body.classList.add("no-scroll")
    } else {
      document.body.classList.remove("no-scroll")
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove("no-scroll")
    }
  }, [isCartOpen])

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/get-products?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addToCart = useCallback(
    (product) => {
      // Verificar el stock antes de agregar al carrito
      const currentProduct = products.find((p) => p.id === product.id)
      if (!currentProduct || currentProduct.stock <= 0) {
        alert("Lo sentimos, este producto está agotado")
        return
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.id === product.id && item.selectedSize === product.selectedSize,
        )

        // Verificar que la cantidad total no exceda el stock disponible
        const currentQuantity = existingItem ? existingItem.quantity : 0
        if (currentQuantity + 1 > currentProduct.stock) {
          alert("No hay suficiente stock disponible")
          return prevCart
        }

        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product.id && item.selectedSize === product.selectedSize
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        }
        return [...prevCart, { ...product, quantity: 1 }]
      })
    },
    [products],
  )

  const removeFromCart = useCallback((productId, selectedSize) => {
    setCart((prevCart) =>
      prevCart.reduce((acc, item) => {
        if (item.id === productId && item.selectedSize === selectedSize) {
          if (item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 })
          }
        } else {
          acc.push(item)
        }
        return acc
      }, []),
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    localStorage.removeItem("cart")
  }, [])

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalItems,
        isCartOpen,
        openCart,
        closeCart,
        products,
        fetchProducts,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

