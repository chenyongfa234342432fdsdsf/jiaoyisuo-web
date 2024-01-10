import { useLayoutStore } from '@/store/layout'
import { t } from '@lingui/macro'
import styles from './index.module.css'

function TradeFuturesGuideContent() {
  const { headerData } = useLayoutStore()
  return (
    <div className={`${styles.scoped}`}>
      <div className="text">
        <label>
          {t({
            id: `features_trade_trade_futures_guide_content_index_tbyqmi09rg`,
            values: { businessName: headerData?.businessName || '' },
          })}
        </label>
      </div>
      <div className="tips">
        <label>{t`features_trade_trade_futures_guide_content_index_tysvd6bez2`}</label>
      </div>
    </div>
  )
}

export default TradeFuturesGuideContent
