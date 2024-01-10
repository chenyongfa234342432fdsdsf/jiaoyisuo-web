import { memo, useState } from 'react'
import { t } from '@lingui/macro'
import LazyImage from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'
import cn from 'classnames'
import Icon from '@/components/icon'
import styles from './index.module.css'
import { HandleMode } from '../tradeentrust'

type Props = {
  imgName: string
}

function PlanDelegation(props: Props) {
  const { imgName } = props

  const [buyHandleMode, setBuyHandleMode] = useState<string>(HandleMode.BUY)

  const setJudgeBuy = () => {
    return buyHandleMode === HandleMode.BUY
  }

  const setJudgeSell = () => {
    return buyHandleMode === HandleMode.SELL
  }

  return (
    <div className={styles.scope}>
      <div className="plandelegation-order-tip">{t`features_trade_trade_entrust_modal_plan_delegation_index_2493`}</div>
      <div className="plandelegation-order-illustration">
        <div className="plandelegation-illustration-title">
          <span>{t`features_trade_trade_entrust_modal_limit_order_index_2453`}</span>
          <div className="plandelegation-illustration-handle">
            <div
              className={cn('illustration-handle-buy', {
                'plandelegation-illustration-handle-buy': setJudgeBuy(),
                'plandelegation-illustration-handle-sell': setJudgeSell(),
              })}
              onClick={() => setBuyHandleMode(HandleMode.BUY)}
            >
              <Icon name={setJudgeBuy() ? 'login_satisfied' : 'login_unsatisfied_black'} />{' '}
              {t`order.constants.direction.buy`}
            </div>
            <div
              className={cn({
                'plandelegation-illustration-handle-buy': setJudgeSell(),
                'plandelegation-illustration-handle-sell': setJudgeBuy(),
              })}
              onClick={() => setBuyHandleMode(HandleMode.SELL)}
            >
              <Icon name={setJudgeSell() ? 'sell_confirm' : 'login_unsatisfied_black'} />{' '}
              {t`order.constants.direction.sell`}
            </div>
          </div>
        </div>
        <div className="plandelegation-illustration-img">
          <div className="plandelegation-illustration-merit">
            {setJudgeSell() && <div className="illustration-merit-sell">2500</div>}
            <div
              className={cn({
                'illustration-merit-middle': setJudgeSell(),
                'illustration-merit-middle-back': !setJudgeSell(),
              })}
            >
              2400
            </div>
            {setJudgeBuy() && <div className="illustration-merit-buy">2300</div>}
          </div>
          <div className="illustration-img-detail">
            <LazyImage src={`${oss_svg_image_domain_address}plan_k_line_${buyHandleMode}_${imgName}.svg`} />
          </div>
        </div>
        <div className="plandelegation-illustration-explain">
          <div className="illustration-explain-not-text">
            A-{t`features_trade_trade_entrust_modal_limit_order_index_2454`}
          </div>
          <div className="illustration-explain-text">B-{t`order.columns.triggerPrice`}</div>
          <div className="illustration-explain-entrust">C-{t`order.columns.entrustPrice`}</div>
        </div>
      </div>
      <div className="plandelegation-order-content">
        {t`features_trade_trade_entrust_modal_plan_delegation_index_2500`}
      </div>
    </div>
  )
}

export default memo(PlanDelegation)
