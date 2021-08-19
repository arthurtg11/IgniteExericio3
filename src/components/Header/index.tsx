import styles from './header.module.scss'
import Link from 'next/link';

export default function Header() {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link href='/'>
            <img src="/images/logo.svg" alt="Appmy" />
        </Link>    
      </div>
    </header>
  )
}
