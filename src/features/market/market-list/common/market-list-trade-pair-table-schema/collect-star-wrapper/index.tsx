import CollectStar from '@/components/collect-star'
import { MarketLisModulesEnum } from '@/constants/market/market-list'
import { TFavouriteListData } from '@/typings/market/market-favourite'
import { YapiGetV1PerpetualTradePairListData } from '@/typings/yapi/PerpetualTradePairListV1GetApi'

export function CollectStarWrapper({ item }) {
  return (
    <CollectStar
      forceContext={
        (item as YapiGetV1PerpetualTradePairListData)?.typeInd
          ? MarketLisModulesEnum.futuresMarkets
          : MarketLisModulesEnum.spotMarkets
      }
      needWrap={false}
      {...(item as unknown as TFavouriteListData)}
    />
  )
}
