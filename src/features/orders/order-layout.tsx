import { ReactNode } from 'react'
import { OrderMenu } from './order-menu'

export type IOrderLayoutProps = {
  children?: ReactNode
  title: string
  subTitle?: string
}

export function OrderLayout({ children, subTitle, title }: IOrderLayoutProps) {
  return (
    <div className="bg-bg_color flex-1">
      <OrderMenu>{children}</OrderMenu>
    </div>
  )
}
