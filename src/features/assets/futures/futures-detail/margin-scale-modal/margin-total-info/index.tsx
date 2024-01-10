/**
 * 合约 - 仓位价格展示组件
 */
import { t } from '@lingui/macro'
import { formatCurrency } from '@/helper/decimal'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { formatRatioNumber } from '@/helper/assets/futures'
import { PerpetualMarginScaleTypeEnum } from '@/constants/assets/futures'
import { useFutureQuoteDisplayDigit } from '@/hooks/features/assets'
import styles from './index.module.css'

export default function MarginTotalInfo({ type }: { type: string }) {
  const assetsFuturesStore = useAssetsFuturesStore()
  const {
    futuresDetails,
    futuresCurrencySettings: { currencySymbol },
    futuresAssetsMarginScale,
  } = { ...assetsFuturesStore }
  const offset = useFutureQuoteDisplayDigit()
  const { coinValue = '', marginValue = '', averageScale = '' } = { ...futuresAssetsMarginScale } || {}
  const priceList = [
    {
      // 币种资产
      label: t({
        id: 'features_assets_futures_futures_detail_margin_total_info_index_5101366',
        values: { 0: currencySymbol },
      }),
      value: formatCurrency(coinValue, offset),
    },
    {
      // 保证金价值
      label: t({
        id: 'features_assets_futures_futures_detail_margin_total_info_index_5101367',
        values: { 0: currencySymbol },
      }),
      value: formatCurrency(marginValue, offset),
    },
    // 体验金
    {
      label: t({
        id: 'features_assets_futures_futures_details_margin_scale_list_index_qo48mdspdr',
        values: { 0: currencySymbol },
      }),
      value: formatCurrency(futuresDetails?.groupVoucherAmount, offset || 2) || '--',
      isHide:
        ![PerpetualMarginScaleTypeEnum.total, PerpetualMarginScaleTypeEnum.positionOccupy].includes(
          type as PerpetualMarginScaleTypeEnum
        ) ||
        !futuresDetails?.groupVoucherAmount ||
        Number(futuresDetails?.groupVoucherAmount) <= 0,
    },
    {
      // 平均折算比率
      label: t`features_assets_futures_futures_detail_margin_scale_modal_margin_total_info_index_veja73j76bkbwvdn_ucvb`,
      value: `${formatRatioNumber(averageScale)}%`,
    },
  ]
  return (
    <div className={styles['position-price-root']}>
      {priceList.map((item, index: number) => {
        if (item?.isHide) return
        return (
          <div className="price-item" key={index}>
            <span>{item.label}</span>
            <span className="value">{item.value}</span>
          </div>
        )
      })}
    </div>
  )
}
