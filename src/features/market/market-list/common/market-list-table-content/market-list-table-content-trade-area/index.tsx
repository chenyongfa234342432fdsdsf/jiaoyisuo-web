import { useMarketListStore } from '@/store/market/market-list'
import NoDataImage from '@/components/no-data-image'
import MarketListCommonTableContentTradeArea from '@/features/market/market-list/common/market-list-trade-pair-common-table-content-trade-area'
import {
  useWsMarketSpotUserFavListFullAmount,
  useWsMarketFuturesUserFavListFullAmount,
  useWsMarketTernaryUserFavListFullAmount,
} from '@/hooks/features/market/market-list/use-ws-market-spot-user-favourite-list'
import useWsMarketTradePairList, {
  useWsMarketFuturesTradePair,
  useWsMarketTernaryTradePair,
} from '@/hooks/features/market/market-list/use-ws-market-trade-pair-list'
import { isEmpty } from 'lodash'
import { formatTernaryOptionSymbolData } from '@/helper/market/bridge'
import { Spin } from '@nbit/arco'
import { apiSortTableSorter } from '@/constants/market/market-list'

export function MarketSpotTradeSearchDefaultTableContent({ store, ...rest }) {
  const state = store
  const { data, setData, apiStatus } = useWsMarketTradePairList({
    apiParams: { buyCoinId: state.selectedBaseCurrencyFilter, conceptId: state.selectedCategroyFilter },
  })
  const props = { ...rest, setData, apiStatus, showRowTooltip: true, data }

  return <MarketListCommonTableContentTradeArea forcedActiveStore={store} {...props} />
}

export function MarketFuturesTradeSearchDefaultTableContent({ ...rest }) {
  const state = useMarketListStore().futuresMarketsTradeModule
  const { data, setData, apiStatus } = useWsMarketFuturesTradePair({
    apiParams: { conceptId: state.selectedBaseCurrencyFilter },
  })

  const props = { ...rest, setData, apiStatus, showRowTooltip: true, data }

  return <MarketListCommonTableContentTradeArea {...props} />
}

export function MarketTernaryTradeSearchDefaultTableContent({ ...rest }) {
  // const state = useMarketListStore().futuresMarketsTradeModule
  const { data, setData, apiStatus } = useWsMarketTernaryTradePair({
    apiParams: {},
  })

  const formattedData = formatTernaryOptionSymbolData(data) as any

  const props = {
    ...rest,
    setData,
    apiStatus,
    showRowTooltip: true,
    data: formattedData,
    defaultSorter: apiSortTableSorter,
  }

  return <MarketListCommonTableContentTradeArea {...props} />
}

export function MarketTradeSearchResultTableContent({ data, store, ...rest }) {
  const props = { ...rest, showRowTooltip: false, data }

  return <MarketListCommonTableContentTradeArea {...props} />
}

export function MarketSpotTradeFavoriteTableContent({ ...rest }) {
  const { resolvedData: data, setApiData: setData, isLoading } = useWsMarketSpotUserFavListFullAmount()
  const props = { ...rest, setData, showRowTooltip: true, defaultSorter: null, data }

  if (isLoading)
    return (
      <div className="flex h-64">
        <Spin className={'m-auto'} />
      </div>
    )
  if (!isLoading && isEmpty(data)) return <NoDataImage size="h-24 w-28" />

  return <MarketListCommonTableContentTradeArea {...props} />
}

export function MarketFuturesTradeFavoriteTableContent({ ...rest }) {
  const { resolvedData: data, setApiData: setData, isLoading } = useWsMarketFuturesUserFavListFullAmount()
  const props = { ...rest, setData, showRowTooltip: true, defaultSorter: null, data }

  if (isLoading)
    return (
      <div className="flex h-64">
        <Spin className={'m-auto'} />
      </div>
    )
  if (!isLoading && isEmpty(data)) return <NoDataImage size="h-24 w-28" />

  return <MarketListCommonTableContentTradeArea {...props} />
}

export function MarketTernaryTradeFavoriteTableContent({ ...rest }) {
  const { resolvedData: data, setApiData: setData, isLoading } = useWsMarketTernaryUserFavListFullAmount()

  const formattedData = formatTernaryOptionSymbolData(data) as any

  const props = { ...rest, setData, showRowTooltip: true, defaultSorter: apiSortTableSorter, data: formattedData }

  if (isLoading)
    return (
      <div className="flex h-64">
        <Spin className={'m-auto'} />
      </div>
    )
  if (!isLoading && isEmpty(data)) return <NoDataImage size="h-24 w-28" />

  return <MarketListCommonTableContentTradeArea {...props} />
}
