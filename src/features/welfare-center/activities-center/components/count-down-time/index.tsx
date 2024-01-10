import { memo } from 'react'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { useCountDown } from 'ahooks'
import Icon from '@/components/icon'
import styles from './index.module.css'

interface Props {
  countdownTime: number
  onTimeout?: () => void
  className?: string
}

function CountdownTimer(props: Props) {
  const { countdownTime, onTimeout } = props
  const [countdown, formattedRes] = useCountDown({
    targetDate: countdownTime,
    onEnd: () => {
      onTimeout && onTimeout()
    },
  })

  const { days, hours, minutes, seconds } = formattedRes

  return seconds > 0 ? (
    <div className={classNames(styles.scoped, props.className)}>
      <Icon name="icon_personal_time" />
      <div className="down-time">
        {days > 1
          ? t({
              id: 'features_welfare_center_activities_center_components_count_down_time_index_7fxztgzoxr',
              values: { hours: days, minutes: hours, seconds: minutes },
            })
          : t({
              id: 'features_welfare_center_activities_center_components_count_down_time_index_g9jmexqoiz',
              values: { hours, minutes, seconds },
            })}
      </div>
    </div>
  ) : null
}

export default memo(CountdownTimer)
