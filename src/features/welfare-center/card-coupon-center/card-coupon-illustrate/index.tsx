import { t } from '@lingui/macro'
import { Tooltip } from '@nbit/arco'
import classNames from 'classnames'
import Icon from '@/components/icon'

import styles from './index.module.css'

function CardCouponIllustrate() {
  const getTooltipContent = () => {
    return (
      <div className="text-xs">
        <div>
          {t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_7hombrct_w`}{' '}
          {t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_wugx7gcizw`}{' '}
        </div>
        <div>{t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_wugx7gcizw`}</div>
        <div>{t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_epinitshvw`}</div>
        <div>{t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_uzez3nywlt`}</div>
        <div className="my-2">
          {t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_iyyxwva8tn`}{' '}
          {t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_zq9xoakgmp`}
        </div>
        <div>{t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_bfftxxxadn`}</div>
        <div>{t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_8jne854wab`}</div>
        <div>{t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_v7w0ihif7p`}</div>
        <div>{t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_u3fzxb0g72`}</div>
      </div>
    )
  }

  return (
    <div className={classNames(styles.scoped)}>
      <div className="card-coupon-illustrate">
        <span>{t`features_welfare_center_card_coupon_center_card_coupon_illustrate_index_bsgpqasrld`}</span>
        <Tooltip content={getTooltipContent()}>
          <span>
            <Icon name="msg" hasTheme />
          </span>
        </Tooltip>
      </div>
    </div>
  )
}

export default CardCouponIllustrate
