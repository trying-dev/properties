import Link from 'next/link'
import { Home } from 'lucide-react'
import styles from './Footer.module.scss'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div>
            <div className={styles.brand}>
              <div className={styles.logo}>
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className={styles.brandText}>Properties</span>
            </div>
            <p className={styles.description}>Encuentra tu próximo hogar con nosotros</p>
          </div>
          <div>
            <h4 className={styles.sectionTitle}>Explorar</h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/" className={styles.link}>
                  Buscar propiedades
                </Link>
              </li>
              <li>
                <Link href="/" className={styles.link}>
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/" className={styles.link}>
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={styles.sectionTitle}>Legal</h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/" className={styles.link}>
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/" className={styles.link}>
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={styles.sectionTitle}>Contacto</h4>
            <ul className={styles.contactList}>
              <li>Email: info@properties.com</li>
              <li>Tel: +57 300 123 4567</li>
              <li>Lun - Vie: 8AM - 6PM</li>
            </ul>
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.bottomText}>© 2025 Properties. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
