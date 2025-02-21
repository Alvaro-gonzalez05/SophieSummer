import Link from "next/link"
import { CheckCircle } from "lucide-react"
import styles from "./order-confirmation.module.css"

export default function OrderConfirmation() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.content}>
          <CheckCircle className={styles.icon} />
          <h2 className={styles.title}>Order Confirmed!</h2>
          <p className={styles.message}>Thank you for your purchase. Your order has been successfully placed.</p>
          <Link href="/" className={styles.button}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

