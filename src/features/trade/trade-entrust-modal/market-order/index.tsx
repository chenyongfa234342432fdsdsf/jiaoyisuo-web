import { memo } from 'react'
import { t } from '@lingui/macro'
import LazyImage from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'
import styles from './index.module.css'

type Props = {
  imgName: string
}

function MarketOrder(props: Props) {
  const { imgName } = props

  return (
    <div className={styles.scope}>
      <div className="market-order-tip">
        {t`features_trade_trade_entrust_modal_market_order_index_2478`}，
        {t`features_trade_trade_entrust_modal_market_order_index_2479`}。
      </div>
      <div className="market-order-illustration">
        <div className="market-illustration-title">{t`features_trade_trade_entrust_modal_limit_order_index_2453`}</div>
        <div className="market-illustration-img">
          <div className="market-illustration-merit">
            <div>2400</div>
          </div>
          <div className="illustration-img-detail">
            <LazyImage src={`${oss_svg_image_domain_address}market_k_line_${imgName}.svg`} />
          </div>
        </div>
        <div className="market-illustration-explain">
          <div className="illustration-explain-text">
            A-{t`features_trade_trade_entrust_modal_limit_order_index_2454`}
          </div>
        </div>
      </div>
      <div className="market-order-content">{t`features_trade_trade_entrust_modal_market_order_index_2480`}，</div>
      <div className="market-order-remarks">
        <div className="order-remarks">{t`assets.withdraw.remark`}：</div>
        <div>{t`features_trade_trade_entrust_modal_market_order_index_2486`}</div>
        <div>{t`features_trade_trade_entrust_modal_market_order_index_2490`}</div>
      </div>
    </div>
  )
}

export default memo(MarketOrder)
