import { memo, useMemo, useState } from 'react'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { get, parseInt } from 'lodash'
import { Button, Modal } from '@nbit/arco'
import Icon from '@/components/icon'
import LazyImage, { Type } from '@/components/lazy-image'
import { useUserStore } from '@/store/user'
import { useWelfareCenterStore } from '@/store/welfare-center'
import { link } from '@/helper/link'
import {
  welfareCenterImgUrl,
  CouponStatus,
  WelfareCenterEnum,
  CardCouponCenterEnum,
  DiscountRule,
} from '@/constants/welfare-center'
import { RecordType, getMissionName, MissionType, IssueStatus, TaskType } from '@/constants/welfare-center/task-center'
import { useTaskPath } from '@/hooks/features/welfare-center/task-path'
import { getCardSceneListCode, useCouponCenterIconName } from '@/features/welfare-center/welfare-center'
import { postV1WelfareMissionJoinApiRequest } from '@/apis/task-center'
import { YapiGetV1WelfareMissionListData } from '@/typings/yapi/WelfareMissionListV1GetApi'
import { YapiGetV1WelfareMissionRecordsListData } from '@/typings/yapi/WelfareMissionRecordsV1GetApi'
import { YapiGetV1OpenapiComCodeGetCodeDetailListData } from '@/typings/yapi/OpenapiComCodeGetCodeDetailListV1GetApi'
import ProgressBar from '../progress-bar'
import CountDownTimer from '../../../activities-center/components/count-down-time'
import styles from './index.module.css'

interface Props {
  recordType?: string
  taskData?: YapiGetV1WelfareMissionListData
  recordData?: YapiGetV1WelfareMissionRecordsListData
  cardNameListCode: YapiGetV1OpenapiComCodeGetCodeDetailListData[]
  timeOutCallback?: () => void
  changePage?: (string) => void
}

function TaskItem(props: Props) {
  const { recordType, taskData, recordData, cardNameListCode, timeOutCallback, changePage } = props
  const { isLogin } = useUserStore()
  const { updateCouponItemType } = {
    ...useWelfareCenterStore(),
  }
  /** 获取不同卡券的 icon 名对应的映射 hooks */
  const { couponTypeIconUrlNameObj } = useCouponCenterIconName()
  const [joinLoading, setJoinLoading] = useState<boolean>(false)

  const data: any = recordType ? recordData : taskData
  const countdownTime = parseInt(data?.expirationTime)
  const conditions = get(data, 'conditions[0]', {})
  const currentValue = isLogin ? conditions?.currentValue || 0 : 0
  const taskPath = useTaskPath()

  const handleTimeout = () => {
    timeOutCallback && timeOutCallback()
  }

  // 跳转对应任务页
  const gotoTaskPage = () => {
    if (conditions?.conditionName === MissionType.mobile_notification_on) {
      Modal.info({
        title: t`trade.c2c.max.reminder`,
        content: t`features_welfare_center_task_center_components_task_item_index_62vjjgncl7`,
      })
      !data?.join && timeOutCallback && timeOutCallback()
    } else {
      link(taskPath[conditions?.conditionName])
    }
  }

  // 去完成
  const goFinish = async () => {
    if (isLogin && !data?.join) {
      setJoinLoading(true)
      const { isOk, data: resData } = await postV1WelfareMissionJoinApiRequest({
        missionId: data.missionId,
      })
      setJoinLoading(false)
      if (isOk && resData) {
        gotoTaskPage()
      }
    } else {
      gotoTaskPage()
    }
  }

  // 查看奖励
  const goCoupon = () => {
    updateCouponItemType(CardCouponCenterEnum.RedemptionCenter)
    changePage && changePage(WelfareCenterEnum.CardVoucherCenter)
  }

  // 渲染任务信息
  const renderTaskInfo = useMemo(() => {
    if (conditions?.conditionName === MissionType.kyc_authorized) {
      return (
        <div className="task-info">{t`features_welfare_center_task_center_components_task_item_index_3brctrgpr9`}</div>
      )
    }

    if (conditions?.targetUnit !== 'times') {
      return (
        <div className="task-progress-wrap">
          <div className="task-progress-bar">
            <ProgressBar current={currentValue} overall={conditions?.targetValue} />
          </div>
          <div className="task-progress-info">
            <span>{currentValue}</span> / {conditions?.targetValue} {conditions?.targetUnit}
          </div>
        </div>
      )
    }

    return null
  }, [conditions, currentValue])

  // 渲染任务参与按钮
  const renderJoinBtn = useMemo(() => {
    if (recordType) {
      const finished = recordType === RecordType.Finished
      const notIssued = data?.issueStatus === IssueStatus.not_issued
      return finished ? (
        <Button disabled={notIssued} shape="round" type="primary" className="task-button" onClick={goCoupon}>
          {notIssued
            ? t`features_welfare_center_task_center_components_task_item_index_5vawxrrnrs`
            : t`features_welfare_center_task_center_components_task_item_index__emhccwfnf`}
        </Button>
      ) : null
    }
    return (
      <Button loading={joinLoading} shape="round" type="primary" className="task-button" onClick={goFinish}>
        {data?.join && data?.missionType === TaskType.Challenge
          ? t`features_welfare_center_task_center_components_task_item_index_zthwes00q8`
          : t`features_welfare_center_task_center_components_task_item_index_ecoiq72nss`}
      </Button>
    )
  }, [data, joinLoading, recordType])

  // 渲染任务状态
  const renderStatus = useMemo(() => {
    if (recordType === RecordType.Finished) {
      return (
        <div className="status-tip-image">
          <span className="status-tip-text status-completed">{t`features_welfare_center_task_center_components_task_item_index_finish`}</span>
          <LazyImage src={`${welfareCenterImgUrl}/taskcenter-completed`} imageType={Type.png} />
        </div>
      )
    }
    if (recordType === RecordType.Unfinished) {
      return (
        <div className="status-tip-image">
          <span className="status-tip-text status-expired">{t`features_welfare_center_task_center_components_task_item_index_expired`}</span>
          <LazyImage src={`${welfareCenterImgUrl}/taskcenter-expired`} imageType={Type.png} />
        </div>
      )
    }

    return (
      !!countdownTime && (
        <CountDownTimer className="task-time" countdownTime={countdownTime} onTimeout={handleTimeout} />
      )
    )
  }, [recordType, countdownTime])

  return (
    <div className={classNames(styles.scoped, { 'task-record-unfinished': recordType === RecordType.Unfinished })}>
      <div className="task-coupon">
        <div className="task-coupon-icon">
          <Icon
            name={couponTypeIconUrlNameObj?.[data?.couponTemplateDetail?.couponCode || '']?.[CouponStatus.available]}
          />
        </div>
        <div>
          <div className="task-coupon-value">
            {data?.couponTemplateDetail?.useDiscountRule === DiscountRule.direct
              ? `${data?.couponTemplateDetail?.couponValue} ${data?.couponTemplateDetail?.coinSymbol}`
              : t({
                  id: 'features_welfare_center_card_coupon_center_card_redemption_center_index_x3cr0hiz8q',
                  values: { 0: data?.couponTemplateDetail?.useDiscountRuleRate },
                })}
            <div className="task-coupon-num">
              {t({
                id: 'features_welfare_center_task_center_components_task_item_index_num',
                values: { num: data?.awardValue },
              })}
            </div>
          </div>
          <div className="task-coupon-name">
            {getCardSceneListCode(cardNameListCode, data?.couponTemplateDetail?.couponCode)}
          </div>
        </div>
      </div>
      <div className="divider" />
      <div className="task-detail">
        <div className="flex-1">
          <div className={classNames('task-name', { 'font-medium': data?.missionType === TaskType.Achievement })}>
            {getMissionName(
              conditions?.conditionName,
              conditions?.compareCondition,
              conditions?.targetValue,
              conditions?.targetUnit
            )}
          </div>
          {renderTaskInfo}
        </div>
        {renderJoinBtn}
      </div>
      {renderStatus}
    </div>
  )
}

export default memo(TaskItem)
