import { YapiGetV1FavouriteListData } from '../yapi/FavouriteListV1GetApi'
import { YapiGetV1OptionFavouriteTradePairListData } from '../yapi/OptionFavouriteTradePairListV1GetApi'

type FavStore = {
  hasListUpdated: boolean
  updateList: () => void
  favList: YapiGetV1FavouriteListData[]
  updateFavList: (item: YapiGetV1FavouriteListData[]) => void
}


type TFavouriteListData = YapiGetV1FavouriteListData & YapiGetV1OptionFavouriteTradePairListData