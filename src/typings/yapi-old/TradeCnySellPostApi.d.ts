/* prettier-ignore-start */
/* tslint:disable */
/* eslint-disable */

/* 该文件由 yapi-to-typescript 自动生成，请勿直接修改！！！ */

/**
 * 接口 [web下卖单服务↗](https://yapi.coin-online.cc/project/72/interface/api/2075) 的 **请求类型**
 *
 * @分类 [公共分类↗](https://yapi.coin-online.cc/project/72/interface/api/cat_383)
 * @标签 `下单`
 * @请求头 `POST /trade/cny_sell`
 * @更新时间 `2022-08-29 13:58:28`
 */
export interface YapiPostTradeCnySellApiRequest {
  /**
   * 加密后的业务数据
   */
  bizData?: string
  /**
   * 随机向量
   */
  randomIv?: string
  /**
   * 随机密钥
   */
  randomKey?: string
  /**
   * 签名串
   */
  signature?: string
  targetObj?: {}
  /**
   * 时间戳
   */
  timestamp?: number
  /**
   * 是否限价单: 0-限价单，1-市价单
   */
  limited?: string
  /**
   * 市价单类型：BBO-对手价 optimal5-最优5档 optimal10-最优10档 optimal20-最优20档
   */
  priceType?: string
  /**
   * 币对id: 900003-btc/usdt交易对
   */
  symbol?: string
  /**
   * 数量
   */
  tradeAmount?: string
  /**
   * 单价
   */
  tradePrice?: string
  /**
   * 金额
   */
  funds?: string
  /**
   * 市价计量单位:amount - 数量，funds - 金额
   */
  marketUnit?: string
}

/**
 * 接口 [web下卖单服务↗](https://yapi.coin-online.cc/project/72/interface/api/2075) 的 **返回类型**
 *
 * @分类 [公共分类↗](https://yapi.coin-online.cc/project/72/interface/api/cat_383)
 * @标签 `下单`
 * @请求头 `POST /trade/cny_sell`
 * @更新时间 `2022-08-29 13:58:28`
 */
export interface YapiPostTradeCnySellApiResponse {
  code?: number
  data?: {}
  msg?: string
  time?: number
}

/* prettier-ignore-end */
