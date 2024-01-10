/**
 * 接口 [当前持仓↗](https://yapi.nbttfc365.com/project/44/interface/api/10919) 的 **请求类型**
 * @请求头 `GET /v1/option/orders/current`
 */
export interface IOptionCurrentPositionReq {
  /** 分页参数页号，从 1 开始 */
  pageNum: number
  /** 分页大小 默认 20，最小 1，最大 500 */
  pageSize?: number
  /** 是否计算总数 true 是 false 否;不传默认为 true */
  count?: string
  /** 需要置顶的期权产品 id */
  priorOption?: string
}

/**
 * 接口 [当前持仓↗](https://yapi.nbttfc365.com/project/44/interface/api/10919) 的 **返回类型**
 * @请求头 `GET /v1/option/orders/current`
 */
export interface IOptionCurrentPositionResp {
  total?: number
  pageNum?: number
  pageSize?: number
  list?: IOptionCurrentPositionList[]
}
export interface IOptionCurrentPositionList {
  /** 订单 ID */
  id: number
  /** 下单金额 100 */
  amount: string
  /** 结算周期 例如 30，60，1，2，3 */
  periodDisplay: number
  /** 结算周期单位 SECONDS 表示秒；MINUTES 表示分钟 */
  periodUnit: string
  /** 价差 买涨买跌方向没有值 */
  amplitude?: number
  /** 收益率 0.2，前端自己处理为 20%；-1，处理为 -100% */
  realYield: number
  /** 开仓价格 25000.1 */
  openPrice: string
  /** 目标价格 25500 */
  targetPrice: string
  /** 三元期权产品 symbol，例如 BTCUSD */
  symbol: string
  /** 三元期权产品 ID */
  optionId: number
  /** 三预期权收益率配置 id */
  yieldId: number
  /** 三元期权选择的时间 id */
  periodId: number
  /** 方向 买涨 call  买跌 put 买涨超 over_call 买跌超 over_put */
  sideInd: string
  /** 标的币 symbol 例如 BTC */
  baseCoinShortName: string
  /** 计价币 symbol 例如 USD */
  quoteCoinShortName: string
  /** 下单币种 ID */
  coinId: string
  /** 下单币种 symbol 例如 USDT */
  coinSymbol: string
  /** 订单状态 processing 处理中；complete 已完成；fail 下单失败。 */
  statusCd: string
  /** 开仓时间 毫秒时间戳 */
  createdByTime: number
  /** 结算时间 毫秒时间戳 */
  settlementTime: number
  /** index_price 指数价格  mark_price 标记价格 */
  optionPriceType: string
  /** delivery 交割    perpetual 永续 */
  typeInd: string
  /** 当前价格，每次查询返回查询时刻的价格，后续价格变动需要接 ws.如果平台价格出现了问题，比如当前时间戳获取不到价格，值会为空 */
  currentPrice?: string;
  /** 预估收益，通过价格实时计算 */
  profit?: string;
  /** web 图标 */
  webLogo?: string;
  /** app 图标 */
  appLogo?: string;
  /** 下单金额中包含多少体验金，选择了体验金优惠券才会有值 */
  voucherAmount: string
}
