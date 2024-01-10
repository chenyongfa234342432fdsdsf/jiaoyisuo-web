import { YapiGetV1PerpetualTradePairDetailData } from "@/typings/yapi/PerpetualTradePairDetailV1GetApi"

export type ITernaryOptionCoinDetail = YapiGetV1PerpetualTradePairDetailData & {
  assetFeeRate: number
 }
