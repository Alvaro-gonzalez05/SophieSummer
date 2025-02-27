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
      <div className="hero-text">
        <Slide direction="left"><h1>¡Bienvenida a Sophie Summer!</h1></Slide>
        <Slide direction="left"><p>
          Sumérgete en el verano con nuestra colección de bikinis y ropa interior que te hará sentir increíble. Descubre
          lo último en moda veraniega.
        </p></Slide>
        <Slide direction="left"><button onClick={scrollToProducts} className="hero-button">
          Ver Productos →
        </button></Slide>
      </div>
      <div className="hero-image">
      <Slide direction="right"><Image src={heroImage || "/placeholder.svg"} className="imagen" alt="Banner" /></Slide>
      </div>
    </div>
  )
}

export default HeroSection

