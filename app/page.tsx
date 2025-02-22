"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Carousel from "../components/carousel";
import CategorySection from "../components/category-section";
import HeroSection from "../components/HeroSection";
import styles from "./page.module.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const productsRef = useRef(null);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/products.json");
      const data = await res.json();
      setProducts(data);
    }
    fetchProducts();
  }, []);

  const categories = ["bikinis", "ropa interior", "conjuntos"];
  const productsByCategory = categories.reduce((acc, category) => {
    acc[category] = products.filter((product) => product.category === category);
    return acc;
  }, {});

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
