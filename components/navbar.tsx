"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ShoppingCart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "../app/cart-context"
import { useScrollDirection } from "../hooks/useScrollDirection"
import styles from "./navbar.module.css"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { getTotalItems, openCart } = useCart()
  const scrollDirection = useScrollDirection()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (scrollDirection === "down") {
      setIsVisible(false)
    } else {
      setIsVisible(true)
    }
  }, [scrollDirection])

  const handleContactClick = (e) => {
    e.preventDefault()
    const footer = document.getElementById("contact")
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          className={styles.navbar}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.container}>
            <div className={styles.navContent}>
              <div className={styles.logo}>
                <Link href="/" className={styles.logoLink}>
                  SOPHIE SUMMER
                </Link>
              </div>
              <div className={styles.desktopMenu}>
                <NavLink href="/">Inicio</NavLink>
                <NavLink href="/about">Sobre Nosotros</NavLink>
                <NavLink href="#contact" onClick={handleContactClick}>
                  Contactanos
                </NavLink>
              </div>
              <div className={styles.actions}>
                <button onClick={openCart} className={styles.cartButton}>
                  <ShoppingCart className={styles.cartIcon} />
                  {getTotalItems() > 0 && <span className={styles.cartBadge}>{getTotalItems()}</span>}
                </button>
                <div className={styles.mobileMenuButton}>
                  <button onClick={() => setIsOpen(!isOpen)} className={styles.menuToggle}>
                    
                    {isOpen ? (
                      <X className={styles.menuIcon} aria-hidden="true" />
                    ) : (
                      <Menu className={styles.menuIcon} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={styles.mobileMenu}
              >
                <div className={styles.mobileMenuContent}>
                  <MobileNavLink href="/" onClick={() => setIsOpen(false)}>
                    Inicio
                  </MobileNavLink>
                  <MobileNavLink href="/about" onClick={() => setIsOpen(false)}>
                    Sobre Nosotros
                  </MobileNavLink>
                  <MobileNavLink
                    href="#contact"
                    onClick={(e) => {
                      handleContactClick(e)
                      setIsOpen(false)
                    }}
                  >
                    Contactanos
                  </MobileNavLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

const NavLink = ({ href, children, onClick }) => (
  <Link href={href} className={styles.navLink} onClick={onClick}>
    {children}
  </Link>
)

const MobileNavLink = ({ href, onClick, children }) => (
  <Link href={href} onClick={onClick} className={styles.mobileNavLink}>
    {children}
  </Link>
)

export default Navbar

