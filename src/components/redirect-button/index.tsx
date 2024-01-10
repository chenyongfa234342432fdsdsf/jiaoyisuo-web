import { IconRight } from '@nbit/arco/icon'
import { ReactNode } from 'react'
import styles from './index.module.css'

interface RedirectButtonProps {
  children: ReactNode
  className?: string
}

function RedirectButton(props: RedirectButtonProps) {
  const { children, className } = props
  return (
    <span className={`${`${styles.scoped} ${className}`} redirect-btn`}>
      {children}
      <IconRight />
    </span>
  )
}

export default RedirectButton
