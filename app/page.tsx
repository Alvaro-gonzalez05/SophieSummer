"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Carousel from "../components/carousel";
import CategorySection from "../components/category-section";
import HeroSection from "../components/HeroSection";
import styles from "./page.module.css";

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-products`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to fetch products")
  }
  return res.json()
}

export default async function Home() {
  const products = await getProducts()

  const categories = ["bikinis", "ropa interior", "conjuntos"]
  const productsByCategory = categories.reduce((acc, category) => {
    acc[category] = products.filter((product) => product.category === category)
    return acc
  }, {})

  const scrollToProducts = () => {
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <HeroSection scrollToProducts={scrollToProducts} />
      <Carousel />
      <main className={styles.main}>
        <div ref={productsRef}>
          <Suspense fallback={<div>Loading...</div>}>
            {categories.map((category) => (
              <CategorySection key={category} title={category} products={productsByCategory[category]} />
            ))}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
