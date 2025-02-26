"use client"
import "./HeroSection.css"
import Image from "next/image"
import heroImage from "./assets/logo.png"

const HeroSection = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section")
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="hero-container">
      <div className="hero-text">
        <h1>¡Bienvenida a Sophie Summer!</h1>
        <p>
          Sumérgete en el verano con nuestra colección de bikinis y ropa interior que te hará sentir increíble. Descubre
          lo último en moda veraniega.
        </p>
        <button onClick={scrollToProducts} className="hero-button">
          Ver Productos →
        </button>
      </div>
      <div className="hero-image">
        <Image src={heroImage || "/placeholder.svg"} className="imagen" alt="Banner" />
      </div>
    </div>
  )
}

export default HeroSection

