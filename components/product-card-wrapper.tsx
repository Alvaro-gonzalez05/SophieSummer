"use client"

import { useCart } from "../app/cart-context"
import ProductCard from "./product-card"

const ProductCardWrapper = ({ product }) => {
  const { addToCart } = useCart()

  return <ProductCard product={product} addToCart={addToCart} />
}

export default ProductCardWrapper

