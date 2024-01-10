/**
 * 我的卡券 - 卡券选择 cell
 */
import LazyImage from '@/components/lazy-image'
import classNames from 'classnames'
import Icon from '@/components/icon'
import { getTextFromStoreEnums } from '@/helper/store'
import { formatDate } from '@/helper/date'
import { t } from '@lingui/macro'
import { useWelfareCenterStore } from '@/store/welfare-center'
import { getActivityName } from '@/features/welfare-center/welfare-center'
import { IVipCoupon } from '@/typings/api/welfare-center/coupons-select'
import { DiscountRule, OverlayVipStatus, welfareCenterImgUrl } from '@/constants/welfare-center'
import { DictionaryTypeMap } from '@/constants/welfare-center/coupon-select'
import styles from './index.module.css'
import CouponUseConditions from '../../coupon-use-conditions'

interface ICouponCellProps {
  /** 卡券信息 */
  data: IVipCoupon
  /** 是否可用卡券 */
  isAvailable?: boolean
  /** 是否可选择 */
  isSelect?: boolean
  /** 选择卡券 */
  onSelect?: (data: any) => void
}

function CouponCell({ data, isSelect, isAvailable = true, onSelect }: ICouponCellProps) {
  const {
    useDiscountRule,
    coinSymbol,
    couponValue,
    useDiscountRuleRate,
    couponCode,
    useRuleStatus,
    useThreshold,
    invalidByTime,
    activityName,
    couponType,
    businessScene,
    welfareType,
  } = data || {}

  const { couponSelectEnums } = {
    ...useWelfareCenterStore(),
  }

  const icon = {
    select: 'login_verify_selected',
    unselect: 'login_verify_unselected',
    disable: 'login_verify_unselected_disabied',
  }

  const getCardBgUrl = () => {
    if (!isAvailable) {
      return `${welfareCenterImgUrl}/unavailable_welfare_coupon.png`
    }
    return `${welfareCenterImgUrl}/available_welfare_coupon.png`
  }

  const getIconName = () => {
    if (isSelect) {
      return icon.select
    } else if (!isAvailable) {
      return icon.disable
    } else {
      return icon.unselect
    }
  }

  return (
    <div
      className={styles['coupon-cell-root']}
      onClick={e => {
        e.stopPropagation()

        if (!isAvailable) return

        onSelect && onSelect(data)
      }}
    >
      <LazyImage src={getCardBgUrl()} hasTheme={!isAvailable} width={12} height={143} />
      <div
        className={classNames('coupon-info-wrap', {
          active: isSelect,
          invalid: !isAvailable,
        })}
      >
        <div className="coupon-info">
          <div
            className={classNames('icon-bg', {
              invalid: !isAvailable,
            })}
          >
            <Icon
              name={`icon_welfare_coupon_${DictionaryTypeMap[couponCode]}${!isAvailable ? '_grey' : '_yellow'}`}
              hasTheme={!isAvailable}
              className="coupon-icon"
            />
          </div>

          <div className="coupon-wrap">
            <div
              className={classNames('coupon-amount', {
                '!text-text_color_04': !isAvailable,
              })}
            >
              {useDiscountRule === DiscountRule.direct
                ? `${couponValue} ${coinSymbol}`
                : `${useDiscountRuleRate}% ${t`features_welfare_center_common_coupon_select_index_bwmfy53m_z`}`}
            </div>
            {useRuleStatus === OverlayVipStatus.enable && (
              <div
                className={classNames('coupon-desc', {
                  '!text-text_color_04': !isAvailable,
                })}
              >
                <CouponUseConditions
                  couponType={couponType}
                  businessScene={businessScene}
                  useThreshold={useThreshold}
                  coinSymbol={coinSymbol}
                />
              </div>
            )}
            <div
              className={classNames('coupon-desc', {
                '!text-text_color_01': isAvailable,
                '!text-text_color_04': !isAvailable,
              })}
            >
              {getTextFromStoreEnums(couponCode, couponSelectEnums?.couponNameCd?.enums)}
            </div>
          </div>

          <Icon name={getIconName()} hasTheme={!isSelect} className="select-icon" />
        </div>
        <div
          className={classNames('coupon-bottom', {
            '!text-text_color_04': !isAvailable,
          })}
        >
          <div>
            {t`features_welfare_center_common_coupon_select_coupon_cell_index_oepntzhlra`}
            {formatDate(invalidByTime, 'YYYY-MM-DD')}
          </div>
          {activityName && (
            <div
              className={classNames('event-name', {
                '!bg-card_bg_color_02': !isAvailable,
              })}
            >
              {getActivityName({ name: activityName, type: welfareType })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { CouponCell }
