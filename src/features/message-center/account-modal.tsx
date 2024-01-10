import { t } from '@lingui/macro'
import classNames from 'classnames'
import Icon from '@/components/icon'
import { Modal, Button } from '@nbit/arco'
import { useUserStore } from '@/store/user'
import { useState, useEffect } from 'react'
import styles from './index.module.css'

export default function CloseModal() {
  const { userInfo } = useUserStore()

  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    userInfo?.rejectReason ? setVisible(true) : setVisible(false)
  }, [userInfo?.rejectReason])

  return (
    <div>
      <Modal
        focusLock
        closable={false}
        autoFocus={false}
        visible={visible}
        footer={
          <Button type="primary" onClick={() => setVisible(false)}>
            {t`features_trade_spot_index_2510`}
          </Button>
        }
        className={classNames(styles['message-modal-wrapper'], 'arco-modal')}
      >
        <div className="modal-wrapper-content">
          <div className="content-header">
            <div className="content-header-text">{t`features_message_center_account_modal_owgume2r0n`}</div>
            <Icon name="close" hasTheme className="modal-close-icon" onClick={() => setVisible(false)} />
          </div>
          <Icon name="tips_icon" className="message-modal-icon" />
          <div className="modal-header" dangerouslySetInnerHTML={{ __html: userInfo?.rejectReason }} />
        </div>
      </Modal>
    </div>
  )
}
