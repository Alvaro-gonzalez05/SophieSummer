"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import styles from "./carousel.module.css"
import Banner1 from "./assets/Banner1.jpg"
import Banner2 from "./assets/Banner2.jpg"

const images = [
  { src: Banner1, alt: "Summer Collection" },
  { src: Banner2, alt: "New Arrivals" },
  { src: "/placeholder.svg?height=500&width=1920", alt: "Sale Items" },
]

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <div className={styles.carousel}>
      <AnimatePresence initial={false} custom={currentIndex}>
        <motion.div
          key={currentIndex}
          custom={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.imageWrapper}
        >
          <Image
            src={images[currentIndex].src || "/placeholder.svg"}
            alt={images[currentIndex].alt}
            layout="fill"
            objectFit="cover"
            priority
          />
        </motion.div>
      </AnimatePresence>
      <button
        onClick={prevSlide}
        className={`${styles.carouselButton} ${styles.prevButton}`}
        aria-label="Previous slide"
      >
        <ChevronLeft className={styles.buttonIcon} />
      </button>
      <button onClick={nextSlide} className={`${styles.carouselButton} ${styles.nextButton}`} aria-label="Next slide">
        <ChevronRight className={styles.buttonIcon} />
      </button>
    </div>
  )
}

export default Carousel

