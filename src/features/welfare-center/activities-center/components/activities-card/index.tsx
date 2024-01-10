import { memo, useMemo } from 'react'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { parseInt } from 'lodash'
import LazyImage from '@/components/lazy-image'
import { formatDate } from '@/helper/date'
import { link } from '@/helper/link'
import { StatusCode } from '@/constants/welfare-center/activities-center'
import { YapiGetV1WelfareActivityAllListData } from '@/typings/yapi/WelfareActivityAllV1GetApi'
import CountdownTimer from '../count-down-time'
import styles from './index.module.css'

interface Props {
  layoutType?: string
  activityData: YapiGetV1WelfareActivityAllListData
  timeOutCallback?: () => void
}

function ActivitiesCard(props: Props) {
  const { layoutType, activityData, timeOutCallback } = props
  const isVertical = layoutType === 'vertical'
  const startTime = Number(activityData.startTime)
  const countdownTime = Number(activityData.expirationTime)

  const handleTimeout = () => {
    timeOutCallback && timeOutCallback()
  }

  const goActivityDetail = () => {
    if (activityData?.activityUrl) {
      const urlArr = activityData.activityUrl.split('/')
      const articleId = urlArr?.[urlArr.length - 1]
      link(`/announcement/article/${articleId}`)
    }
  }

  const renderStatus = useMemo(() => {
    if (isVertical) {
      return {
        [StatusCode.not_started]: null,
        [StatusCode.coming_soon]: (
          <div className="activity-status activity-status-coming">{t`components_chart_not_available_2743`}</div>
        ),
        [StatusCode.processing]: (
          <div className="activity-status activity-status-start">{t`assets.financial-record.search.underway`}</div>
        ),
        [StatusCode.ends]: (
          <div className="activity-status activity-status-end">{t`constants_c2c_history_records_index_ltneyldd9wtw7dpug4yzo`}</div>
        ),
      }[activityData.status]
    }

    if (activityData.status === StatusCode.ends) {
      return (
        <div className="activity-status activity-status-end">{t`constants_c2c_history_records_index_ltneyldd9wtw7dpug4yzo`}</div>
      )
    }

    return (
      !!countdownTime && (
        <div className="my-2">
          <CountdownTimer countdownTime={countdownTime} onTimeout={handleTimeout} />
        </div>
      )
    )
  }, [isVertical, activityData.status])

  return (
    <div className={classNames(styles.scoped, { vertical: isVertical })} onClick={goActivityDetail}>
      <div className="activities-img">
        <LazyImage whetherPlaceholdImg src={activityData.webCoverUrl} className="w-full h-full" />
      </div>
      <div className="activities-content">
        <div className="activities-title">
          <div className="activities-title-text">{activityData.activityName}</div>
          {renderStatus}
        </div>
        <div className="activities-endtime">
          {activityData.status === StatusCode.coming_soon
            ? t({
                id: 'features_welfare_center_activities_center_components_activities_card_index_stime',
                values: { time: formatDate(startTime, 'YYYY-MM-DD HH:mm') },
              })
            : t({
                id: 'features_welfare_center_activities_center_components_activities_card_index_etime',
                values: { time: formatDate(countdownTime, 'YYYY-MM-DD HH:mm') },
              })}
        </div>
      </div>
    </div>
  )
}

export default memo(ActivitiesCard)
