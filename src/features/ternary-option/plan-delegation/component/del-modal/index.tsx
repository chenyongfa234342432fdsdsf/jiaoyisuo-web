import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { Modal } from '@nbit/arco'
import LazyImage, { Type } from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'
import styles from './index.module.css'

type ProfitLossModalProps = {
  visible: boolean
  type?: string
  loading?: boolean
  setVisible: (visible: boolean) => void
  onChange?: () => void
}

export default function ProfitLossModal(props: ProfitLossModalProps) {
  const { loading, visible, setVisible, onChange } = props

  return (
    <Modal
      focusLock
      visible={visible}
      autoFocus={false}
      confirmLoading={loading}
      className={styles['del-modal']}
      onOk={() => onChange && onChange()}
      onCancel={() => setVisible(false)}
    >
      <div className="del-modal-content">
        <Icon hasTheme name="close" className="del-modal-icon" onClick={() => setVisible(false)} />
        <LazyImage src={`${oss_svg_image_domain_address}tis`} imageType={Type.svg} className="del-modal-tis-icon" />
        <div className="del-modal-text">{t`features_ternary_option_plan_delegation_component_del_modal_index_00tovoovpb`}</div>
      </div>
    </Modal>
  )
}
