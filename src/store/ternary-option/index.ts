import { create } from 'zustand'
import produce from 'immer'
import { createTrackedSelector } from 'react-tracked'
import {
  MarketCoinTab,
  restShareTimeList,
  initCurrentCoin,
  defaultFuturesCoinFixedInfo,
  initDescribe,
  totalTernaryShareTimeList,
  initialTernaryShareTimeList,
} from '@/constants/market'
import { YapiGetV1TradePairListData } from '@/typings/yapi/TradePairListV1GetApi'
import { uniqBy } from 'lodash'
import { getTradePairFuturesHistoryQuickSelectCache, setTradePairFuturesHistoryQuickSelectCache } from '@/helper/cache'
import { YapiGetV1CoinQueryMainCoinListCoinListData } from '@/typings/yapi/CoinQueryMainCoinListV1GetApi'
import { YapiGetV1PerpetualTradePairDetailData } from '@/typings/yapi/PerpetualTradePairDetailV1GetApi'
import { wsContractTradePairSubSlow } from '@/helper/market/market-list/market-ws'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import {
  TernaryOptionDictionaryEnum,
  TernaryOptionIdEnum,
  TernaryOptionTradeDirectionEnum,
  TernaryTabTypeEnum,
} from '@/constants/ternary-option'
import { IStoreEnum } from '@/typings/store/common'
import { getCodeDetailListBatch } from '@/apis/common'
import { IOptionCurrentPositionList } from '@/typings/api/ternary-option/position'
import ws from '@/plugins/ws/option'
import { WsBizEnum, WsThrottleTimeEnum, WsTypesEnum } from '@/constants/ws'
import { WSThrottleTypeEnum } from '@/plugins/ws/constants'
import { PlanEntrustedDepthSubs } from '@/store/ternary-option/common'
import { YapiGetV1OptionTradePairListData } from '@/typings/yapi/OptionTradePairListV1GetApi'
import { OptionMarket } from '@/plugins/ws/protobuf/ts/proto/OptionMarket'
import { onGetPositionProfit } from '@/helper/ternary-option/position'

type IStore = ReturnType<typeof getStore>
export type IMarketFuturesStore = IStore

enum MarketCoinEnum {
  initial,
  add,
}

function getStore(set, get) {
  return {
    storeName: 'futures',
    marketChangesTime: 0,
    updateMarketChangesTime: newMarketChangesTime => set(() => ({ marketChangesTime: newMarketChangesTime })),
    isSubscribed: false,
    setIsSubscribed: (key, val) =>
      set((store: IStore) => {
        const newStore = produce(store, _store => {
          _store.isSubscribed = val
        })
        return newStore
      }),
    totalShareTimeList: totalTernaryShareTimeList,
    initialShareTimeList: initialTernaryShareTimeList,
    updateInitialShareTimeList: newInitialShareTimeList =>
      set(
        produce((state: IStore) => {
          state.initialShareTimeList = newInitialShareTimeList
        })
      ),
    restShareTimeList,
    updateRestShareTimeList: newRestShareTimeList =>
      set(
        produce((state: IStore) => {
          state.restShareTimeList = newRestShareTimeList
        })
      ),
    currentMarketCoinTab: MarketCoinTab.Kline,
    updateCurrentMarketCoinTab: newCurrentMarketCoinTab =>
      set(
        produce((state: IStore) => {
          state.currentMarketCoinTab = newCurrentMarketCoinTab
        })
      ),
    currentInitPrice: {
      // 当前选中的买/卖价格
      buyPrice: '21469.55',
      sellPrice: '21469.55',
      total: '1',
    },
    updateCurrentInitPrice: newCurrentInitPrice =>
      set(
        produce((state: IStore) => {
          state.currentInitPrice = newCurrentInitPrice
        })
      ),

    defaultCoin: defaultFuturesCoinFixedInfo,
    updateDefaultCoin: (data: YapiGetV1PerpetualTradePairDetailData) => {
      set(() => {
        if (data && data.symbolName) {
          return { defaultCoin: data }
        }
        return {}
      })
    },

    currentCoin: initCurrentCoin as any,
    updateCurrentCoin: newCurrentCoin => {
      // 统一兼容处理
      const newCoin = { ...newCurrentCoin }
      // newCoin.tradeId = newCoin.id
      newCoin.change = newCoin.chg
      newCoin.sellSymbol = newCoin.baseSymbolName
      newCoin.buySymbol = newCoin.quoteSymbolName

      set((state: IStore) => {
        return { currentCoin: newCoin }
      })
    },
    allTradePairs: [] as YapiGetV1OptionTradePairListData[],
    updateAllTradePairs(data: YapiGetV1OptionTradePairListData[]) {
      set(
        produce((state: IStore) => {
          state.allTradePairs = data
        })
      )
    },
    describe: initDescribe, // 币种资料
    updateCurrentCoinDescribe: newCurrentCoinDescribe =>
      set(
        produce((state: IStore) => {
          state.describe = newCurrentCoinDescribe
        })
      ),
    klineCallback(value) {},
    updateKlineCallback: newKlineCallback =>
      set(
        produce((state: IStore) => {
          state.klineCallback = newKlineCallback
        })
      ),
    coinHistoryKline: {
      r: '',
      t: new Date().getTime(),
    },
    updateCoinHistoryKline: newCoinHistoryKline =>
      set(
        produce((state: IStore) => {
          state.coinHistoryKline = newCoinHistoryKline
        })
      ),
    coinSelectedHistoryList: [] as YapiGetV1TradePairListData[],
    getTradePairHistoryQuickSelectCache: getTradePairFuturesHistoryQuickSelectCache,
    updateCoinSelectedHistoryList: (
      newTradePair: YapiGetV1TradePairListData[],
      // 是否改变历史快捷选择的位置，默认为改变
      isHistoryInPlace = false
    ) => {
      set(
        produce((state: IStore) => {
          if (
            isHistoryInPlace &&
            newTradePair.length === 1 &&
            state.coinSelectedHistoryList.find(x => x.id === newTradePair[0].id)
          ) {
            return
          }
          const latest = uniqBy([...newTradePair, ...state.coinSelectedHistoryList], x => x.id)
            .filter(x => !!x.symbolName)
            .slice(0, 10)
          state.coinSelectedHistoryList = latest
          setTradePairFuturesHistoryQuickSelectCache(latest)
        })
      )
    },
    removeCoinSelectedHistoryList: (toBeRemoved: YapiGetV1TradePairListData) => {
      set(
        produce((state: IStore) => {
          const latest = state.coinSelectedHistoryList.filter(x => x.id !== toBeRemoved.id).slice()
          state.coinSelectedHistoryList = latest
          setTradePairFuturesHistoryQuickSelectCache(latest)
        })
      )
    },
    cleanCoinSelectedHistoryList: () => {
      set(
        produce((state: IStore) => {
          state.coinSelectedHistoryList = []
          setTradePairFuturesHistoryQuickSelectCache([])
        })
      )
    },
    allCoinSymbolInfo: [] as YapiGetV1CoinQueryMainCoinListCoinListData[],
    udpateAllCoinSymbolInfo(data: YapiGetV1CoinQueryMainCoinListCoinListData[]) {
      set(
        produce((state: IStore) => {
          state.allCoinSymbolInfo = data
        })
      )
    },
    wsSubscription: wsContractTradePairSubSlow,
    /** 当前持仓 */
    positionListOption: [] as IOptionCurrentPositionList[],
    updatePositionListOption: newPositionListOption =>
      set(produce(() => ({ positionListOption: newPositionListOption }))),
    /** 持仓 symbol */
    positionSymbolList: [] as string[],
    updatePositionSymbolList: (value: string[]) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.positionSymbolList = value
        })
      }),
    /** 期权法币设置 */
    optionCurrencySetting: [] as string[],
    updateOptionCurrencySetting: (value: string[]) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.optionCurrencySetting = value
        })
      }),
    /** 三元期权数据字典 */
    optionDictionaryEnums: {
      /** 价格取值来源 */
      optionsPriceSourceEnum: {
        codeKey: TernaryOptionDictionaryEnum.optionsPriceSource,
        enums: [],
      } as IStoreEnum,
      /** 结算周期 */
      productPeriodCdEnum: {
        codeKey: TernaryOptionDictionaryEnum.productPeriodCd,
        enums: [],
      } as IStoreEnum,
      /** 涨跌方向 */
      optionsSideIndEnum: {
        codeKey: TernaryOptionDictionaryEnum.optionsSideInd,
        enums: [],
      } as IStoreEnum,
      /** 数据来源 */
      optionsSourceEnum: {
        codeKey: TernaryOptionDictionaryEnum.optionsSource,
        enums: [],
      } as IStoreEnum,
    },
    /** 三元期权数据字典 */
    async fetchOptionDictionaryEnums() {
      const state: IStore = get()
      const data = await getCodeDetailListBatch(Object.values(state.optionDictionaryEnums).map(item => item.codeKey))
      set(
        produce((draft: IStore) => {
          const items = Object.values(draft.optionDictionaryEnums)
          items.forEach((item, index) => {
            item.enums = data[index].map(enumValue => {
              return {
                label: enumValue.codeKey,
                value:
                  parseInt(enumValue.codeVal, 10).toString() === enumValue.codeVal
                    ? parseInt(enumValue.codeVal, 10)
                    : enumValue.codeVal,
              }
            })
          })
        })
      )
    },
    directionList: [], // 方向
    setDirectionList: data =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.directionList = data
        })
      }),

    coinType: '', // 币种类型
    setCoinType: data =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.coinType = data
        })
      }),
    planTableNum: MarketCoinEnum.initial,
    setPlanTableNum: data =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.planTableNum = data
        })
      }),

    // 订单的接收
    orderWsNum: MarketCoinEnum.initial,
    wsOptionOrderCallback: value =>
      set(
        produce((draft: IStore) => {
          draft.orderWsNum += MarketCoinEnum.add
        })
      ),
    /** 三元期权订单/持仓状态推送-订阅 */
    wsOptionOrderSubscribe: (callback?) => {
      const state: IStore = get()
      ws.subscribe({
        subs: { biz: WsBizEnum.option, type: WsTypesEnum.optionOrder },
        throttleTime: WsThrottleTimeEnum.Market,
        throttleType: WSThrottleTypeEnum.cover,
        callback: callback || state.wsOptionOrderCallback,
      })
    },
    /** 三元期权订单/持仓状态推送-取消订阅 */
    wsOptionOrderUnSubscribe: (callback?) => {
      const state: IStore = get()
      ws.unsubscribe({
        subs: { biz: WsBizEnum.option, type: WsTypesEnum.optionOrder },
        callback: callback || state.wsOptionOrderCallback,
      })
    },
    /** 24 小时行情价格推送 - 回调 */
    wsMarkPriceCallback: (markPriceData: OptionMarket) => {
      const state: IStore = get()
      set((store: IStore) => {
        return produce(store, _store => {
          markPriceData = markPriceData[0]

          const newPositionList = state.positionListOption?.map((item: IOptionCurrentPositionList) => {
            if (item.symbol === markPriceData.symbol) {
              const currentPrice = markPriceData?.last
              const profitVal = onGetPositionProfit(item, currentPrice)

              return { ...item, currentPrice: markPriceData?.last, unrealizedProfit: profitVal }
            }
            return item
          })
          _store.positionListOption = newPositionList
        })
      })
    },
    /** 24 小时行情价格推送 - 订阅 */
    wsMarkPriceSubscribe: subs => {
      const state: IStore = get()
      ws.subscribe({
        subs,
        throttleTime: WsThrottleTimeEnum.Medium,
        throttleType: WSThrottleTypeEnum.cover,
        callback: state.wsMarkPriceCallback,
      })
    },
    /** 24 小时行情价格推送 - 取消订阅 */
    wsMarkPriceUnSubscribe: subs => {
      const state: IStore = get()
      ws.unsubscribe({
        subs,
        callback: state.wsMarkPriceCallback,
      })
    },

    // 计划委托的接收
    planWsNum: MarketCoinEnum.initial,
    wsPlanEntrustedDepthCallback: value => {
      set(
        produce((draft: IStore) => {
          draft.planWsNum += MarketCoinEnum.add
        })
      )
    },

    // 计划委托的订阅
    wsPlanEntrustedDepthSubscribe: () => {
      const state: IStore = get()
      ws.subscribe({
        subs: PlanEntrustedDepthSubs(),
        throttleTime: WsThrottleTimeEnum.Market,
        throttleType: WSThrottleTypeEnum.increment,
        callback: state.wsPlanEntrustedDepthCallback,
      })
    },
    // 取消计划委托的订阅
    wsPlanEntrustedDepthUnSubscribe: () => {
      const state: IStore = get()
      ws.unsubscribe({
        subs: PlanEntrustedDepthSubs(),
        callback: state.wsPlanEntrustedDepthCallback,
      })
    },
    // tabs 切换
    optionTab: TernaryTabTypeEnum.position,
    setOptionTab: (data: TernaryTabTypeEnum) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.optionTab = data
        })
      }),
    optionBuyCallback(value) {},
    updateOptionBuyCallback: newOptionBuyCallback =>
      set(
        produce((state: IStore) => {
          state.optionBuyCallback = newOptionBuyCallback
        })
      ),
    optionSellCallback(value) {},
    updateOptionSellCallback: newOptionSellCallback =>
      set(
        produce((state: IStore) => {
          state.optionSellCallback = newOptionSellCallback
        })
      ),
    countDownComponent(value) {},
    updateCountDownComponent: newCountDownComponent =>
      set(
        produce((state: IStore) => {
          state.countDownComponent = newCountDownComponent
        })
      ),
    tradeRestSecond: 0,
    updateTradeRestSecond: newTradeRestSecond =>
      set(
        produce((state: IStore) => {
          state.tradeRestSecond = newTradeRestSecond
        })
      ),
    optionActiveTab: TernaryOptionIdEnum.binaryOption,
    updateOptionActiveTab: newOptionActiveTab =>
      set(
        produce((state: IStore) => {
          state.optionActiveTab = newOptionActiveTab
        })
      ),
  }
}

const baseTernaryOptionStore = create(devtools(subscribeWithSelector(getStore), { name: 'ternary-option-store' }))

const useTernaryOptionStore = createTrackedSelector(baseTernaryOptionStore)

export { useTernaryOptionStore, baseTernaryOptionStore }
