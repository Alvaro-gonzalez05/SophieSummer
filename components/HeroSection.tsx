"use client"
import "./HeroSection.css"
import Image from "next/image"
import heroImage from "./assets/logo.png"
import {Slide} from "react-awesome-reveal"

const HeroSection = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section")
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="hero-container">
      <Slide direction="left" cascade><div className="hero-text">
        <h1>¡Bienvenida a Sophie Summer!</h1>
        <p>
          Sumérgete en el verano con nuestra colección de bikinis y ropa interior que te hará sentir increíble. Descubre
          lo último en moda veraniega.
        </p>
        <button onClick={scrollToProducts} className="hero-button">
          Ver Productos →
        </button>
      </div></Slide>
      <Slide direction="right" cascade><div className="hero-image">
        <Image src={heroImage || "/placeholder.svg"} className="imagen" alt="Banner" />
      </div></Slide>
    </div>
  )
}

export default HeroSection

