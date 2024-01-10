import { ReactNode } from 'react'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { welfareCenterImgUrl, CouponStatus } from '@/constants/welfare-center'
import { getDaysDifference } from '@/features/welfare-center/welfare-center'
import LazyImage, { Type } from '@/components/lazy-image'
import styles from './index.module.css'

type Props = {
  /** 券是否可用 */
  IsItAvailable: boolean
  /** 活动名称 */
  activityName?: string
  /** 时间 */
  timeText: string
  /** 卡券的状态 */
  cardCouponStatus: number
  /** 过期时间 */
  invalidByTime?: number
  /** 领取时间 */
  assignByTime?: number
  children: ReactNode
}

function CardCouponItem(props: Props) {
  const { IsItAvailable, children, activityName, timeText, cardCouponStatus, invalidByTime, assignByTime } = props

  const getStatusLableDetail = () => {
    // 如果券可用
    if (cardCouponStatus === CouponStatus.available) {
      // 判断领取时间是否小于一天
      if (assignByTime && getDaysDifference(assignByTime)) {
        return {
          style:
            'absolute text-brand_color text-xs px-1.5 py-[1px] bg-brand_color_special_02 top-0 right-0 rounded-bl-lg',
          text: t`features_welfare_center_card_coupon_center_card_coupon_item_index_1ivrwcb5xk`,
        }
      }
      // 判断过期时间是否小于一天
      if (invalidByTime && getDaysDifference(invalidByTime)) {
        return {
          style:
            'absolute text-sell_down_color text-xs px-1.5 py-[1px] bg-sell_down_color_special_02 top-0 right-0 rounded-bl-lg',
          text: t`features_welfare_center_card_coupon_center_card_coupon_item_index_kvwtyo5oyt`,
        }
      }
    }
    // 如果券过期或者失效
    return {
      [CouponStatus.expired]: { text: t`features_orders_details_modify_stop_limit_5101351` },
      [CouponStatus.used]: { text: t`features_welfare_center_card_coupon_center_all_card_coupon_index_p8zvowtew6` },
    }[cardCouponStatus]
  }

  return (
    <div className={classNames(styles.scoped)}>
      <div className="card-coupon-item-container">
        {/* 如果券可用需要显示的样式 */}
        {cardCouponStatus === CouponStatus.available && (
          <div className={getStatusLableDetail()?.style}>{getStatusLableDetail()?.text}</div>
        )}
        {/* 如果券过期或者失效需要显示的样式 */}
        {[CouponStatus.expired, CouponStatus.used].includes(cardCouponStatus) && (
          <div className="coupon-status-tip-image">
            <span className="coupon-status-tip-text">{getStatusLableDetail()?.text}</span>
            <LazyImage src={`${welfareCenterImgUrl}/image_welfare_tag_bg`} imageType={Type.png} hasTheme />
          </div>
        )}
        {children}
        <div className="card-coupon-item-left-image">
          <LazyImage
            src={`${welfareCenterImgUrl}/${IsItAvailable ? '' : 'in'}available_welfare_edge`}
            hasTheme={!IsItAvailable}
            imageType={Type.png}
          />
        </div>
        <div className="absolute bottom-0 w-full">
          <div className="card-coupon-item-bottom">
            <div>{timeText}</div>
            {activityName && (
              <div
                className={classNames({
                  'card-coupon-item-bottom-right': !IsItAvailable,
                })}
              >
                {activityName}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardCouponItem
