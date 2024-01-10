import request, { MarkcoinRequest } from '@/plugins/request'
import { NewsDetailReq, NewsDetailResp } from '@/typings/api/nft'
import {
  YapiGetV1OptionMarketKlinesApiRequest,
  YapiGetV1OptionMarketKlinesApiResponse,
} from '@/typings/yapi/OptionMarketKlinesV1GetApi'
import {
  YapiGetV1OptionTradePairDetailApiRequest,
  YapiGetV1OptionTradePairDetailApiResponse,
} from '@/typings/yapi/OptionTradePairDetailV1GetApi'
import {
  YapiPostV1OptionPlanOrdersOperateApiRequest,
  YapiPostV1OptionPlanOrdersOperateApiResponse,
} from '@/typings/yapi/OptionPlanOrdersOperateV1PostApi.d'
import {
  YapiPostV1OptionPlanOrdersCancelAllApiRequest,
  YapiPostV1OptionPlanOrdersCancelAllApiResponse,
} from '@/typings/yapi/OptionPlanOrdersCancelAllV1PostApi.d'
import {
  YapiGetV1OptionProductCurrenciesApiRequest,
  YapiGetV1OptionProductCurrenciesApiResponse,
} from '@/typings/yapi/OptionProductCurrenciesV1GetApi.d'
import {
  YapiGetV1OptionEarningTodayApiRequest,
  YapiGetV1OptionEarningTodayApiResponse,
} from '@/typings/yapi/OptionEarningTodayV1GetApi.d'
import {
  YapiPostV1OptionOrdersPlaceApiRequest,
  YapiPostV1OptionOrdersPlaceApiResponse,
} from '@/typings/yapi/OptionOrdersPlaceV1PostApi'
import {
  YapiGetV1OptionProductPeriodsApiRequest,
  YapiGetV1OptionProductPeriodsApiResponse,
} from '@/typings/yapi/OptionProductPeriodsV1GetApi'
import {
  YapiGetV1OptionProductYieldRateApiRequest,
  YapiGetV1OptionProductYieldRateApiResponse,
} from '@/typings/yapi/OptionProductYieldRateV1GetApi'
import {
  YapiPostV1OptionPlanOrdersPlaceApiRequest,
  YapiPostV1OptionPlanOrdersPlaceApiResponse,
} from '@/typings/yapi/OptionPlanOrdersPlaceV1PostApi'
import {
  YapiGetV1OptionProductCallAndPutPercentApiRequest,
  YapiGetV1OptionProductCallAndPutPercentApiResponse,
} from '@/typings/yapi/OptionProductCallAndPutPercentV1GetApi'
import {
  YapiGetV1OptionMarketDealCountApiRequest,
  YapiGetV1OptionMarketDealCountApiResponse,
} from '@/typings/yapi/OptionMarketDealCountV1GetApi'

/**
 * 这里写文档地址 URL
 * 这里描述接口职责
 */
export const getNewsDetail: MarkcoinRequest<NewsDetailReq, NewsDetailResp> = ({ id, locale }) => {
  return request({
    path: `/v2/news/posts/${id}`,
    method: 'GET',
    params: {
      locale,
    },
  })
}

/**
 * [期权详情接口↗](https://yapi.nbttfc365.com/project/44/interface/api/11149)
 * */
export const getV1OptionTradePairDetailApiRequest: MarkcoinRequest<
  YapiGetV1OptionTradePairDetailApiRequest,
  YapiGetV1OptionTradePairDetailApiResponse['data']
> = params => {
  return request({
    path: '/v1/option/tradePair/detail',
    method: 'GET',
    params,
  })
}
/** 计划委托列表* */
export const getPlanOrdersCurrent: MarkcoinRequest = params => {
  return request({
    path: `/v1/option/plan/orders/current`,
    method: 'GET',
    params,
  })
}

/**
 * [k 线接口↗](https://yapi.nbttfc365.com/project/44/interface/api/11089)
 * */
export const getV1OptionMarketKlinesApiRequest: MarkcoinRequest<
  YapiGetV1OptionMarketKlinesApiRequest,
  YapiGetV1OptionMarketKlinesApiResponse['data']
> = params => {
  return request({
    path: '/v1/option/market/klines',
    method: 'GET',
    params,
  })
}

/** 计划委托启用停止删除* */
export const getPlanOrdersOperate: MarkcoinRequest<
  YapiPostV1OptionPlanOrdersOperateApiRequest,
  YapiPostV1OptionPlanOrdersOperateApiResponse['data']
> = data => {
  return request({
    path: `/v1/option/plan/orders/operate`,
    method: 'POST',
    data,
  })
}

/** 计划委托全部删除* */
export const getAllDeletePlanOrdersOperate: MarkcoinRequest<
  YapiPostV1OptionPlanOrdersCancelAllApiRequest,
  YapiPostV1OptionPlanOrdersCancelAllApiResponse['data']
> = () => {
  return request({
    path: `/v1/option/plan/orders/cancelAll`,
    method: 'POST',
    data: {},
  })
}

/** 历史战绩* */
export const getOrdersHistory: MarkcoinRequest = params => {
  return request({
    path: `/v1/option/orders/history`,
    method: 'GET',
    params,
  })
}

/** 保证金币种列表* */
export const getProductCurrencies: MarkcoinRequest<
  YapiGetV1OptionProductCurrenciesApiRequest,
  YapiGetV1OptionProductCurrenciesApiResponse['data']
> = () => {
  return request({
    path: `/v1/option/product/currencies`,
    method: 'GET',
  })
}

/** 今日盈亏* */
export const getEarningToday: MarkcoinRequest<
  YapiGetV1OptionEarningTodayApiRequest,
  YapiGetV1OptionEarningTodayApiResponse['data']
> = params => {
  return request({
    path: `/v1/option/earning/today`,
    method: 'GET',
    params,
  })
}

/**
 * [新建普通委托↗](https://yapi.nbttfc365.com/project/44/interface/api/10914)
 * */
export const postV1OptionOrdersPlaceApiRequest: MarkcoinRequest<
  YapiPostV1OptionOrdersPlaceApiRequest,
  YapiPostV1OptionOrdersPlaceApiResponse['data']
> = data => {
  return request({
    path: '/v1/option/orders/place',
    method: 'POST',
    data,
  })
}

/**
 * [玩法时间列表↗](https://yapi.nbttfc365.com/project/44/interface/api/11059)
 * */
export const getV1OptionProductPeriodsApiRequest: MarkcoinRequest<
  YapiGetV1OptionProductPeriodsApiRequest,
  YapiGetV1OptionProductPeriodsApiResponse['data']
> = params => {
  return request({
    path: '/v1/option/product/periods',
    method: 'GET',
    params,
  })
}

/**
 * [下单页面收益率列表↗](https://yapi.nbttfc365.com/project/44/interface/api/11069)
 * */
export const getV1OptionProductYieldRateApiRequest: MarkcoinRequest<
  YapiGetV1OptionProductYieldRateApiRequest,
  YapiGetV1OptionProductYieldRateApiResponse['data']
> = params => {
  return request({
    path: '/v1/option/product/yieldRate',
    method: 'GET',
    params,
  })
}

/**
 * [新建计划委托↗](https://yapi.nbttfc365.com/project/44/interface/api/10929)
 * */
export const postV1OptionPlanOrdersPlaceApiRequest: MarkcoinRequest<
  YapiPostV1OptionPlanOrdersPlaceApiRequest,
  YapiPostV1OptionPlanOrdersPlaceApiResponse['data']
> = data => {
  return request({
    path: '/v1/option/plan/orders/place',
    method: 'POST',
    data,
  })
}

/**
 * [下单涨跌比例↗](https://yapi.nbttfc365.com/project/44/interface/api/11064)
 * */
export const getV1OptionProductCallAndPutPercentApiRequest: MarkcoinRequest<
  YapiGetV1OptionProductCallAndPutPercentApiRequest,
  YapiGetV1OptionProductCallAndPutPercentApiResponse['data']
> = params => {
  return request({
    path: '/v1/option/product/callAndPutPercent',
    method: 'GET',
    params,
  })
}

/**
 * [k 线下单统计↗](https://yapi.nbttfc365.com/project/44/interface/api/15119)
 * */
export const getV1OptionMarketDealCountApiRequest: MarkcoinRequest<
  YapiGetV1OptionMarketDealCountApiRequest,
  YapiGetV1OptionMarketDealCountApiResponse['data']
> = params => {
  return request({
    path: '/v1/option/market/dealCount',
    method: 'GET',
    params,
  })
}
