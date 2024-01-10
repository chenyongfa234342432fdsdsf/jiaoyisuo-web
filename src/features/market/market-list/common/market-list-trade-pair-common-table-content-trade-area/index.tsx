import TableClientPaginationSorting, {
  ITableClientPaginationSortingProps,
} from '@/components/table-client-pagination-sort'
import { SorterResult } from '@nbit/arco/es/Table/interface'
import { IMarketListBaseStore, useMarketListStore } from '@/store/market/market-list'
import { onTradePairClickRedirect } from '@/helper/market'
import { tableSortHelper } from '@/helper/common'
import { ApiStatusEnum, quoteVolumneTableSorter } from '@/constants/market/market-list'
import { getMarketTradeSearchTableColumns } from '@/features/market/market-list/common/market-list-trade-pair-table-schema'
import { useUnmount } from 'ahooks'
import styles from './index.module.css'

type IProps<T> = ITableClientPaginationSortingProps<T> & {
  setData?: any
  defaultSorter?: SorterResult | null
  apiStatus?: ApiStatusEnum
  showRowTooltip?: boolean
  forcedActiveStore?: any
}

export default function MarketListCommonTableContentTradeArea<T>({
  sorter,
  data,
  setData,
  defaultSorter,
  setSorter,
  showRowTooltip,
  forcedActiveStore,
  ...rest
}: IProps<T>) {
  const store = useMarketListStore()
  // manually set active store
  const activeStore = forcedActiveStore || (store[store.activeModule] as IMarketListBaseStore['spotMarketsTradeModule'])
  const { tableSorter, setTableSorter, setShowToolTip, updatePairSearchHistory } = activeStore
  // set to table sorter if not explicitly set to null
  const resolvedSorter = sorter || sorter === null ? sorter : tableSorter
  const resolvedDefaultSorter = defaultSorter || defaultSorter === null ? defaultSorter : quoteVolumneTableSorter
  const resolvedSetSorter = setSorter || setTableSorter

  useUnmount(() => {
    setShowToolTip(null)
  })

  return (
    <div className={`${styles.scoped}`}>
      <div className="spot-market-list-table-content-wrapper scrollbar-custom market-common-table">
        <TableClientPaginationSorting
          {...rest}
          data={data}
          apiStatus={rest.apiStatus}
          columns={getMarketTradeSearchTableColumns(activeStore?.moduleType) as any}
          sorter={resolvedSorter}
          setSorter={resolvedSetSorter}
          defaultSorter={resolvedDefaultSorter}
          onSortChange={(_sorter: SorterResult) => {
            tableSortHelper.handler({ data, sorter: _sorter, setData, defaultSorter: resolvedDefaultSorter })
          }}
          tableProps={{
            onRow: (record, index) => {
              let res = {
                onClick: e => {
                  updatePairSearchHistory(record)
                  onTradePairClickRedirect(record as any)
                },
              }
              if (showRowTooltip && setShowToolTip) {
                res = {
                  ...res,
                  ...{ onMouseEnter: e => setShowToolTip(record.id), onMouseLeave: e => setShowToolTip(null) },
                }
              }

              return res
            },
          }}
        />
      </div>
    </div>
  )
}
