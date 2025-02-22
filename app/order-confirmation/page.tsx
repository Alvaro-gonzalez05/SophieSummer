import Link from "next/link"
import { CheckCircle } from "lucide-react"
import styles from "./order-confirmation.module.css"

export default function OrderConfirmation() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.content}>
          <CheckCircle className={styles.icon} />
          <h2 className={styles.title}>Pedido de Orden Enviada!!</h2>
          <p className={styles.message}>Muchas gracias por el pedido. En breve uno de nuestros vendedores se contactara, con usteded ,para terminar de confirmar la orden y abonar la misma.... </p>
          <Link href="/" className={styles.button}>
            Volver a inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

