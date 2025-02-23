import { CartProvider } from "./cart-context"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import CartModal from "../components/cart-modal"
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main className="main-content">{children}</main>
          <Footer />
          <CartModal />
        </CartProvider>
      </body>
    </html>
  )
}

