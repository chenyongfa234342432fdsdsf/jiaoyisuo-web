import { useState } from 'react'
import { reduce } from 'lodash'
import { t } from '@lingui/macro'
import { Message } from '@nbit/arco'
import classNames from 'classnames'
import { CouponStatus, DiscountRule, ValidityType, CouponErrorCode, WelfareType } from '@/constants/welfare-center'
import { useMount } from 'ahooks'
import { getV1CouponTemplateListApiRequest, postV1CouponTemplateAcquireApiRequest } from '@/apis/welfare-center'
import Icon from '@/components/icon'
import { useOverscrollBehavior } from '@/hooks/use-overscroll-behavior'
import { YapiGetV1CouponTemplateListData } from '@/typings/yapi/CouponTemplateListV1GetApi'
import { formatDate } from '@/helper/date'
import {
  useCardCouponCenterScroll,
  useCouponCenterCode,
  getCardSceneListCode,
  useCouponCenterIconName,
  getCardCouponLimitText,
  getActivityName,
} from '@/features/welfare-center/welfare-center'
import ListEmpty from '@/components/list-empty'
import { useUserStore } from '@/store/user'
import { link } from '@/helper/link'
import { usePageContext } from '@/hooks/use-page-context'
import styles from './index.module.css'
import CardCouponItem from '../card-coupon-item'

type Props = {
  /** 获取各类券的数量的请求 */
  setShowAllCouponTipChange: () => void
  /** 开启 loading */
  setShowLoadingOpenChange: () => void
  /** 关闭 loading */
  setShowLoadingCloseChange: () => void
}

type CardRedemptionParams = {
  pageNum: string
  pageSize: string
}

function CardRedemptionCenter(props: Props) {
  const { isLogin } = useUserStore()

  const pageContext = usePageContext()

  const { setShowAllCouponTipChange, setShowLoadingOpenChange, setShowLoadingCloseChange } = props
  /** 获取卡片分类，卡劵名称，卡劵类型使用业务场景数据字典 hooks */
  const { cardNameListCode } = useCouponCenterCode()
  /** 获取不同卡券的 icon 名对应的映射 hooks */
  const { couponTypeIconUrlNameObj } = useCouponCenterIconName()

  useOverscrollBehavior()
  /** 是否允许请求 */
  const [requestHandle, setRequestHandle] = useState<boolean>(true)

  const [cardRedemptionListReturnPageSize, setCardRedemptionListReturnPageSize] = useState<number>(0)
  /** 兑换中心列表 */
  const [cardRedemptionCentereList, setCardRedemptionCenterList] = useState<YapiGetV1CouponTemplateListData[]>([])

  const [cardRedemptionParams, setRedemptionParams] = useState<CardRedemptionParams>({
    pageNum: '1',
    pageSize: '10',
  })

  const [receiveList, setReceiveList] = useState<string[]>([])

  const getCouponTemplateListApiRequest = async (whetherBottom?: boolean) => {
    if (isLogin) {
      setRequestHandle(false)
      setShowLoadingOpenChange()
      const pageNum = whetherBottom ? Number(cardRedemptionParams.pageNum) + 1 : cardRedemptionParams.pageNum
      const { isOk, data } = await getV1CouponTemplateListApiRequest({
        ...cardRedemptionParams,
        pageNum: String(pageNum),
      })
      if (isOk && data) {
        setCardRedemptionListReturnPageSize(data?.length)
        setCardRedemptionCenterList(data)
        setRedemptionParams({ ...cardRedemptionParams, pageNum: String(pageNum) })
      }
      setShowLoadingCloseChange()
      setRequestHandle(true)
    }
  }

  useCardCouponCenterScroll<YapiGetV1CouponTemplateListData>({
    list: cardRedemptionCentereList || [],
    determineWhetherToRequestOrNot: Number(cardRedemptionListReturnPageSize) < Number(cardRedemptionParams.pageSize),
    request: getCouponTemplateListApiRequest,
    bottomDistance: 200,
    requestHandle,
  })

  const setReceivecCoupon = async (templateId, activityId, issueId, welfareType) => {
    const { isOk, message, code } = await postV1CouponTemplateAcquireApiRequest({
      issueId,
      welfareType,
      id: templateId,
    })
    if (isOk) {
      setShowAllCouponTipChange()
      setReceiveList([...receiveList, issueId])
      Message.success({
        content: t`features_welfare_center_card_coupon_center_card_redemption_center_index_i83py4js0k`,
      })
    } else {
      const couponErrorCodeList = [
        CouponErrorCode.CouponDoesNotExist,
        CouponErrorCode.CouponHasBeenFullyClaimed,
        CouponErrorCode.CouponHasExpired,
      ]
      if (code && couponErrorCodeList.includes(code)) {
        const selectedData = cardRedemptionCentereList.filter(item => item.activityId === activityId)
        selectedData.forEach(item => {
          item.list = item.list.filter(subItem => subItem.id !== templateId)
        })
        setCardRedemptionCenterList(selectedData)
      }
      Message.error({ content: message })
    }
  }

  const getCardCouponTypeTime = couponItem => {
    return couponItem?.validityType === ValidityType.TimePeriod
      ? t({
          id: 'features_welfare_center_card_coupon_center_card_redemption_center_index_1yzhw8sytm',
          values: { 0: formatDate(couponItem?.validDateTo) },
        })
      : t({
          id: 'features_welfare_center_card_coupon_center_card_redemption_center_index_tmj8cdosj5',
          values: { 0: couponItem?.validDay },
        })
  }
  const goTologin = () => {
    const backUrl = `${pageContext.urlPathname}?type=coupon&couponItem=claim`
    link(`/login?redirect=${encodeURIComponent(backUrl)}`)
  }

  useMount(() => {
    getCouponTemplateListApiRequest()
  })

  return (
    <div className={classNames(styles.scoped)}>
      <div className="card-redemption-center-header">
        {cardRedemptionCentereList?.length > 0 ? (
          cardRedemptionCentereList?.map(item => {
            const couponNums = reduce(
              item?.list,
              (sum, n) => {
                return sum + n.couponAcquireLimit
              },
              0
            )
            return (
              <div className="card-redemption-center-item" key={item?.activityId}>
                <div className="text-base font-normal text-text_color_01 mb-6 flex items-center">
                  {getActivityName({ name: item.activityName, type: item.welfareType })}
                  <span className="card-redemption-center-item-label">
                    {t`features_welfare_center_card_coupon_center_card_redemption_center_index_nurmu34bhl`}
                    {couponNums}
                  </span>
                </div>
                <div className="all-card-coupon-container ">
                  {item?.list?.map(couponItem => {
                    return (
                      <div key={couponItem.id}>
                        <CardCouponItem
                          cardCouponStatus={CouponStatus.available}
                          timeText={getCardCouponTypeTime(couponItem)}
                          IsItAvailable={!couponItem?.isMaxReceived}
                          activityName={getActivityName({ name: couponItem.activityName, type: item.welfareType })}
                          invalidByTime={Number(couponItem?.validDateTo)}
                          assignByTime={Number(couponItem?.validDateFrom)}
                        >
                          <div className={styles['card-coupon-item']}>
                            <div
                              className={classNames('card-coupon-item-left', {
                                'card-coupon-item-left-not': couponItem?.isMaxReceived,
                              })}
                            >
                              <div className="card-coupon-item-icon">
                                <Icon
                                  name={couponTypeIconUrlNameObj?.[couponItem?.couponCode]?.[CouponStatus.available]}
                                />
                              </div>
                              <div className="card-coupon-item-left-detail">
                                <div className="card-coupon-num">
                                  {couponItem?.useDiscountRule === DiscountRule.direct
                                    ? `${couponItem?.couponValue} ${couponItem?.coinSymbol}`
                                    : t({
                                        id: 'features_welfare_center_card_coupon_center_card_redemption_center_index_x3cr0hiz8q',
                                        values: { 0: couponItem.useDiscountRuleRate },
                                      })}
                                  {couponItem?.couponAcquireLimit > 1 && (
                                    <div className="card-coupon-acquire">
                                      {t({
                                        id: 'features_welfare_center_task_center_components_task_item_index_num',
                                        values: { num: couponItem?.couponAcquireLimit },
                                      })}
                                    </div>
                                  )}
                                </div>
                                {couponItem?.useThreshold && (
                                  <div className="card-coupon-condition">
                                    {getCardCouponLimitText(couponItem?.couponCode)}
                                    {t`features_welfare_center_card_coupon_center_card_redemption_center_index__a4tsch0po`}
                                    {couponItem?.useThreshold} {couponItem?.coinSymbol}
                                  </div>
                                )}
                                <div className="card-coupon-money">
                                  {getCardSceneListCode(cardNameListCode, couponItem?.couponCode)}
                                </div>
                              </div>
                            </div>
                            {couponItem?.isMaxReceived || receiveList.includes(couponItem?.issueId) ? (
                              <div className="card-coupon-item-button card-coupon-item-button-inavailble">{t`features_welfare_center_card_coupon_center_card_redemption_center_index_bqmxter0wg`}</div>
                            ) : (
                              <div
                                className="card-coupon-item-button"
                                onClick={() =>
                                  setReceivecCoupon(
                                    couponItem?.id,
                                    item?.activityId,
                                    couponItem?.issueId,
                                    item?.welfareType
                                  )
                                }
                              >{t`features_welfare_center_card_coupon_center_card_redemption_center_index_rbmvoizird`}</div>
                            )}
                          </div>
                        </CardCouponItem>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-10 flex justify-center w-full">
            <ListEmpty
              text={
                !isLogin && (
                  <div
                    className="px-3 py-1 text-sm rounded text-text_color_01 bg-brand_color inline-block"
                    onClick={goTologin}
                  >{t`user.field.reuse_07`}</div>
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default CardRedemptionCenter
