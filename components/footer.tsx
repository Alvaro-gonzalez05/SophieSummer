import Link from "next/link"
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react"
import styles from "./footer.module.css"

const Footer = () => {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contactanos</h3>
            <ul className={styles.contactList}>
              <li>
                <MapPin className={styles.icon} />
                <span>Loria Oeste 165, Godoy Cruz, Mendoza</span>
              </li>
              <li>
                <Phone className={styles.icon} />
                <span>+54 (261) 661-7727</span>
              </li>
              <li>
                <Phone className={styles.icon} />
                <span>+54 (261) 697-7056</span>
              </li>
              <li>
                <Mail className={styles.icon} />
                <span>sophie.summer.shop@gmail.com
                </span>
              </li>
            </ul>
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Seguinos</h3>
            <div className={styles.socialLinks}>
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Facebook className={styles.icon} />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Instagram className={styles.icon} />
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>&copy; 2025 Sophie Summer. Todos los derechos reservadoss</p>
          <p>CODEA DESAROLLOS (ALVARO GONZALEZ)</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

