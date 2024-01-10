import { CSSProperties, ReactNode } from 'react'
import { Modal } from '@nbit/arco'

type ModalType = {
  style?: CSSProperties
  className?: string | string[]
  visible: boolean
  children: ReactNode
  wrapStyle?: CSSProperties
  maskStyle?: CSSProperties
}

function CustomModal({ style, className, visible, children, wrapStyle, maskStyle }: ModalType) {
  return (
    <Modal
      wrapStyle={wrapStyle}
      maskStyle={maskStyle}
      className={className}
      style={style}
      visible={visible}
      title={null}
      footer={null}
      closeIcon={null}
    >
      {children}
    </Modal>
  )
}

export default CustomModal
