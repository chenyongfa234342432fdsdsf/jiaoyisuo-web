import { getV1OptionFavouriteTradePairListApiRequest } from '@/apis/ternary-option/market'
import { TFavouriteListData } from '@/typings/market/market-favourite'
import { YapiGetV1OptionFavouriteTradePairData } from '@/typings/yapi/OptionFavouriteTradePairListV1GetApi'
import { YapiGetV1OptionTradePairListData } from '@/typings/yapi/OptionTradePairListV1GetApi'
import { isArray, isObject } from 'lodash'

// bridge market api params between spot, futures, ternary
export function marketApiParamsAdapter<T extends TFavouriteListData[] | TFavouriteListData, P>(fn: (params: T) => P) {
  return (data: T) => {
    // handles ternary tradePair different id property
    let formatted = data

    if (isArray(data))
      formatted = data?.map(each => {
        // ternary trade pair
        if (each?.tradeId)
          return {
            ...each,
            productId: each.id,
            id: each.tradeId,
          }
        return each
      }) as T

    if (isObject(data) && !isArray(data) && data?.tradeId)
      formatted = {
        ...data,
        productId: data.id,
        id: data.tradeId,
      } as T

    return fn(formatted)
  }
}

export function formatTernaryOptionSymbolData(
  data: YapiGetV1OptionTradePairListData | YapiGetV1OptionTradePairListData[]
) {
  if (!checkIsTernary(data)) return data
  if (isArray(data))
    return data?.map(each => {
      return {
        ...each,
        quoteSymbolName: each?.tradeInfo?.quoteSymbolName,
        baseSymbolName: each?.tradeInfo?.baseSymbolName,
      }
    })
  if (isObject(data) && !isArray(data)) {
    return {
      ...data,
      quoteSymbolName: data?.tradeInfo?.quoteSymbolName,
      baseSymbolName: data?.tradeInfo?.baseSymbolName,
    }
  }
}

export function checkIsTernary(data: YapiGetV1OptionTradePairListData | YapiGetV1OptionTradePairListData[]) {
  if (isArray(data)) return data?.[0]?.tradeInfo
  if (isObject(data) && !isArray(data)) return data?.tradeInfo
}

export function marketApiResponseAdapter(fn: typeof getV1OptionFavouriteTradePairListApiRequest) {
  return (...data: Parameters<typeof getV1OptionFavouriteTradePairListApiRequest>) =>
    new Promise((resolve, reject) => {
      fn(...data)
        .then(res => {
          // handles ternary tradePair different id property
          let formatted = res.data

          if (isArray(formatted))
            formatted = (formatted as any)?.map(each => {
              // ternary trade pair
              if (each?.tradeId)
                return {
                  ...each,
                  productId: each.id,
                  id: each.tradeId,
                }
              return each
            })

          res.data = formatted

          resolve(res)
        })
        .catch(e => reject(e))
    })
}
