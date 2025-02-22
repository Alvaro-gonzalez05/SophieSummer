"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingCart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "../app/cart-context"
import styles from "./navbar.module.css"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { getTotalItems, openCart } = useCart()

  return (
    <nav className={styles.navbar}>
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
            <NavLink href="/contact">Contactanos</NavLink>
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
                Home
              </MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setIsOpen(false)}>
                About Us
              </MobileNavLink>
              <MobileNavLink href="/contact" onClick={() => setIsOpen(false)}>
                Contact
              </MobileNavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const NavLink = ({ href, children }) => (
  <Link href={href} className={styles.navLink}>
    {children}
  </Link>
)

const MobileNavLink = ({ href, onClick, children }) => (
  <Link href={href} onClick={onClick} className={styles.mobileNavLink}>
    {children}
  </Link>
)

export default Navbar

