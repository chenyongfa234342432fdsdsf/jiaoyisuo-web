import Icon from '@/components/icon'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { IFuturesPositionHistoryList, IPositionProfitInfoData } from '@/typings/api/assets/futures/position'
import { IncreaseTag } from '@nbit/react'
import { useState } from 'react'
import classNames from 'classnames'
import { FuturesPositionHistoryTypeEnum } from '@/constants/assets/futures'
import { getTextFromStoreEnums } from '@/helper/store'
import { useFutureQuoteDisplayDigit } from '@/hooks/features/assets'
import { ProfitDetailModal } from '../../profit-detail-modal'
import { HistoryPositionDetailLayout } from '../../history-position-detail'

export function HistoryPositionProfitCell({ item }: { item: IFuturesPositionHistoryList }) {
  const [visibleProfitDetail, setVisibleProfitDetail] = useState(false)
  const [profitData, setProfitData] = useState<IPositionProfitInfoData>()

  const offset = useFutureQuoteDisplayDigit()
  // const {
  //   futuresCurrencySettings: { offset = 2 },
  // } = useAssetsFuturesStore()

  const onOpenProfitDetail = (data: IPositionProfitInfoData) => {
    setProfitData(data)
    setVisibleProfitDetail(true)
  }

  return (
    <>
      <div>
        <IncreaseTag
          value={item.profit}
          hasPrefix={false}
          kSign
          digits={offset}
          right={<span className="ml-1">{item.quoteSymbolName}</span>}
        />{' '}
        | <IncreaseTag value={item.profitRatio} digits={2} hasPostfix needPercentCalc />
        {Number(item.profit) < 0 && (
          <Icon
            name="msg"
            hasTheme
            className="ml-1"
            onClick={() => {
              onOpenProfitDetail({
                profit: item?.profit,
                insuranceDeductionAmount: item?.insuranceDeductionAmount,
                voucherDeductionAmount: item?.voucherDeductionAmount,
              })
            }}
          />
        )}
      </div>
      {visibleProfitDetail && profitData && (
        <ProfitDetailModal profitData={profitData} visible={visibleProfitDetail} setVisible={setVisibleProfitDetail} />
      )}
    </>
  )
}

export function HistoryPositionOptionCell({ item }: { item: IFuturesPositionHistoryList }) {
  const [visibleDetail, setVisibleDetail] = useState(false)
  const { updateFuturesPosition, futuresEnums } = useAssetsFuturesStore() || {}

  return (
    <>
      <div
        className={classNames('close-type', {
          'liquidation-type': item.operationTypeCd === FuturesPositionHistoryTypeEnum.liquidation,
        })}
        onClick={() => {
          if (item.operationTypeCd !== FuturesPositionHistoryTypeEnum.liquidation) return

          updateFuturesPosition({ liquidationDetails: item })
          setVisibleDetail(true)
        }}
      >
        <span>
          {item.operationTypeCd &&
            getTextFromStoreEnums(item.operationTypeCd, futuresEnums.historyPositionCloseTypeEnum.enums)}
        </span>
        {item.operationTypeCd === FuturesPositionHistoryTypeEnum.liquidation && (
          <Icon name="next_arrow" hasTheme className="type-next-icon" />
        )}
      </div>
      {visibleDetail && <HistoryPositionDetailLayout visible={visibleDetail} setVisible={setVisibleDetail} />}
    </>
  )
}
