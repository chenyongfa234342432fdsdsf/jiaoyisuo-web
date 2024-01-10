import { useCountDown } from 'ahooks'

import { memo } from 'react'
import classNames from 'classnames'
import { t } from '@lingui/macro'
import { TernaryOptionTradeDirectionEnum } from '@/constants/ternary-option'
import Styles from './index.module.css'

interface CountDownProps {
  type: string
  restSecond: number
  setRestSecond: (v) => void
}

function QuickTradeCountDown(props: CountDownProps) {
  const { restSecond, setRestSecond, type } = props
  const [countdown] = useCountDown({
    leftTime: restSecond * 1000,
    onEnd: () => {
      setRestSecond(0)
    },
  })

  return (
    <div
      className={classNames(Styles.scoped, {
        'bg-buy_up_color_disable': type === TernaryOptionTradeDirectionEnum.call,
        'bg-sell_down_color_disable': type === TernaryOptionTradeDirectionEnum.put,
      })}
    >
      <span className="time">
        {Math.round(countdown / 1000)}
        {t`features_ternary_option_trade_form_index_0yieh6myhw1`}
      </span>
    </div>
  )
}

export default memo(QuickTradeCountDown)
