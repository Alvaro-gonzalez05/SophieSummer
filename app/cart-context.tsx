"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [products, setProducts] = useState([])

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

  const fetchProducts = async () => {
    try {
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/get-products?t=${timestamp}`, { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id && item.selectedSize === product.selectedSize)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId, selectedSize) => {
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
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem("cart")
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

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
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

