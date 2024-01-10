/**
 * 历史仓位筛选组件
 */
import PopupSearchSelect from '@/components/popup-search-select'
import { t } from '@lingui/macro'
import { AssetSelect } from '@/features/assets/common/assets-select'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { Select } from '@nbit/arco'
import classNames from 'classnames'
import { useApiAllMarketFuturesTradePair } from '@/hooks/features/market/common/use-api-all-market-trade-pair'
import { IFuture } from '@/typings/api/future/common'
import { OrderDateFiltersInTable } from './base'
import styles from './base.module.css'

export function FutureHistoryPositionFilter() {
  const { data } = useApiAllMarketFuturesTradePair()
  const allTradePairs: IFuture[] = data as any[]

  // const { allTradePairs } = useContractMarketStore()
  const pairOptions = allTradePairs.map(pair => ({
    label: pair.symbolName,
    value: pair.id?.toString(),
    name: pair.symbolName,
  }))
  pairOptions.unshift({
    label: t`common.all`,
    value: '',
    name: t`common.all`,
  })
  const {
    futuresEnums,
    updateFuturesPosition,
    futuresPosition: { historyForm },
  } = useAssetsFuturesStore() || {}
  const typeList = futuresEnums.historyPositionCloseTypeEnum.enums
  const Option = Select.Option

  return (
    <div className="flex flex-wrap items-center">
      <div className={classNames(styles['base-select-wrapper'], 'mb-4')}>
        <span className="mr-3 font-medium">{t`future.funding-history.future-select.future`}</span>
        <PopupSearchSelect
          className="w-40 h-10"
          popupClassName="w-44 "
          value={historyForm?.tradeInfo?.value || ''}
          options={pairOptions}
          searchPlaceHolder={t`features_orders_filters_future_5101480`}
          onChange={(val, option) => {
            updateFuturesPosition({
              historyForm: {
                ...historyForm,
                symbol: option?.value ? option?.name : '',
                tradeInfo: option,
              },
            })
          }}
        />
      </div>
      <div className={classNames(styles['base-select-wrapper'], 'mb-4')}>
        <span className="mr-3 font-medium">{t`order.filters.status.label`}</span>
        <AssetSelect
          className="w-40 newbit-select-custom-style"
          value={historyForm?.operationTypeCd}
          onChange={(val: any) => {
            updateFuturesPosition({ historyForm: { ...historyForm, operationTypeCd: val } })
          }}
        >
          <Option key="all" value="">
            {t`common.all`}
          </Option>
          {typeList &&
            typeList.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
        </AssetSelect>
      </div>
      <div className={classNames(styles['base-select-wrapper'], 'mb-4')}>
        <OrderDateFiltersInTable
          params={{
            dateType: historyForm.dateType,
            beginDateNumber: historyForm.startTime,
            endDateNumber: historyForm.endTime,
          }}
          onChange={(v: any) => {
            updateFuturesPosition({
              historyForm: {
                ...historyForm,
                startTime: v.beginDateNumber,
                endTime: v.endDateNumber,
                dateType: v.dateType,
              },
            })
          }}
          filterOptions={[]}
        />
      </div>
    </div>
  )
}
