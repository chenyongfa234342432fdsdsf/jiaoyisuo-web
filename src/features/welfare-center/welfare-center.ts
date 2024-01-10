import dayjs from 'dayjs'
import { useEffect, RefObject, useRef, useState } from 'react'
import { t } from '@lingui/macro'
import { useMount } from 'ahooks'
import { YapiGetV1OpenapiComCodeGetCodeDetailListData } from '@/typings/yapi/OpenapiComCodeGetCodeDetailListV1GetApi.d'
import { getCodeDetailListBatch } from '@/apis/common'
import { debounce } from 'lodash'
import { CouponStatus, CouponTypeIconUrlName, WelfareType } from '@/constants/welfare-center'
import { MissionType } from '@/constants/welfare-center/task-center'

type CardCouponDealScroll<T> = {
  dom?: RefObject<HTMLElement>
  request: (item) => void
  bottomDistance?: number
  list: T[]
  determineWhetherToRequestOrNot: boolean
  requestHandle: boolean
}

type OpenVisibleInstructionModal = {
  cardNameListCode: YapiGetV1OpenapiComCodeGetCodeDetailListData[]
  cardSceneListCode: YapiGetV1OpenapiComCodeGetCodeDetailListData[]
  businessLineListCode: YapiGetV1OpenapiComCodeGetCodeDetailListData[]
  businessTypeCode: YapiGetV1OpenapiComCodeGetCodeDetailListData[]
}

/** 计算目标时间与当前时间是否小于一天 */
const getDaysDifference = targetTimeStamp => {
  const currentDate = dayjs()
  const targetDate = dayjs(targetTimeStamp)
  const daysDifference = targetDate.diff(currentDate, 'day')
  return daysDifference < 1
}

const useCardCouponCenterScroll = <T>(props: CardCouponDealScroll<T>) => {
  const { dom, request, bottomDistance = 0, list, determineWhetherToRequestOrNot, requestHandle } = props

  const colunList = useRef<T[]>()

  const domCurrent = dom?.current || document.documentElement || document.body

  const detectionBottomChange = debounce(() => {
    if (determineWhetherToRequestOrNot) {
      return
    }

    if (domCurrent && requestHandle) {
      const showHeight = domCurrent?.clientHeight
      const scrollTopHeight = domCurrent?.scrollTop
      const allHeight = domCurrent?.scrollHeight
      if (allHeight - bottomDistance <= showHeight + scrollTopHeight) {
        request(true)
      }
    }
  }, 100)

  useEffect(() => {
    const body = document.querySelector('body')
    colunList.current = list
    body?.addEventListener('scroll', detectionBottomChange)
    return () => {
      body?.removeEventListener('scroll', detectionBottomChange)
    }
  }, [domCurrent, list, determineWhetherToRequestOrNot, requestHandle])
}

/** 获取卡片分类，卡劵名称，卡劵类型使用业务场景数据字典 */
const useCouponCenterCode = () => {
  /** 获取卡片分类 */
  const [cardClassificationListCode, setCardClassificationListCode] = useState<
    YapiGetV1OpenapiComCodeGetCodeDetailListData[]
  >([])
  /** 卡劵名称 */
  const [cardNameListCode, setCardNameListCode] = useState<YapiGetV1OpenapiComCodeGetCodeDetailListData[]>([])
  /** 卡劵类型使用业务场景 */
  const [cardSceneListCode, setCardSceneListCode] = useState<YapiGetV1OpenapiComCodeGetCodeDetailListData[]>([])

  const getCodeDetailListChange = async () => {
    const [cardClassification, cardName, cardScene] = await getCodeDetailListBatch([
      'coupon_type_cd',
      'coupon_name_cd',
      'business_scene',
    ])
    setCardClassificationListCode(cardClassification)
    setCardNameListCode(cardName)
    setCardSceneListCode(cardScene)
  }

  useMount(() => {
    getCodeDetailListChange()
  })

  return { cardClassificationListCode, cardNameListCode, cardSceneListCode }
}

const getCardSceneListCode = (cardSceneList, couponCode) => {
  return cardSceneList?.find(sceneaItem => sceneaItem?.codeVal === couponCode)?.codeKey
}

/** 获取不同卡券的 icon 名对应的映射 */
const useCouponCenterIconName = () => {
  const couponTypeIconUrlNameObj = {
    [CouponTypeIconUrlName.airdropCoinsCoupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_airdrop_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_airdrop_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_airdrop_grey',
    },
    [CouponTypeIconUrlName.spotFeeDeductionCoupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_spot_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_spot_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_spot_grey',
    },
    [CouponTypeIconUrlName.spotFeeDiscountCoupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_spot_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_spot_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_spot_grey',
    },
    [CouponTypeIconUrlName.contractInsuranceCoupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_spot_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_contract_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_contract_grey',
    },
    [CouponTypeIconUrlName.contractFeeDeductionCoupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_spot_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_contract_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_contract_grey',
    },
    [CouponTypeIconUrlName.contractFeeDiscountCoupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_spot_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_contract_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_contract_grey',
    },
    [CouponTypeIconUrlName.voucherCoupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_voucher_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_voucher_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_voucher_grey',
    },
    [CouponTypeIconUrlName.leveragedInterestFreeCoupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_free_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_free_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_free_grey',
    },
    [CouponTypeIconUrlName.vipUpgradeCoupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_vip_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_vip_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_vip_grey',
    },
    [CouponTypeIconUrlName.financialProductCoupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_financial_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_financial_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_financial_grey',
    },
    [CouponTypeIconUrlName.option_voucher_coupon]: {
      [CouponStatus.available]: 'icon_welfare_coupon_options_yellow',
      [CouponStatus.expired]: 'icon_welfare_coupon_options_grey',
      [CouponStatus.used]: 'icon_welfare_coupon_options_grey',
    },
  }
  return { couponTypeIconUrlNameObj }
}

/** 获取交易场景二级场景数据字典 */
const useTradeSceneCode = () => {
  /** 交易场景二级场景 */
  const [businessLineListCode, setbusinessLineListCode] = useState<YapiGetV1OpenapiComCodeGetCodeDetailListData[]>([])
  /** 交易类型 */
  const [businessTypeCode, setbusinessTypeCode] = useState<YapiGetV1OpenapiComCodeGetCodeDetailListData[]>([])

  const getCodeDetailListChange = async () => {
    const [businessLine, businessType] = await getCodeDetailListBatch(['businessLine', 'businessType'])
    setbusinessLineListCode(businessLine)
    setbusinessTypeCode(businessType)
  }

  useMount(() => {
    getCodeDetailListChange()
  })

  return { businessLineListCode, businessTypeCode }
}

/** 获取限制条件前的文字，根据不同的券映射不同 */
const getCardCouponLimitText = cardCouponType => {
  return {
    /** 合约保险金" */
    contract_insurance_coupon: t`features/orders/details/modify-stop-limit-3`,
    /** 现货手续费抵扣券 */
    spot_fee_deduction_coupon: t`constants/trade-4`,
    /** 现货手续费折扣券 */
    spot_fee_discount_coupon: t`constants/trade-4`,
    /** 合约手续费抵扣券 */
    contract_fee_deduction_coupon: t`features_welfare_center_welfare_center_vnblogrie1`,
    /** 合约手续费折扣券 */
    contract_fee_discount_coupon: t`features_welfare_center_welfare_center_vnblogrie1`,
    /** 合约体验金 */
    voucher_coupon: t`features_trade_trade_amount_input_index_d9hiiaadxfjrwqkxvqmv4`,
    /** 三元期权体验金 */
    option_voucher_coupon: t`features_welfare_center_welfare_center_buf9ygx02g`,
  }[cardCouponType]
}

const getActivityName = ({ name, type }) => {
  if (type === WelfareType.mission) {
    return (
      {
        [MissionType.account_security_authorized]: t`features_welfare_center_task_center_components_task_item_index_dcvzwtele4`,
        [MissionType.contract_fee]: t`features_welfare_center_welfare_center_sa8sbwkl63`,
        [MissionType.contract_transfer]: t`constants/trade-0`,
        [MissionType.kyc_authorized]: t`features_welfare_center_task_center_components_task_item_index_z28bewbpoh`,
        [MissionType.mobile_bind]: t`features_welfare_center_task_center_components_task_item_index_ts0qqtbr5t`,
        [MissionType.mobile_notification_on]: t`features_welfare_center_task_center_components_task_item_index_2bkrcwryv3`,
        [MissionType.spot_fee]: t`features_welfare_center_welfare_center_0tj0l_4g3m`,
        [MissionType.spot_goods]: t`trade.type.coin`,
        [MissionType.transfer_c2c]: t`features_c2c_new_common_c2c_new_nav_index_5101353`,
        [MissionType.transfer_input]: t`constants_welfare_center_task_center_kizdivwjkp`,
      }[name] || ''
    )
  }

  return name
}

export {
  getDaysDifference,
  useCardCouponCenterScroll,
  useCouponCenterCode,
  getCardSceneListCode,
  useCouponCenterIconName,
  OpenVisibleInstructionModal,
  useTradeSceneCode,
  getCardCouponLimitText,
  getActivityName,
}
