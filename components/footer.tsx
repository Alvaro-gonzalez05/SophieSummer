import Link from "next/link"
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react"
import styles from "./footer.module.css"

const Footer = () => {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contact Us</h3>
            <ul className={styles.contactList}>
              <li>
                <MapPin className={styles.icon} />
                <span>123 Fashion St, Styleville, ST 12345</span>
              </li>
              <li>
                <Phone className={styles.icon} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <Mail className={styles.icon} />
                <span>info@sophiesummer.com</span>
              </li>
            </ul>
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Follow Us</h3>
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
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Twitter className={styles.icon} />
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>&copy; 2023 Sophie Summer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

