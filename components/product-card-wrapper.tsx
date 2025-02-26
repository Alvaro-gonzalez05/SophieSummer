"use client"

import { useCart } from "../app/cart-context"
import ProductCard from "./product-card"

const ProductCardWrapper = ({ product: initialProduct }) => {
  const { products, addToCart } = useCart()

  // Find the latest product data from the context
  const product = products.find((p) => p.id === initialProduct.id) || initialProduct

  return <ProductCard product={product} addToCart={addToCart} />
}

export default ProductCardWrapper

