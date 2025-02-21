import { CartProvider } from "./cart-context"
import Navbar from "../components/navbar"
import CartModal from "../components/cart-modal"
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          {children}
          <CartModal />
        </CartProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
