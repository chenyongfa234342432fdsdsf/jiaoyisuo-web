import { useState } from 'react'
import classNames from 'classnames'
import TradeSidebarSetting from '@/features/trade/trade-setting/common/sidebar'
import FuturesUserClassification from '@/features/trade/trade-setting/futures/user-classification'
import Icon from '@/components/icon'
import Styles from './index.module.css'

function TradeSetting({ className }: { className: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={classNames(Styles.scoped, className)}>
      <TradeSidebarSetting visible={visible} setVisible={setVisible} />

      <FuturesUserClassification hasCloseIcon isContractPage />

      <div className="trade-setting-wrap" onClick={() => setVisible(!visible)}>
        <Icon name="msg_set_def" hasTheme fontSize={20} hover />
      </div>
    </div>
  )
}

export default TradeSetting
