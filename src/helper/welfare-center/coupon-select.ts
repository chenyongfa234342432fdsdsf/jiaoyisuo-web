import { TradeMarketAmountTypesEnum } from '@/constants/trade'
import { DiscountRule, OverlayVipStatus } from '@/constants/welfare-center'
import { CouponTypeEnum } from '@/constants/welfare-center/coupon-select'
import { baseWelfareCenterStore } from '@/store/welfare-center'
import { IVipCoupon, VipCouponListResp } from '@/typings/api/welfare-center/coupons-select'
import { decimalUtils } from '@nbit/utils'

const SafeCalcUtil = decimalUtils.SafeCalcUtil

/** 优惠券类型相关信息 */
export interface ICouponTypeList {
  /** 卡券类型 */
  couponType: CouponTypeEnum
  /** 预估手续费/保证金/预计亏损  */
  amount: string | number
  /** 手续费 */
  fee?: string | number
  /** 币种符号 */
  coinSymbol?: string
}

/** 优惠券类型相关信息 */
export interface ICouponFormatData {
  availableList: IVipCoupon[]
  unavailableList: IVipCoupon[]
  selectList: IVipCoupon[]
}

/**
 * 获取卡券类型入参信息 - 用于匹配最优、可用、不可用卡券
 * @param param0
 * @returns
 */
export const getCouponTypeList = ({ amount, loss, margin, symbol, fee }) => {
  let couponTypeList: ICouponTypeList[] = [] as ICouponTypeList[]

  if (Number(amount) > 0) {
    couponTypeList = [...couponTypeList, { couponType: CouponTypeEnum.fee, amount, fee, coinSymbol: symbol }]
  }

  if (Number(loss) < 0) {
    couponTypeList = [
      ...couponTypeList,
      { couponType: CouponTypeEnum.insurance, amount: Math.abs(loss), coinSymbol: symbol },
    ]
  }

  if (Number(margin) > 0) {
    couponTypeList = [...couponTypeList, { couponType: CouponTypeEnum.voucher, amount: margin, coinSymbol: symbol }]
  }
  return couponTypeList
}

/**
 * 校验优惠券是否可用
 * @param item
 * @param types
 * @returns
 */
const checkIsAvailable = (item: IVipCoupon, types: ICouponTypeList) => {
  return (
    item?.couponType === types?.couponType &&
    (item?.useRuleStatus !== OverlayVipStatus.enable ||
      (item?.useRuleStatus === OverlayVipStatus.enable && Number(item?.useThreshold) <= Number(types?.amount))) &&
    (item?.coinStatus !== OverlayVipStatus.enable ||
      (item?.coinStatus === OverlayVipStatus.enable && types?.coinSymbol && item?.coinSymbol === types?.coinSymbol))
  )
}

/**
 * 查询最优优惠券，可用和不可用
 * @param data 优惠券列表
 * @param couponTypeList 优惠券类型相关信息
 * @returns
 */
export function getBestCoupon(data: VipCouponListResp, couponTypeList: ICouponTypeList[]) {
  let defaultResult = { availableList: [], unavailableList: [], selectList: [] }

  if (!data || !couponTypeList?.length) return defaultResult

  /** 只筛选需要的卡券类型，且按照过期时间升序，即将过期排前面 */
  // const couponList = data?.coupons?.sort((a, b) => a.invalidByTime - b.invalidByTime)
  const couponList = data?.coupons

  /** 手续费 */
  // const feeTypeData = couponTypeList?.find(item => item.couponType === CouponTypeEnum.fee)

  // 手续费需要扣除 VIP 折扣
  // if (feeTypeData?.couponType === CouponTypeEnum.fee && data.isVipUser) {
  //   feeTypeData.amount = SafeCalcUtil.mul(feeTypeData.amount, data?.vipFeeRate || 1).toString()
  // }

  const categorizedData = couponList?.reduce((result: ICouponFormatData, item) => {
    const couponTypeData = couponTypeList?.find(cType => cType.couponType === item.couponType)

    if (!couponTypeData) {
      return result
    }

    const isAvailable = checkIsAvailable(item, couponTypeData)

    if (isAvailable) {
      result.availableList.push(item)

      // 非手续费时直接选中第一张，记面额最大的
      if (item.couponType !== CouponTypeEnum.fee && !result?.selectList?.find(v => v.couponType === item.couponType)) {
        result.selectList.push(item)
      }

      // 手续费时对比折扣券和抵扣券，选取最优
      if (item.couponType === CouponTypeEnum.fee) {
        const selectFeeCoupon = result?.selectList?.find(v => v.couponType === CouponTypeEnum.fee)
        // 计算抵扣金额
        const directFee =
          item.useDiscountRule === DiscountRule.direct
            ? item.couponValue
            : SafeCalcUtil.mul(couponTypeData.fee, SafeCalcUtil.div(item.useDiscountRuleRate, 100))

        // 第一次匹配到最优手续费券
        if (!selectFeeCoupon) {
          result.selectList.push({ ...item, directFee: Number(directFee) })
        } else {
          // 再次匹配最优优惠券
          if (Number(selectFeeCoupon?.directFee) < Number(directFee)) {
            const newSelectData = result.selectList?.filter(x => x.couponType !== CouponTypeEnum.fee)
            result.selectList = newSelectData
            result.selectList.push({ ...item, directFee: Number(directFee) })
          }
        }
      }
    } else {
      result.unavailableList.push(item)
    }

    return result
  }, defaultResult)

  return categorizedData
}

/**
 * 计算合约预估手续费
 * @param price 价格
 * @param amount 数量
 * @param feeRate 手续费率
 * 开仓：预估手续费 = 对手价 * 委托数量 * Taker 费率
 * 限价平仓：预估手续费 = 委托价格 * 减仓数量 * Taker 费率
 * 市价平仓：预估手续费 = 最新价格 * 减仓数量 * Taker 费率
 */
export function calculatorFeeAmount({ price, amount, feeRate }) {
  if (!price || !amount || !feeRate) return ''
  return `${SafeCalcUtil.mul(SafeCalcUtil.mul(price, amount), feeRate)}`
}

/**
 * 计算下单数量，转化对应币种数量
 * @param amountType 数量类型 TradeMarketAmountTypesEnum 交易额/数量
 * @param orderPrice 下单价格
 * @param orderAmount 下单数量
 * 现货手续费统一用 USDT，计价币数量 = 标的币数量 * 委托价格
 * 合约手续费统一用 USD，计价币数量 = 标的币数量 * 委托价格
 */
export function calculatorOrderAmount({ amountType = TradeMarketAmountTypesEnum.amount, orderAmount, orderPrice }) {
  if (!amountType || !orderAmount) return ''
  if (amountType === TradeMarketAmountTypesEnum.funds) {
    return `${orderAmount}`
  }
  return `${SafeCalcUtil.mul(orderPrice, orderAmount)}`
}

/** 通知刷新卡券选择列表接口 */
export function sendRefreshCouponSelectApiNotify() {
  const { isRefreshCouponSelectApi, updateIsRefreshCouponSelectApi } = baseWelfareCenterStore.getState()
  !isRefreshCouponSelectApi && updateIsRefreshCouponSelectApi(true)
}
