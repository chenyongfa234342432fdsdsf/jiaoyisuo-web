/**
 * 合约 - 开通合约账户
 */
import { useState } from 'react'
import { t } from '@lingui/macro'
import { Button } from '@nbit/arco'
import Icon from '@/components/icon'
import { useCheckFutures } from '@/hooks/features/trade'
import OpenFuturesPopup from '@/features/assets/futures/index/open-futures/open-futures-popup'
import FuturesVideoTutorial from '@/features/trade/trade-setting/futures/video-tutorial'
import { UserContractVersionEnum } from '@/constants/user'
import styles from './index.module.css'

interface OpenFuturesLayoutProps {
  onSubmitFn?(): void
}
function OpenFuturesLayout(props: OpenFuturesLayoutProps) {
  const { onSubmitFn } = props || {}
  const [futuresCurrencyVisible, setFuturesCurrencyVisible] = useState<boolean>(false)
  const [videoTutorialVisible, setVideoTutorialVisible] = useState<boolean>(false)
  const { openCheckFuturesModal, openFuturesQuestionsModal } = useCheckFutures({
    isOk: () => setFuturesCurrencyVisible(true),
  })

  function onOpenSuccess() {
    onSubmitFn && onSubmitFn()
  }

  return (
    <div className={styles['open-futures-root']}>
      <div className="open-futures-wrap">
        <Icon className="open-icon" name="assets_opening" hasTheme />
        <span className="open-title">{t`features_assets_futures_index_open_futures_index_5101473`}</span>
        <span className="open-text">{t`features_assets_futures_index_open_futures_index_5101474`}</span>

        <Button
          type="primary"
          className="open-btn"
          onClick={() => openCheckFuturesModal(() => setVideoTutorialVisible(true))}
        >
          {t`hooks_features_trade_5101433`}
        </Button>
        <OpenFuturesPopup
          visible={futuresCurrencyVisible}
          setVisible={setFuturesCurrencyVisible}
          onSuccess={onOpenSuccess}
        />
        <FuturesVideoTutorial
          visible={videoTutorialVisible}
          setVisible={setVideoTutorialVisible}
          isOpenContract
          version={UserContractVersionEnum.base}
          onSuccess={openFuturesQuestionsModal}
        />
      </div>
    </div>
  )
}

export { OpenFuturesLayout }
