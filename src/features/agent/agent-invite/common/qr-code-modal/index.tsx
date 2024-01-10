/**
 * 邀请码二维码弹框
 */
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { useLayoutStore } from '@/store/layout'
import { getAgentSlogan } from '@/apis/agent/agent-invite'
import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Modal } from '@nbit/arco'
import { oss_svg_image_domain_address_agent } from '@/constants/oss'
import styles from './index.module.css'

interface IQRCodeModalProps {
  /** 邀请码 */
  inviteCode: string
  inviteLink: string
  visible: boolean
  setVisible: (val: boolean) => void
}
function QRCodeModal(props: IQRCodeModalProps) {
  const { visible, setVisible, inviteCode, inviteLink } = props || {}
  const { headerData } = useLayoutStore()
  const [slogan, setSlogan] = useState('')

  const getShareSlogan = async () => {
    const res = await getAgentSlogan({})
    // TODO mock 数据测试时暂时注释
    // if (!res.isOk) return
    const data = res?.data?.slogan || t`features_agent_index_5101417`
    setSlogan(data)
  }

  useEffect(() => {
    getShareSlogan()
  }, [])

  return (
    <Modal
      style={{
        width: 360,
        borderRadius: 20,
        backgroundImage: `url(${oss_svg_image_domain_address_agent}v3/bg_agent_qr.png)`,
      }}
      className={`${styles['asset-popup-reset']} bg-cover`}
      title={null}
      visible={visible}
      footer={null}
      onCancel={() => {
        setVisible(false)
      }}
      onOk={() => {
        setVisible(false)
      }}
      okText={t`features_trade_spot_index_2510`}
      closeIcon={null}
    >
      <div className={styles.scoped}>
        <div className="title">
          <Icon className="logo-icon" name="web_logo" fontSize={26} />
          {headerData?.businessName}
        </div>
        <div className="content">{slogan}</div>
        <div className="qr-wrap">
          <QRCodeCanvas size={256} value={inviteLink} />
          <div className="button-wrap">
            <span className="label">{t`features_agent_index_5101364`}</span>
            <span className="value">{inviteCode}</span>
          </div>
        </div>
        <div className="apply-success-close-icon">
          <Icon
            name="rebates_close"
            fontSize={32}
            onClick={() => {
              setVisible(false)
            }}
          />
        </div>
      </div>
    </Modal>
  )
}

export default QRCodeModal
