"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const lastFetchTime = useRef(0)
  const isFetching = useRef(false)

  const fetchProducts = useCallback(async () => {
    const now = Date.now()
    if (isFetching.current || now - lastFetchTime.current < 1000) {
      return
    }

    try {
      isFetching.current = true
      setIsLoading(true)
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/get-products?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data)
      lastFetchTime.current = now

      // Verificar si hay productos en el carrito que ya no tienen stock
      setCart((prevCart) => {
        const updatedCart = prevCart.filter((cartItem) => {
          const product = data.find((p) => p.id === cartItem.id)
          return product && product.stock >= cartItem.quantity
        })

        if (updatedCart.length !== prevCart.length) {
          alert("Algunos productos en tu carrito ya no están disponibles y han sido removidos.")
        }

        return updatedCart
      })
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
      isFetching.current = false
    }
  }, [])

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add("no-scroll")
    } else {
      document.body.classList.remove("no-scroll")
    }

    return () => {
      document.body.classList.remove("no-scroll")
    }
  }, [isCartOpen])

  const addToCart = useCallback(
    (product) => {
      const currentProduct = products.find((p) => p.id === product.id)
      if (!currentProduct || currentProduct.stock <= 0) {
        alert("Lo sentimos, este producto está agotado")
        return
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.id === product.id && item.selectedSize === product.selectedSize,
        )

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

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalItems,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
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

