import request, { MarkcoinRequest } from '@/plugins/request'
import {
  YapiGetV1TradePairBuyCoinListApiRequest,
  YapiGetV1TradePairBuyCoinListApiResponse,
} from '@/typings/yapi/TradePairBuyCoinListV1GetApi'
import {
  YapiGetV1TradePairConceptListApiRequest,
  YapiGetV1TradePairConceptListApiResponse,
} from '@/typings/yapi/TradePairConceptListV1GetApi'
import { YapiGetV1TradePairHotApiRequest, YapiGetV1TradePairHotApiResponse } from '@/typings/yapi/TradePairHotV1GetApi'
import {
  YapiGetV1TradePairListApiRequest,
  YapiGetV1TradePairListApiResponse,
} from '@/typings/yapi/TradePairListV1GetApi'
import {
  YapiGetV1TradePairSearchApiRequest,
  YapiGetV1TradePairSearchApiResponse,
} from '@/typings/yapi/TradePairSearchV1GetApi'
import {
  YapiGetV1PerpetualTradePairDefaultQuoteCoinApiRequest,
  YapiGetV1PerpetualTradePairDefaultQuoteCoinApiResponse,
} from '@/typings/yapi/PerpetualTradePairDefaultQuoteCoinV1GetApi'
import {
  YapiGetV1PerpetualTradePairDefaultApiRequest,
  YapiGetV1PerpetualTradePairDefaultApiResponse,
} from '@/typings/yapi/PerpetualTradePairDefaultV1GetApi'
import {
  YapiGetV1PerpetualTradePairHotApiRequest,
  YapiGetV1PerpetualTradePairHotApiResponse,
} from '@/typings/yapi/PerpetualTradePairHotV1GetApi'
import {
  YapiGetV1TradePairTopRisingApiRequest,
  YapiGetV1TradePairTopRisingApiResponse,
} from '@/typings/yapi/TradePairTopRisingV1GetApi'
import {
  YapiGetV1TradePairTopFallingApiRequest,
  YapiGetV1TradePairTopFallingApiResponse,
} from '@/typings/yapi/TradePairTopFallingV1GetApi'
import {
  YapiGetV1TradePairTopVolumeApiRequest,
  YapiGetV1TradePairTopVolumeApiResponse,
} from '@/typings/yapi/TradePairTopVolumeV1GetApi'

/**
 * 首页 - 热门币对
 * @param params
 * @returns
 */
export const getHotCurrencies: MarkcoinRequest<
  YapiGetV1TradePairHotApiRequest,
  YapiGetV1TradePairHotApiResponse['data']
> = params => {
  return request({
    path: `v1/tradePair/hot`,
    method: 'GET',
    params,
  })
}

/**
 * 首页 - 涨幅榜
 */
export const getTopRising: MarkcoinRequest<
  YapiGetV1TradePairTopRisingApiRequest,
  YapiGetV1TradePairTopRisingApiResponse
> = params => {
  return request({
    path: `v1/tradePair/topRising`,
    method: 'GET',
    params,
  })
}

/**
 * 首页 - 跌幅榜
 */
export const getTopFalling: MarkcoinRequest<
  YapiGetV1TradePairTopFallingApiRequest,
  YapiGetV1TradePairTopFallingApiResponse
> = params => {
  return request({
    path: `v1/tradePair/topFalling`,
    method: 'GET',
    params,
  })
}

/**
 * 首页 -24 小时成交额
 */
export const getTopVolume: MarkcoinRequest<
  YapiGetV1TradePairTopVolumeApiRequest,
  YapiGetV1TradePairTopVolumeApiResponse
> = params => {
  return request({
    path: `v1/tradePair/topVolume`,
    method: 'GET',
    params,
  })
}

/**
 * [合约 - 热门币对↗](https://yapi.nbttfc365.com/project/44/interface/api/5589)
 * */
export const getV1PerpetualTradePairHotApiRequest: MarkcoinRequest<
  YapiGetV1PerpetualTradePairHotApiRequest,
  YapiGetV1PerpetualTradePairHotApiResponse['data']
> = params => {
  return request({
    path: '/v1/perpetual/tradePair/hot',
    method: 'GET',
    params,
  })
}

/** 现货 - 计价币列表 */
export const getBaseCurrencyList: MarkcoinRequest<
  YapiGetV1TradePairBuyCoinListApiRequest,
  YapiGetV1TradePairBuyCoinListApiResponse['data']
> = params => {
  return request({
    path: `v1/tradePair/buyCoinList`,
    method: 'GET',
    params,
  })
}

/** 现货 - 某个计价币对应的板块列表 */
export const getCategoriesByBaseCurrency: MarkcoinRequest<
  YapiGetV1TradePairConceptListApiRequest,
  YapiGetV1TradePairConceptListApiResponse
> = params => {
  return request({
    path: `v1/tradePair/conceptList`,
    method: 'GET',
    params,
  })
}

/** 现货 - 币对列表 */
export const getTradePairList: MarkcoinRequest<
  YapiGetV1TradePairListApiRequest,
  YapiGetV1TradePairListApiResponse['data']
> = params => {
  return request({
    path: `v1/tradePair/list`,
    method: 'GET',
    params,
  })
}

/** 搜索交易对 (币对模糊查询，交易币搜索) */
export const getTradePairListBySearch: MarkcoinRequest<
  YapiGetV1TradePairSearchApiRequest,
  YapiGetV1TradePairSearchApiResponse['data']
> = params => {
  return request({
    path: `v1/tradePair/search`,
    method: 'GET',
    params,
  })
}

/**
 * [默认法币↗](https://yapi.nbttfc365.com/project/44/interface/api/4451)
 * */
export const getV1PerpetualTradePairDefaultQuoteCoinApiRequest: MarkcoinRequest<
  YapiGetV1PerpetualTradePairDefaultQuoteCoinApiRequest,
  YapiGetV1PerpetualTradePairDefaultQuoteCoinApiResponse['data']
> = params => {
  return request({
    path: '/v1/perpetual/tradePair/defaultQuoteCoin',
    method: 'GET',
    params,
  })
}

/**
 * [默认币对↗](https://yapi.nbttfc365.com/project/44/interface/api/4447)
 * */
export const getV1PerpetualTradePairDefaultApiRequest: MarkcoinRequest<
  YapiGetV1PerpetualTradePairDefaultApiRequest,
  YapiGetV1PerpetualTradePairDefaultApiResponse
> = params => {
  return request({
    path: '/v1/perpetual/tradePair/default',
    method: 'GET',
    params,
  })
}
