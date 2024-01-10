/* prettier-ignore-start */
/* tslint:disable */
/* eslint-disable */

/* 该文件由 yapi-to-typescript 自动生成，请勿直接修改！！！ */

/**
 * 接口 [量化交易_批量刷K_内部接口↗](https://yapi.nbttfc365.com/project/44/interface/api/4519) 的 **请求类型**
 *
 * @分类 [合约主流程↗](https://yapi.nbttfc365.com/project/44/interface/api/cat_532)
 * @请求头 `POST /inner/v1/perpetual/quantify/batch/place`
 * @更新时间 `2023-02-13 14:05:27`
 */
export type YapiPostInnerV1PerpetualQuantifyBatchPlaceApiRequest =
  YapiPostInnerV1PerpetualQuantifyBatchPlaceApiRequestList[]

export interface YapiPostInnerV1PerpetualQuantifyBatchPlaceApiRequestList {
  /**
   * 不为空,交易对id
   */
  tradeId: number
  /**
   * 下单数量
   */
  size: number
  /**
   * 下单价格
   */
  price: number
  /**
   * 方向 open_long 开多      * open_short 开空      * close_long 平多      * close_short 平空
   */
  sideInd: number
  /**
   * 下单时间 13位毫秒值,不传会取当前服务所在机器时间
   */
  time?: number
}

/**
 * 接口 [量化交易_批量刷K_内部接口↗](https://yapi.nbttfc365.com/project/44/interface/api/4519) 的 **返回类型**
 *
 * @分类 [合约主流程↗](https://yapi.nbttfc365.com/project/44/interface/api/cat_532)
 * @请求头 `POST /inner/v1/perpetual/quantify/batch/place`
 * @更新时间 `2023-02-13 14:05:27`
 */
export interface YapiPostInnerV1PerpetualQuantifyBatchPlaceApiResponse {
  /**
   * success
   */
  data?: string
  /**
   * 200 标识成功 其他code值标识失败
   */
  code?: number
  message?: string
}

// 以下为自动生成的 api 请求，需要使用的话请手动复制到相应模块的 api 请求层
// import request, { MarkcoinRequest } from '@/plugins/request'

// /**
// * [量化交易_批量刷K_内部接口↗](https://yapi.nbttfc365.com/project/44/interface/api/4519)
// **/
// export const postInnerV1PerpetualQuantifyBatchPlaceApiRequest: MarkcoinRequest<
//   YapiPostInnerV1PerpetualQuantifyBatchPlaceApiRequest,
//   YapiPostInnerV1PerpetualQuantifyBatchPlaceApiResponse['data']
// > = data => {
//   return request({
//     path: "/inner/v1/perpetual/quantify/batch/place",
//     method: "POST",
//     data
//   })
// }

/* prettier-ignore-end */
