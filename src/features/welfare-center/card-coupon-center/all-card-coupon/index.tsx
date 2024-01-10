import { useEffect, useRef, useState } from 'react'
import { t } from '@lingui/macro'
import { Radio } from '@nbit/arco'
import { useMount } from 'ahooks'
import classNames from 'classnames'
import { CouponStatus, CardCouponDateTypeEnum, DiscountRule, BusinessScene } from '@/constants/welfare-center'
import { YapiGetV1OpenapiComCodeGetCodeDetailListData } from '@/typings/yapi/OpenapiComCodeGetCodeDetailListV1GetApi.d'
import Icon from '@/components/icon'
import {
  useCardCouponCenterScroll,
  useCouponCenterCode,
  useCouponCenterIconName,
  OpenVisibleInstructionModal,
  useTradeSceneCode,
  getCardCouponLimitText,
  getActivityName,
} from '@/features/welfare-center/welfare-center'
import { useOverscrollBehavior } from '@/hooks/use-overscroll-behavior'
import { getV1CouponListApiRequest, getV1CouponTypeSceneListApiRequest } from '@/apis/welfare-center'
import { link } from '@/helper/link'
import { getBeforeDate, formatDate } from '@/helper/date'
import { YapiGetV1CouponTypesCountData } from '@/typings/yapi/CouponTypesCountV1GetApi'
import { omitBy } from 'lodash'
import { YapiGetV1CouponListData } from '@/typings/yapi/CouponListV1GetApi'
import { YapiGetV1CouponTypeSceneListData } from '@/typings/yapi/CouponTypeSceneListV1GetApi'
import ListEmpty from '@/components/list-empty'
import { guid } from '@/helper/kyc'
import { useUserStore } from '@/store/user'
import { usePageContext } from '@/hooks/use-page-context'
import CardCouponItem from '../card-coupon-item'
import CardCouponIllustrate from '../card-coupon-illustrate'
import CardCouponFilterSelect from '../card-coupon-filter-select'
import { CardCouponFiltersInTable } from '../card-coupon-filter-date'
import CouponsUsingInstructionsModal from '../coupons-using-instructions-modal'
import styles from './index.module.css'

export interface CardCouponParams {
  /**
   * 卡券类型枚举值
   */
  couponCode: number | string
  /**
   * 状态枚举值
   */
  couponStatus: number
  /**
   * 筛选开始日期时间戳
   */
  startDatetime?: number
  /**
   * 筛选结束日期时间戳
   */
  endDatetime?: number
  /**
   * 场景类型 字典值
   */
  couponType?: string
}

type Props = {
  /** 各类券的数量集合 */
  couponTypesNumberObj: Partial<YapiGetV1CouponTypesCountData> | undefined
  /** 获取各类券的数量的请求 */
  getCouponTypesCountApiRequest: () => void
  /** 开启 loading */
  setShowLoadingOpenChange: () => void
  /** 关闭 loading */
  setShowLoadingCloseChange: () => void
}

type CardTypeStatusTab = {
  title: string
  key: number
}

type Pagination = {
  pageNum: number
  pageSize: number
}

type CouponsUsingInstructionsModal = {
  openVisibleInstructionModal: (
    item: YapiGetV1CouponListData,
    cardNameAndSceneListCode: OpenVisibleInstructionModal,
    couponTypeIconUrlNameObj: { [key: string]: object }
  ) => void
}

type CouponTypeParamsRef = {
  couponTypeStatus: number
  couponCode: string
}

function AllCardCoupon(props: Props) {
  const { isLogin } = useUserStore()

  const pageContext = usePageContext()

  const { couponTypesNumberObj, getCouponTypesCountApiRequest, setShowLoadingCloseChange, setShowLoadingOpenChange } =
    props
  /** 获取不同卡券的 icon 名对应的映射自定义 hooks */
  const { couponTypeIconUrlNameObj } = useCouponCenterIconName()
  /** 获取卡片分类，卡劵名称，卡劵类型使用业务场景数据字典 */
  const { cardClassificationListCode, cardNameListCode, cardSceneListCode } = useCouponCenterCode()

  /** 获取交易场景二级场景数据字典 */
  const { businessLineListCode, businessTypeCode } = useTradeSceneCode()

  useOverscrollBehavior()

  const cardTypeCommonDataRef = useRef<YapiGetV1OpenapiComCodeGetCodeDetailListData[]>([
    {
      codeKey: t`features_welfare_center_card_coupon_center_all_card_coupon_index_a_nxerks4o`,
      codeVal: '',
      remark: null,
    },
  ])

  const cardTypeStatusTabRef = useRef<CardTypeStatusTab[]>([
    {
      title: t`features_welfare_center_card_coupon_center_all_card_coupon_index_zru6jucqh8`,
      key: CouponStatus.available,
    },
    {
      title: t`features_welfare_center_card_coupon_center_all_card_coupon_index_rtzcstxnym`,
      key: CouponStatus.usedandexpired,
    },
  ])

  const cardTypeStatusDictionary = useRef<YapiGetV1OpenapiComCodeGetCodeDetailListData[]>([
    {
      codeKey: t`features_welfare_center_card_coupon_center_all_card_coupon_index_otaxfuisjr`,
      codeVal: String(CouponStatus.usedandexpired),
      remark: null,
    },
    {
      codeKey: t`features_welfare_center_card_coupon_center_all_card_coupon_index_p8zvowtew6`,
      codeVal: String(CouponStatus.used),
      remark: null,
    },
    {
      codeKey: t`features_orders_details_modify_stop_limit_5101351`,
      codeVal: String(CouponStatus.expired),
      remark: null,
    },
  ])

  const couponTypeParamsRef = useRef<CouponTypeParamsRef>({
    couponTypeStatus: CouponStatus.usedandexpired,
    couponCode: '',
  })

  const CouponsUsingInstructionsModalRef = useRef<CouponsUsingInstructionsModal>()
  /** 是否允许请求 */
  const [requestHandle, setRequestHandle] = useState<boolean>(true)
  /** 卡券列表 */
  const [cardTypeList, setCardTypeList] = useState<YapiGetV1CouponListData[]>([])
  /** 卡券状态的筛选 */
  const [couponTypeStatus, setCouponTypeStatus] = useState<number>(CouponStatus.available)
  /** 场景关系数据结构 */
  const [couponTypeRelatioShip, setCouponTypeRelatioShip] = useState<YapiGetV1CouponTypeSceneListData[]>([])

  const [isRefresh, setIsRefresh] = useState<boolean>(false)

  const [cardTypeListReturnPageSize, setCardTypeListReturnPageSize] = useState<number>(0)
  /** 卡券类型数据字典 */
  const [cardTypeDataDictionary, setCardTypeDataDictionary] = useState<YapiGetV1OpenapiComCodeGetCodeDetailListData[]>(
    []
  )

  const [cardTypeStatusTab, setCardTypeStatusTab] = useState<CardTypeStatusTab[]>([])
  /** 卡券场景数据字典 */
  const [cardTypeDataSceneDictionary, setCardTypeDataSceneDictionary] = useState<
    YapiGetV1OpenapiComCodeGetCodeDetailListData[]
  >([])
  /** 卡券筛选时间类型 */
  const [dateType, setDateType] = useState<number>(CardCouponDateTypeEnum.week)

  const [cardCouponTimeParams, setCardCouponParamsTime] = useState<Record<'startDatetime' | 'endDatetime', number>>({
    startDatetime: getBeforeDate(CardCouponDateTypeEnum.week) || 0,
    endDatetime: new Date(new Date(new Date().getTime()).setHours(23, 59, 59, 59)).getTime(),
  })

  const [pagination, setPagination] = useState<Pagination>({
    pageNum: 1,
    pageSize: 10,
  })

  const [cardCouponParams, setCardCouponParams] = useState<CardCouponParams>({
    couponCode: '',
    couponType: '',
    couponStatus: CouponStatus.available,
    startDatetime: undefined,
    endDatetime: undefined,
  })

  const getCouponTypesCountRequest = async (whetherBottom?: boolean) => {
    if (isLogin) {
      setShowLoadingOpenChange()
      setRequestHandle(false)
      const requestParams = omitBy(cardCouponParams, value => !value && value !== CouponStatus.usedandexpired)
      const pageNum = whetherBottom ? pagination.pageNum + 1 : pagination.pageNum
      const { isOk, data } = await getV1CouponListApiRequest({
        ...requestParams,
        pageNum: String(pageNum),
        pageSize: String(pagination.pageSize),
      })
      if (isOk && data) {
        setCardTypeList(isRefresh ? [...data] : [...cardTypeList, ...data])
        setPagination({ ...pagination, pageNum })
        setCardTypeListReturnPageSize(data?.length)
      }
      isRefresh && getCouponTypesCountApiRequest()
      setIsRefresh(false)
      setShowLoadingCloseChange()
      setRequestHandle(true)
    }
  }
  /** 触底加载请求自定义 hooks */
  useCardCouponCenterScroll<YapiGetV1CouponListData>({
    list: cardTypeList || [],
    determineWhetherToRequestOrNot: cardTypeListReturnPageSize < pagination.pageSize,
    request: getCouponTypesCountRequest,
    bottomDistance: 100,
    requestHandle,
  })

  const setCouponCodeChange = couponType => {
    couponTypeParamsRef.current.couponCode = ''
    setCardCouponParams({ ...cardCouponParams, couponType, couponCode: '' })
    setPagination({ ...pagination, pageNum: 1 })
    setIsRefresh(true)
  }

  const setBusinessSceneChange = couponCode => {
    couponTypeParamsRef.current.couponCode = couponCode
    setCardCouponParams({ ...cardCouponParams, couponCode })
    setPagination({ ...pagination, pageNum: 1 })
    setIsRefresh(true)
  }

  const getNotAvailableCouponStatus = (couponStatus, statusType?: string) => {
    if (couponStatus === CouponStatus.available) {
      return {
        startDatetime: undefined,
        endDatetime: undefined,
        couponStatus,
        couponCode: '',
      }
    } else {
      return {
        ...cardCouponTimeParams,
        couponStatus: statusType ? couponStatus : Number(couponTypeParamsRef.current?.couponTypeStatus),
        couponCode: statusType ? cardCouponParams.couponCode : couponTypeParamsRef.current.couponCode,
      }
    }
  }

  const setCouponStatusChange = (couponStatus, statusType?: string) => {
    statusType ? setCouponTypeStatus(couponStatus) : (couponTypeParamsRef.current.couponTypeStatus = couponStatus)
    const cardCouponChangeParams = getNotAvailableCouponStatus(couponStatus)
    setCardCouponParams({ ...cardCouponParams, ...cardCouponChangeParams })
    setPagination({ ...pagination, pageNum: 1 })
    setIsRefresh(true)
  }

  const setViewUsage = couponsDetail => {
    CouponsUsingInstructionsModalRef?.current?.openVisibleInstructionModal(
      couponsDetail,
      {
        cardNameListCode,
        cardSceneListCode,
        businessLineListCode,
        businessTypeCode,
      },
      couponTypeIconUrlNameObj
    )
  }

  const getCouponTypesNumberObjItem = codeVal => {
    return couponTypesNumberObj?.couponTypes?.find(itemObj => itemObj?.couponType === codeVal)
  }

  const getCardictionaryNumber = () => {
    const cardTypeDataMapDictionary = cardClassificationListCode?.map(item => {
      const { codeKey, codeVal } = item
      const { validNum, invalidNum } = getCouponTypesNumberObjItem(codeVal) || { validNum: 0, invalidNum: 0 }
      return {
        codeKey: `${codeKey}(${validNum + invalidNum})`,
        codeVal,
        remark: null,
      }
    })

    setCardTypeDataDictionary([...cardTypeCommonDataRef.current, ...cardTypeDataMapDictionary])

    const cardTypeStatusMapTab = cardTypeStatusTabRef?.current?.map(item => {
      const { title, key } = item
      const getCouponTypesNumberObjEnumSelected = {
        [CouponStatus.available]: 'validNum',
        [CouponStatus.usedandexpired]: 'invalidNum',
      }[key]
      const couponTypesNumber =
        cardCouponParams?.couponType === ''
          ? couponTypesNumberObj?.[getCouponTypesNumberObjEnumSelected as string]
          : getCouponTypesNumberObjItem(cardCouponParams?.couponType)?.[getCouponTypesNumberObjEnumSelected as string]

      return {
        title: `${title}(${couponTypesNumber || 0})`,
        key,
      }
    })

    setCardTypeStatusTab(cardTypeStatusMapTab)
  }

  const goToUseCoupons = businessScene => {
    const businessSceneGoToUrlObj = {
      [BusinessScene.perpetual]: '/futures/BTCUSD',
      [BusinessScene.spot]: '/trade/BTCUSDT',
      [BusinessScene.option]: '/ternary-option/BTCUSD',
    }
    link(businessSceneGoToUrlObj[businessScene])
  }

  const setCardTypeDataDictionaryChange = () => {
    if (cardCouponParams?.couponType === '') {
      setCardTypeDataSceneDictionary([...cardTypeCommonDataRef.current, ...cardNameListCode])
    } else {
      const sceneDictionaryList = couponTypeRelatioShip
        ?.find(item => item?.codeVal === cardCouponParams.couponType)
        ?.list?.map(sceneItem => {
          const cardTypeDictionary =
            cardNameListCode?.find(cardType => cardType?.codeVal === sceneItem?.subCodeVal) || {}
          return {
            ...cardTypeDictionary,
          }
        }) as YapiGetV1OpenapiComCodeGetCodeDetailListData[]
      sceneDictionaryList && setCardTypeDataSceneDictionary([...cardTypeCommonDataRef.current, ...sceneDictionaryList])
    }
  }

  const getV1CouponTypeSceneListApiRequestChange = async () => {
    const { isOk, data } = await getV1CouponTypeSceneListApiRequest({})
    if (isOk && data) {
      setCouponTypeRelatioShip(data)
    }
  }

  const goTologin = () => {
    const backUrl = `${pageContext.urlPathname}?type=coupon`
    link(`/login?redirect=${encodeURIComponent(backUrl)}`)
  }

  useMount(() => {
    getV1CouponTypeSceneListApiRequestChange()
  })

  useEffect(() => {
    if (cardClassificationListCode?.length > 0) {
      getCardictionaryNumber()
    }
  }, [couponTypesNumberObj, cardClassificationListCode])

  useEffect(() => {
    setCardTypeDataDictionaryChange()
  }, [cardNameListCode, cardCouponParams.couponType])

  useEffect(() => {
    getCouponTypesCountRequest()
  }, [cardCouponParams])

  return (
    <div className={classNames(styles.scoped)}>
      <CouponsUsingInstructionsModal ref={CouponsUsingInstructionsModalRef} />
      <div className="all-card-coupon-header">
        <Radio.Group value={cardCouponParams.couponType} onChange={setCouponCodeChange} name="button-radio-group">
          {cardTypeDataDictionary.map(item => {
            return (
              <Radio key={item.codeVal} value={item.codeVal}>
                {({ checked }) => {
                  return (
                    <div
                      className={classNames('all-card-coupon-item', {
                        'all-card-coupon-item-checked': checked,
                        'all-card-coupon-item-reddot': getCouponTypesNumberObjItem(item.codeVal)?.hasNew,
                      })}
                    >
                      {item.codeKey}
                    </div>
                  )
                }}
              </Radio>
            )
          })}
        </Radio.Group>
      </div>
      <div className="all-card-coupon-status">
        <div>
          <Radio.Group
            value={couponTypeStatus}
            onChange={e => setCouponStatusChange(e, 'filterSelect')}
            name="button-radio-group"
          >
            {cardTypeStatusTab?.map(item => {
              return (
                <Radio key={item.key} value={item.key}>
                  {({ checked }) => {
                    return (
                      <div
                        className={classNames('all-card-coupon-item', {
                          'all-card-coupon-item-checked': checked,
                        })}
                      >
                        {item.title}
                      </div>
                    )
                  }}
                </Radio>
              )
            })}
          </Radio.Group>
        </div>
        {cardCouponParams.couponStatus === CouponStatus.available ? (
          <CardCouponIllustrate />
        ) : (
          <div className="flex">
            <CardCouponFilterSelect
              typeOptions={cardTypeDataSceneDictionary}
              onChange={e => setBusinessSceneChange(e)}
              value={cardCouponParams.couponCode}
            />
            <CardCouponFilterSelect
              typeOptions={cardTypeStatusDictionary.current}
              value={String(cardCouponParams.couponStatus)}
              onChange={e => setCouponStatusChange(e)}
            />
            <CardCouponFiltersInTable
              inTrade
              params={{
                dateType,
                beginDateNumber: cardCouponParams.startDatetime,
                endDateNumber: cardCouponParams.endDatetime,
              }}
              onChange={v => {
                const { beginDateNumber, endDateNumber } = v
                setDateType(Number(v.dateType))
                if (
                  beginDateNumber === cardCouponParams.startDatetime &&
                  endDateNumber === cardCouponParams.endDatetime
                ) {
                  return
                }
                setCardCouponParamsTime({ startDatetime: Number(beginDateNumber), endDatetime: Number(endDateNumber) })
                setCardCouponParams({
                  ...cardCouponParams,
                  startDatetime: Number(beginDateNumber),
                  endDatetime: Number(endDateNumber),
                })
                setPagination({ ...pagination, pageNum: 1 })
                setIsRefresh(true)
              }}
              filterOptions={[]}
              invisible={false}
            />
          </div>
        )}
      </div>
      <div className="all-card-coupon-container">
        {cardTypeList?.length > 0 ? (
          cardTypeList?.map(item => {
            return (
              <div key={item.id + Number(guid())}>
                <CardCouponItem
                  cardCouponStatus={item?.status}
                  timeText={t({
                    id:
                      item?.status !== CouponStatus.used
                        ? 'features_welfare_center_card_coupon_center_all_card_coupon_index_zmpfvyxggg'
                        : 'features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_snr37ptkzmey',
                    values: {
                      0:
                        item?.status !== CouponStatus.used
                          ? formatDate(item?.invalidByTime)
                          : formatDate(item?.usedByTime as string),
                    },
                  })}
                  IsItAvailable={cardCouponParams?.couponStatus === CouponStatus.available}
                  activityName={getActivityName({ name: item.activityName, type: item.welfareType })}
                  invalidByTime={Number(item?.invalidByTime)}
                  assignByTime={Number(item?.assignByTime)}
                >
                  <div className={styles['card-coupon-item']}>
                    <div
                      className={classNames('card-coupon-item-left', {
                        'card-coupon-item-left-not': item?.status !== CouponStatus.available,
                      })}
                    >
                      <div className="card-coupon-item-icon">
                        <Icon
                          name={couponTypeIconUrlNameObj?.[item?.couponCode]?.[item?.status]}
                          hasTheme={item?.status !== CouponStatus.available}
                        />
                      </div>
                      <div className="card-coupon-item-left-detail">
                        <div className="card-coupon-num">
                          {item?.useDiscountRule === DiscountRule.direct
                            ? `${item?.couponValue} ${item?.coinSymbol}`
                            : t({
                                id: 'features_welfare_center_card_coupon_center_card_redemption_center_index_x3cr0hiz8q',
                                values: { 0: item.useDiscountRuleRate },
                              })}
                        </div>
                        {item?.useThreshold && (
                          <div className="card-coupon-condition">
                            {getCardCouponLimitText(item?.couponCode)}
                            {t`features_welfare_center_card_coupon_center_card_redemption_center_index__a4tsch0po`}
                            {item?.useThreshold}
                            {item?.coinSymbol}
                          </div>
                        )}
                        <div className="card-coupon-money">
                          {
                            cardNameListCode?.find(cardSceneItem => cardSceneItem?.codeVal === item?.couponCode)
                              ?.codeKey
                          }
                          {/* {t`features_welfare_center_card_coupon_center_all_card_coupon_index_uvc1ndmrwx`} */}
                          {/* {OverlayVipStatus.enable === item?.useOverlayVipStatus && (
                          <span>{t`features_welfare_center_card_coupon_center_all_card_coupon_index_dlsnll9d9_`}</span>
                        )} */}
                        </div>
                      </div>
                    </div>
                    {item?.status === CouponStatus.available && (
                      <div className="card-coupon-item-button" onClick={() => goToUseCoupons(item?.businessScene)}>
                        {t`features_welfare_center_card_coupon_center_all_card_coupon_index_vklqrvudn3`}
                      </div>
                    )}
                    {item?.status === CouponStatus.used && (
                      <div className="card-coupon-item-button" onClick={() => setViewUsage(item)}>
                        {t`features_welfare_center_card_coupon_center_all_card_coupon_index_oh1qejjfxz`}
                      </div>
                    )}
                  </div>
                </CardCouponItem>
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

export default AllCardCoupon
