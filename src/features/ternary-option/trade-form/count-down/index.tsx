import { useCountDown } from 'ahooks'

import { memo } from 'react'
import classNames from 'classnames'
import { t } from '@lingui/macro'
import Styles from './index.module.css'

interface CountDownProps {
  restSecond: number
  setRestSecond: (v) => void
}

function CountDown(props: CountDownProps) {
  const { restSecond, setRestSecond } = props
  const [countdown] = useCountDown({
    leftTime: restSecond * 1000,
    onEnd: () => {
      setRestSecond(0)
    },
  })

  return (
    <span className={Styles.scoped}>
      <span className="time">
        {t({
          id: 'features_ternary_option_trade_form_count_down_index_gzkmn2xqgz',
          values: { 0: Math.round(countdown / 1000) },
        })}
      </span>
    </span>
  )
}

export default memo(CountDown)
