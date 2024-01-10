/**
 * 卡券反选组件
 */
import Icon from '@/components/icon'
import { t } from '@lingui/macro'
import { IncreaseTag } from '@nbit/react'
import classNames from 'classnames'
import { memo, useState } from 'react'
import { Carousel } from '@nbit/arco'
import { useUpdateEffect } from 'ahooks'
import { useWelfareCenterStore } from '@/store/welfare-center'
import { ICouponTypeList, getBestCoupon, getCouponTypeList } from '@/helper/welfare-center/coupon-select'
import { BusinessSceneEnum, CouponTypeEnum } from '@/constants/welfare-center/coupon-select'
import { IVipCoupon } from '@/typings/api/welfare-center/coupons-select'
import { getTextFromStoreEnums } from '@/helper/store'
import { DiscountRule } from '@/constants/welfare-center'
import styles from './index.module.css'
import { CouponModal } from './coupon-modal'

export interface ICouponResult {
  /** 已选择卡券列表 */
  coupons: IVipCoupon[] | any
  /** 体验金 */
  voucherAmount?: number
  /** 是否手工选择 true:手工选择 false:自动匹配 */
  isManual?: boolean
}

interface ICouponSelectProps {
  className?: string
  /** 使用场景（BusinessSceneEnum:合约/现货/三元期权），默认合约 */
  businessScene?: BusinessSceneEnum
  /** 是否需要格式化选中卡券列表数据，默认 true */
  isFormat?: boolean
  /** 下单金额（现货、合约场景下必传，用于匹配手续费） */
  amount?: string | number
  /** 预估手续费（现货、合约场景下必传） */
  fee?: string | number
  /** 预计亏损 (合约场景下平仓且预估收益为负数时必传) */
  loss?: string | number
  /** 仓位保证金（合约开仓必传） */
  margin?: string | number
  /** 币种 symbol */
  symbol?: string
  /** 是否需要自动匹配最优券 (兼容市价下单情况下手工选择卡券后不需要自动匹配卡券场景) */
  isMatch?: boolean
  /** 选择卡券
   * @param coupons 已选择卡券列表
   * @param voucherAmount 体验金
   * @param isManual 是否手工选择 true:手工选择 false:自动匹配
   *  */
  onChange: (e: ICouponResult) => void
}

function CouponSelect(props: ICouponSelectProps) {
  const { className, isFormat = true, isMatch = true, amount, loss, margin, fee, symbol, onChange } = props || {}
  const { couponSelectList: couponData, couponSelectEnums } = {
    ...useWelfareCenterStore(),
  }
  // 是否展示我的卡券选择弹窗
  const [couponVisible, setCouponVisible] = useState(false)
  const [couponFormatData, setCouponFormatData] = useState({
    availableList: [] as IVipCoupon[],
    unavailableList: [] as IVipCoupon[],
    selectList: [] as IVipCoupon[],
  })
  // 是否展示券选择入口
  const [isShowCouponSelect, setIsShowCouponSelect] = useState(false)

  /**
   * 转换卡券数据
   */
  const onFormatCoupons = (couponList: IVipCoupon[] | any) => {
    return isFormat
      ? couponList?.map((coupon: IVipCoupon) => {
          return {
            couponId: coupon?.id,
            couponCode: coupon?.couponCode,
            couponType: coupon?.couponType,
          }
        })
      : couponList
  }

  /**
   * 选择卡券
   */
  const onChangeCoupons = (data: IVipCoupon[], isManual = false) => {
    const voucherAmount = data?.find(item => item?.couponType === CouponTypeEnum.voucher)?.couponValue || 0
    onChange({
      coupons: onFormatCoupons(data),
      voucherAmount,
      isManual,
    })
  }

  useUpdateEffect(() => {
    if (!isMatch) return
    const couponTypeList: ICouponTypeList[] = getCouponTypeList({ symbol, amount, loss, margin, fee })
    const newCouponFormatData = getBestCoupon(couponData, couponTypeList)
    setCouponFormatData(newCouponFormatData)
    onChangeCoupons(newCouponFormatData?.selectList)
    // console.log('amount', amount, 'categorizedData', newCouponFormatData, 'loss', loss)
  }, [couponData, loss, amount, margin, symbol, fee])

  useUpdateEffect(() => {
    setIsShowCouponSelect(couponFormatData?.availableList?.length > 0)
  }, [couponFormatData?.availableList])

  if (!isShowCouponSelect) return null

  const renderCouponCell = (selectInfo: IVipCoupon, index) => {
    return (
      <div key={selectInfo?.id || index} className="coupon-select-cell" onClick={() => setCouponVisible(true)}>
        <div className="coupon-info">
          <span>{getTextFromStoreEnums(selectInfo?.couponCode, couponSelectEnums?.couponNameCd?.enums)}</span>
          {selectInfo?.useDiscountRule === DiscountRule.direct ? (
            <IncreaseTag value={`-${selectInfo?.couponValue}`} right={` ${selectInfo?.coinSymbol}`} />
          ) : (
            <div className="text-warning_color">
              {`${selectInfo?.useDiscountRuleRate}%`} {t`features_welfare_center_common_coupon_select_index_bwmfy53m_z`}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderCouponSelect = () => {
    const selectList = couponFormatData?.selectList || []

    if (selectList.length === 0) {
      return (
        <div className="coupon-select-cell" onClick={() => setCouponVisible(true)}>
          <div className="coupon-info">{t`features_welfare_center_compontents_coupon_select_index_fvl_wtsgix`}</div>
          <div className="flex items-center">
            <span className="unselect-text">{t`features_welfare_center_compontents_coupon_select_index_ny9myxbbdf`}</span>
          </div>
        </div>
      )
    }

    if (selectList.length === 1) {
      return renderCouponCell(selectList[0], 0)
    }

    return (
      <Carousel direction={'vertical'} showArrow="never" indicatorType="never" autoPlay animation={'slide'}>
        {selectList.map((selectInfo, index) => renderCouponCell(selectInfo, index))}
      </Carousel>
    )
  }

  return (
    <>
      <div className={classNames(styles['coupon-select-root'], className)}>
        {renderCouponSelect()}
        <Icon name="icon_coupon_choose" hasTheme className="select-icon" />
      </div>
      {couponVisible && (
        <CouponModal
          {...couponFormatData}
          visible={couponVisible}
          onClose={() => setCouponVisible(false)}
          onChange={e => {
            setCouponFormatData({ ...couponFormatData, selectList: e })
            onChangeCoupons(e, true)
          }}
        />
      )}
    </>
  )
}

export default memo(CouponSelect)
