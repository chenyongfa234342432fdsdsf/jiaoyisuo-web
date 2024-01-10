/**
 * 强平详情 - 历史仓位
 */

import Icon from '@/components/icon'
import {
  FuturePositionDirectionEnum,
  getFuturePositionDirectionEnumName,
  getFuturesGroupTypeName,
} from '@/constants/assets/futures'
import { TradeMarketAmountTypesEnum } from '@/constants/trade'
import { formatNumberByOffset } from '@/helper/assets/futures'
import { formatDate } from '@/helper/date'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { IncreaseTag } from '@nbit/react'
import { useMemo } from 'react'
import { useFuturesStore } from '@/store/futures'
import { decimalUtils } from '@nbit/utils'
import { t } from '@lingui/macro'

function LiquidationPositionDetails() {
  const {
    futuresPosition,
    futuresCurrencySettings: { offset = 2 },
  } = useAssetsFuturesStore()
  const {
    closePrice,
    closeSize,
    profit,
    closePositionTime,
    baseSymbolName = '',
    quoteSymbolName = '',
    priceOffset,
    amountOffset,
    latestPrice,
    symbol = '',
    swapTypeInd,
    lever = '',
    sideInd,
  } = futuresPosition.liquidationDetails || {}
  /** 开仓保证金来源设置，tradePanel 下单面板数据 */
  const { tradePanel } = useFuturesStore()
  /** 下单页输入框下拉计价单位 - 金额还是数量 eg usd / btc */
  const tradePairType = useMemo(() => {
    return tradePanel.tradeUnit
  }, [tradePanel.tradeUnit])
  const SafeCalcUtil = decimalUtils.SafeCalcUtil
  const { formatCurrency } = decimalUtils

  /**
   * 根据合约交易下单单位，折算持仓数量
   * 切换为计价币时=标的币数量*标记价格（结果保留计价法币精度）
   */
  const onFormatPositionSize = (val: string) => {
    if (tradePairType === TradeMarketAmountTypesEnum.funds) {
      const positionMargin = `${SafeCalcUtil.mul(val, latestPrice)}`
      return formatNumberByOffset(positionMargin, offset)
    }
    return formatNumberByOffset(val, +amountOffset, false)
  }

  const infoList = [
    {
      label: `${t`features/orders/order-columns/holding-2`} (${quoteSymbolName})`,
      content: decimalUtils.formatCurrency(closePrice, Number(priceOffset)),
    },
    {
      label: `${t`features_assets_futures_history_position_histroy_position_detail_details_index_w95fawnp1m`} (${
        tradePairType === TradeMarketAmountTypesEnum.funds ? quoteSymbolName : baseSymbolName
      })`,
      content: onFormatPositionSize(closeSize),
    },
    {
      label: `${t`features/orders/order-columns/future-2`} (${quoteSymbolName})`,
      content: <IncreaseTag value={profit} kSign digits={offset} />,
    },
  ]

  const typeName = getFuturesGroupTypeName(swapTypeInd) || ''
  const price = decimalUtils.formatCurrency(closePrice, Number(priceOffset)) || '--'
  const keywordsClassName =
    sideInd === FuturePositionDirectionEnum.openBuy ? 'text-buy_up_color' : 'text-sell_down_color'

  return (
    <div className="details-wrap">
      <div className="details-header">
        <div className="header-title">{t`features_assets_futures_history_position_histroy_position_detail_details_index_j_c0yfmynl`}</div>
        <div className="header-date">{formatDate(closePositionTime)}</div>
      </div>

      <div className="details-list">
        {infoList.map((info, i: number) => {
          return (
            <div className="list-cell" key={i}>
              <div className="label">{info.label}</div>
              <div className="value">{info.content}</div>
            </div>
          )
        })}
      </div>

      <div className="hint-wrap">
        <Icon name="prompt-symbol" className="hint-icon" />
        <span
          className="hint-text"
          dangerouslySetInnerHTML={{
            __html: `${symbol} ${typeName} ${t({
              id: 'features_assets_futures_history_position_history_position_detail_details_index_nsy30c3mqw',
              values: {
                0: keywordsClassName,
                1: price,
                2: `${symbol} ${typeName} ${getFuturePositionDirectionEnumName(sideInd)} ${lever}X`,
              },
            })}`,
          }}
          // dangerouslySetInnerHTML={{
          //   __html: `${symbol} ${typeName}合约的标记价格达到 <span class="${keywordsClassName}">${price}</span> 时，您的 <span class="${keywordsClassName}">${symbol} ${typeName}${
          //     getFuturePositionDirectionEnumName(sideInd) || '--'
          //   } ${lever}X</span> 仓位保证金率低于维持保证金率，强平平仓被触发，仓位按照 <span class="${keywordsClassName}">${price}</span> 的价格被强平引擎接管，以减少损失。`,
          // }}
        ></span>
      </div>
    </div>
  )
}

export { LiquidationPositionDetails }
