import { Modal, ModalProps } from '@nbit/arco'
import Icon from '@/components/icon'
import { ReactNode } from 'react'
import LazyImage from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'
import styles from './index.module.css'

interface IAssetsPopupTipsProps extends ModalProps {
  visible: boolean
  setVisible: (val: boolean) => void
  slotContent: ReactNode | any
  popupTitle?: ReactNode | any
}
export default function AssetsPopupTips({
  visible,
  setVisible,
  slotContent,
  popupTitle,
  ...props
}: IAssetsPopupTipsProps) {
  const { onOk, onCancel } = { ...props }
  /** 确认操作 */
  const onOkClick = () => {
    visible && setVisible(false)
    onOk && onOk()
  }
  /** 关闭弹框 */
  const onCancelClick = () => {
    visible && setVisible(false)
    onCancel && onCancel()
  }
  return (
    <Modal
      className={styles['asset-popup-tips']}
      visible={visible}
      closeIcon={<Icon name="close" hasTheme />}
      onOk={onOkClick}
      onCancel={onCancelClick}
      {...props}
    >
      <div className="assets-popup-wrap">
        <div className="popup-icon">
          {popupTitle || (
            <LazyImage
              className="w-9 h-9"
              whetherPlaceholdImg={false}
              src={`${oss_svg_image_domain_address}tips_icon.png`}
            />
          )}
        </div>
        <div className="slot-content">{slotContent}</div>
      </div>
    </Modal>
  )
}
