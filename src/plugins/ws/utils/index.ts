/* eslint-disable @typescript-eslint/no-use-before-define */
import { getWsContractType, WsBizEnum, WsTypesEnum } from '@/constants/ws'
import { Any } from '@/plugins/ws/protobuf/ts/google/protobuf/any'
import { Response, CommonRsp } from '@/plugins/ws/protobuf/ts/proto/Response'
import { Market } from '@/plugins/ws/protobuf/ts/proto/Market'
import { Notice } from '@/plugins/ws/protobuf/ts/proto/Notice'
import { Deal } from '@/plugins/ws/protobuf/ts/proto/Deal'
import { Depth } from '@/plugins/ws/protobuf/ts/proto/Depth'
import { KLine } from '@/plugins/ws/protobuf/ts/proto/KLine'
import { OptionKLine } from '@/plugins/ws/protobuf/ts/proto/OptionKLine'
import { Asset } from '@/plugins/ws/protobuf/ts/proto/Asset'
import { MarketActivities } from '@/plugins/ws/protobuf/ts/proto/MarketActivities'
import { PerpetualIndexPrice } from '@/plugins/ws/protobuf/ts/proto/PerpetualIndexPrice'
import { Order } from '@/plugins/ws/protobuf/ts/proto/Order'
import { ConceptPrice } from '@/plugins/ws/protobuf/ts/proto/ConceptPrice'
import { TradePairs } from '@/plugins/ws/protobuf/ts/proto/TradePairs'
import { OptionOrder } from '@/plugins/ws/protobuf/ts/proto/OptionOrder'
import { OptionPlanOrder } from '@/plugins/ws/protobuf/ts/proto/OptionPlanOrder'
import { PerpetualOrder } from '@/plugins/ws/protobuf/ts/proto/PerpetualOrder'
import { PerpetualPlanOrder } from '@/plugins/ws/protobuf/ts/proto/PerpetualPlanOrder'
import { PerpetualProfitLoss } from '@/plugins/ws/protobuf/ts/proto/PerpetualProfitLoss'
import { PerpetualGroupDetail } from '@/plugins/ws/protobuf/ts/proto/PerpetualGroupDetails'
import { SpotAssetsChange } from '@/plugins/ws/protobuf/ts/proto/SpotAssetsChange'
import { OrderStatus } from '@/plugins/ws/protobuf/ts/proto/C2COrderStatus'
import { Rate } from '@/plugins/ws/protobuf/ts/proto/Rate'
import { Options } from '@/plugins/ws/protobuf/ts/proto/Options'

import { C2cAccountChanged } from '@/plugins/ws/protobuf/ts/proto/C2cAccountChanged'
import { ClosePositionHistory } from '@/plugins/ws/protobuf/ts/proto/ClosePositionHistory'
import { OptionMarket } from '@/plugins/ws/protobuf/ts/proto/OptionMarket'
import { OptionYieldChanged } from '@/plugins/ws/protobuf/ts/proto/OptionYieldChanged'
import { OptionYields } from '@/plugins/ws/protobuf/ts/proto/OptionYields'
import { SpotProfitLoss } from '@/plugins/ws/protobuf/ts/proto/SpotProfitLoss'
import { subscribeReqKeys, WSSendTypeEnum } from '../constants'

// https://cd.admin-devops.com/zentao/doc-objectLibs-custom-0-79-665.html#app=doc

/** pb 解码 */
export const PBDecode = (msg: Uint8Array): any => {
  const msgVal = Response.fromBinary(new Uint8Array(msg))

  return PBDecodeFeatures(msgVal)
}

function PBDecodeFeatures(msgVal) {
  const { type, data, biz } = msgVal || { type: undefined, data: undefined, biz: undefined }
  // 三元期权
  if (biz === WsBizEnum.option) {
    if (type === WsTypesEnum.market) {
      const val = Any.unpack(data, OptionMarket) as OptionMarket
      return { topic: getTopicKey(msgVal), data: val }
    }

    if (type === WsTypesEnum.ternaryOptionFullAmount) {
      const val = (Any.unpack(data, Options) as Options).list
      return { topic: getTopicKey(msgVal), data: val }
    }

    if (type === WsTypesEnum.kline || type === WsTypesEnum.kline_1s) {
      const val = Any.unpack(data, OptionKLine) as OptionKLine
      return { topic: getTopicKey(msgVal), data: val }
    }

    if (type === WsTypesEnum.optionYieldChanged) {
      const val = Any.unpack(data, OptionYieldChanged) as OptionYieldChanged
      return { topic: getTopicKey(msgVal), data: val }
    }

    if (type === WsTypesEnum.optionYields) {
      const val = Any.unpack(data, OptionYields) as OptionYields
      return { topic: getTopicKey(msgVal), data: val }
    }
  }

  if ([WsTypesEnum.market, WsTypesEnum.perpetualMarket].includes(type)) {
    // console.log('type---------------', type, data)
    const val = (Any.unpack(data, Market) as Market)?.market || (Any.unpack(data, Market) as Market)
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.minedeal, WsTypesEnum.perpetualMineDeal].includes(type)) {
    const val = (Any.unpack(data, Deal) as Deal).deal
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.deal, WsTypesEnum.perpetualDeal].includes(type)) {
    const val = (Any.unpack(data, Deal) as Deal).deal
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.depth, WsTypesEnum.perpetualDepth].includes(type)) {
    const val = Any.unpack(data, Depth) as Depth
    return { topic: getTopicKey(msgVal), data: val }
  }
  if (
    [
      WsTypesEnum.kline,
      WsTypesEnum.perpetualKline,
      WsTypesEnum.perpetualMarketKline,
      WsTypesEnum.perpetualIndexKline,
    ].includes(type)
  ) {
    const val = (Any.unpack(data, KLine) as KLine).kLine
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.asset].includes(type)) {
    const val = (Any.unpack(data, Asset) as Asset).asset
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.order].includes(type)) {
    const val = (Any.unpack(data, Order) as unknown as Order).order
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WSSendTypeEnum.login].includes(type)) {
    const val = Any.unpack(data as Any, CommonRsp) as unknown as CommonRsp
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.planOrder].includes(type)) {
    const val = (Any.unpack(data, Order) as unknown as Order).order
    return { topic: getTopicKey(msgVal), data: val }
  }

  if ([WsTypesEnum.concept].includes(type)) {
    const val: any = Any.unpack(data as Any, ConceptPrice).list
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.marketFullAmount, getWsContractType(WsTypesEnum.marketFullAmount)].includes(type)) {
    const val: any = Any.unpack(data as Any, TradePairs).list
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([(WsTypesEnum.marketSlow, getWsContractType(WsTypesEnum.marketSlow))].includes(type)) {
    const val: any = Any.unpack(data as Any, Market).market
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.notice].includes(type)) {
    const val: any = Any.unpack(data as Any, Notice)
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.marketActivities].includes(type)) {
    const val: any = Any.unpack(data as Any, MarketActivities)
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.perpetualIndex].includes(type)) {
    const val = Any.unpack(data, PerpetualIndexPrice) as PerpetualIndexPrice
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.perpetualOrder].includes(type)) {
    const val = Any.unpack(data, PerpetualOrder) as PerpetualOrder
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.perpetualPlanOrder].includes(type)) {
    const val = Any.unpack(data, PerpetualPlanOrder) as PerpetualPlanOrder
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.perpetualStopLimitOrder].includes(type)) {
    const val = Any.unpack(data, PerpetualProfitLoss) as PerpetualProfitLoss
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.perpetualGroupDetail].includes(type)) {
    const val = Any.unpack(data, PerpetualGroupDetail) as PerpetualGroupDetail
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.c2corder].includes(type)) {
    const val = Any.unpack(data, OrderStatus) as OrderStatus
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.rate].includes(type)) {
    const val = Any.unpack(data, Rate) as Rate
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.c2cAccount].includes(type)) {
    const val = Any.unpack(data, C2cAccountChanged) as C2cAccountChanged
    return { topic: getTopicKey(msgVal), data: val }
  }

  if ([WsTypesEnum.optionOrder].includes(type)) {
    const val = Any.unpack(data, OptionOrder) as OptionOrder
    return { topic: getTopicKey(msgVal), data: val }
  }

  if ([WsTypesEnum.optionPlanOrder].includes(type)) {
    const val = Any.unpack(data, OptionPlanOrder) as OptionPlanOrder
    return { topic: getTopicKey(msgVal), data: val }
  }

  if ([WsTypesEnum.closePositionHistory].includes(type)) {
    const val = Any.unpack(data, ClosePositionHistory) as ClosePositionHistory
    return { topic: getTopicKey(msgVal), data: val }
  }

  if ([WsTypesEnum.spotProfitLoss].includes(type)) {
    const val = Any.unpack(data, SpotProfitLoss) as SpotProfitLoss
    return { topic: getTopicKey(msgVal), data: val }
  }
  if ([WsTypesEnum.spotAssetsChange].includes(type)) {
    const val = Any.unpack(data, SpotAssetsChange) as SpotAssetsChange
    return { topic: getTopicKey(msgVal), data: val }
  }
  return { topic: null, data: null }
}

/** json 字符串转对象 */
export const stringToJson = (message: string): any => {
  if (!message) {
    return null
  }
  try {
    message = JSON.parse(message)
  } catch (e) {
    console.warn(e)
  }
  return message
}

/** 是否为空 */
export const isEmpty = (data: any[]): boolean => !Array.isArray(data) || (Array.isArray(data) && data.length === 0)

export function alphabeticalSort(a, b) {
  return a.localeCompare(b)
}

/**
 * 按照顺序、排除某 Key 返回某对象
 * 需指定关键的 key
 */
function getSortKeyObject(val) {
  const sortKeys = Object.keys(val).sort()
  const obj = {}
  sortKeys.forEach(key => {
    if (subscribeReqKeys.includes(key) && val[key]) {
      obj[key] = val[key]
    }
  })
  return obj
}

/**
 * 解析纯字符串 topic 或者 json topic
 */
export function getTopicKey(val) {
  if (!val) {
    return ''
  }
  if (typeof val === 'string') {
    return JSON.stringify(val)
  }
  return JSON.stringify(getSortKeyObject(val))
}

export function safeSetInterval(func, delay, immediately = false) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  // 声明 timer，用于后面清除定时器
  let timer: any = null
  const interval = () => {
    // 执行对应传入函数
    func()
    // 用 timer 接收 setTimeout 返回的定时器编号
    // setTimeout 接收 interval 和 delay，等待 delay 结束后，再次执行 setTimeout
    timer = setTimeout(interval, delay)
  }
  if (immediately) {
    func()
  }
  // 第一次调用 setTimeout，调用 interval，时延为 delay
  setTimeout(interval, delay)
  // 返回一个 cancel 方法取消调用
  return {
    cancel: () => {
      // 清除 timer 编号的定时器
      clearTimeout(timer)
    },
  }
}

/**
 * 从 unSendSubTopics、unSendUnSubTopics 中找出真正应该发送的订阅，处理重复订阅、订阅取消订阅重复的情况
 */
export function getTopicsFormSubUnSub(unSendSubTopics, unSendUnSubTopics) {
  const cacheMapKeys = {}
  const subTopics: string[] = []
  const unSubTopics: string[] = []

  unSendSubTopics.forEach(topicKey => {
    if (cacheMapKeys[topicKey]) {
      // eslint-disable-next-line operator-assignment
      cacheMapKeys[topicKey] = cacheMapKeys[topicKey] + 1
    } else {
      cacheMapKeys[topicKey] = 1
    }
  })

  unSendUnSubTopics.forEach(topicKey => {
    if (cacheMapKeys[topicKey]) {
      // eslint-disable-next-line operator-assignment
      cacheMapKeys[topicKey] = cacheMapKeys[topicKey] - 1
    } else {
      cacheMapKeys[topicKey] = -1
    }
  })
  const topics = Object.keys(cacheMapKeys)
  topics.forEach(topicKey => {
    if (cacheMapKeys[topicKey] > 0) {
      subTopics.push(topicKey)
      return
    }
    if (cacheMapKeys[topicKey] < 0) {
      unSubTopics.push(topicKey)
    }
  })

  return {
    subTopics,
    unSubTopics,
  }
}
