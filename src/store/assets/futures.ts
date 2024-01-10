/**
 * 资产 - 合约
 */
import produce from 'immer'
import { create } from 'zustand'

import { t } from '@lingui/macro'
import { createTrackedSelector } from 'react-tracked'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  getAssetsFuturesSettingCache,
  getPositionStrategyCache,
  setAssetsFuturesSettingCache,
  setPositionStrategyCache,
} from '@/helper/cache'
import { PositionModuleStrategyInfoProps } from '@/typings/api/assets/futures/common'
import {
  ITradePairDetailData,
  IPositionListData,
  IFuturesPositionHistoryList,
} from '@/typings/api/assets/futures/position'
import {
  TriggerPriceTypeEnum,
  EntrustTypeEnum,
  TransferAccountEnum,
  AssetsTransferTypeEnum,
  FuturesPositionViewTypeEnum,
} from '@/constants/assets/futures'
import { AssetsDictionaryTypeEnum, AssetsRecordDateTypeEnum, CurrencyNameEnum } from '@/constants/assets'
import {
  AssetsCurrencySettingsResp,
  FuturesGroupDetailResp,
  IFuturesDetailsChartData,
  FuturesAssetsResp,
  MerAssetsMarginSettingData,
  DetailMarginListChild,
  FuturesDetailMarginListResp,
  FuturesAssetsListResp,
  FuturesDetailMarginScaleDetailResp,
  FuturesAccountResp,
} from '@/typings/api/assets/futures'
import { WsBizEnum, WsThrottleTimeEnum, WsTypesEnum } from '@/constants/ws'
import { WSThrottleTypeEnum } from '@nbit/chart-utils'
import ws from '@/plugins/ws/futures'
import { PerpetualIndexPrice } from '@/plugins/ws/protobuf/ts/proto/PerpetualIndexPrice'
import { SpotAssetsChange } from '@/plugins/ws/protobuf/ts/proto/SpotAssetsChange'
import { formatCurrency } from '@/helper/decimal'
import { UserEnableEnum } from '@/constants/user'
import { getBeforeDate } from '@/helper/date'
import { IStoreEnum } from '@/typings/store/common'
import { getCodeDetailListBatch } from '@/apis/common'
import { OrderBookContractDepthSubs } from '../order-book/common'

type IStore = ReturnType<typeof getStore>
export const defaultUserAssetsFutures = {
  availableBalanceValue: '0', // 可用保证金 - 根据设置的保证金币种折算
  availableBalanceValueText: '0',
}
export const defaultFuturesDetails = {
  groupId: '',
  groupName: '',
  baseCoin: '',
  groupAsset: '0',
  marginAvailable: '0',
  positionMargin: '0',
  marginCoin: [],
  positionAsset: [],
  marginAssets: '0',
  marginAvailableScale: '0',
  unrealizedProfit: '0',
  openLockAsset: '0',
  groupCount: '0',
  isAutoAdd: UserEnableEnum.no,
  accountType: '',
  groupVoucherAmount: '0',
}
export const defaultFuturesDetailsChartData = {
  baseCoin: '',
  groupAsset: '0',
  marginAvailable: '0',
  positionMargin: '0',
  openLockAsset: '0',
  marginCoin: [],
  positionAsset: [],
  accountType: '',
  groupId: '',
}
export const defaultPositionMarginList = {
  baseCoin: '',
  list: [] as DetailMarginListChild[],
}
/** 资产总览默认值 */
export const totalDataDefault: FuturesAssetsResp = {
  /** 是否自动追加保证金 */
  isAutoAdd: false,
  /** 是否开通合约 */
  isOpen: null,
  /** 计价币 */
  baseCoin: '',
  /** 追加保证金剩余额度 */
  marginAmount: '--',
  /** 接口 api 响应结果，false 接口未响应，true 接口已响应 */
  apiState: false,
  /** 合约总资产 */
  totalPerpetualAsset: '0',
  /** 流动资产 */
  totalMarginAvailable: '0',
  /** 仓位资产 */
  totalPositionAssets: '0',
}

export const defaultTransferNewGroup = {
  coinId: '',
  groupName: t`features_future_future_group_modal_index__tl3i1-befnjeulhfk-if`,
  amount: '',
  groupId: TransferAccountEnum.newGroup,
  coinName: '',
}

export const defaultFuturesPositionHistoryForm = {
  /** 合约币对 */
  symbol: '',
  tradeInfo: {} as any,
  /** 平仓类型 */
  operationTypeCd: '',
  /** 时间类型 */
  dateType: AssetsRecordDateTypeEnum.week as any,
  /** 开始时间 */
  startTime: getBeforeDate(AssetsRecordDateTypeEnum.week) || 0,
  /** 结束时间 */
  endTime: new Date(new Date(new Date().getTime()).setHours(23, 59, 59, 59)).getTime(),
}

export const defaultFuturesPosition = {
  historyForm: defaultFuturesPositionHistoryForm,
  historyFinished: false,
  historyPositionList: [] as IFuturesPositionHistoryList[],
  liquidationDetails: {} as IFuturesPositionHistoryList,
  historyPositionTotal: 0,
  /** 历史仓位变动推送 */
  wsClosePositionHistorySubscribe: callback => {
    ws.subscribe({
      subs: { biz: WsBizEnum.perpetual, type: WsTypesEnum.closePositionHistory },
      throttleTime: WsThrottleTimeEnum.Market,
      throttleType: WSThrottleTypeEnum.cover,
      callback,
    })
  },
  wsClosePositionHistoryUnSubscribe: callback => {
    ws.unsubscribe({
      subs: { biz: WsBizEnum.perpetual, type: WsTypesEnum.closePositionHistory },
      callback,
    })
  },
}

const defaultAssetsFuturesSetting = {
  /** 是否首次进入资产合约组 Tab */
  isFirstFutures: true,
  /** 是否首次进入持仓详情 tab */
  isFirstPosition: true,
  /** 是否首次进入保证金列表 tab */
  isFirstMargin: true,
  /** 是否首次使用一键锁仓 */
  isFirstLock: true,
  /** 交易 - 是否隐藏其他合约 */
  hideOthers: false,
  /** 交易 - 持仓视图 */
  positionViewType: FuturesPositionViewTypeEnum.position,
}

const defaultPositionStrategyCache: PositionModuleStrategyInfoProps = {
  /** 止盈止损触发类型 */
  triggerPriceType: TriggerPriceTypeEnum.new,
  /** 止盈止损委托类型 */
  entrustType: EntrustTypeEnum.market,
  /** 仓位止盈触发类型 */
  profitTriggerPriceType: TriggerPriceTypeEnum.new,
  /** 仓位止盈触发类型 */
  lossTriggerPriceType: TriggerPriceTypeEnum.new,
  /** 平仓委托类型 */
  closeEntrustType: EntrustTypeEnum.limit as EntrustTypeEnum,
}

function getStore(set, get) {
  // 商户法币设置默认值
  const defaultFuturesCurrencySettings = {
    /** 国家 ID */
    countryId: 0,
    /** 法币名称 */
    currencyName: CurrencyNameEnum.usd,
    /** 法币英文名称 */
    currencyEnName: CurrencyNameEnum.usd,
    /** 国旗 */
    countryFlagImg: '',
    /** 法币符号 */
    currencySymbol: CurrencyNameEnum.usd,
    /** 法币精度 */
    offset: 2,
  }

  return {
    /** 合约组详情 */
    futuresDetails: <FuturesGroupDetailResp>defaultFuturesDetails,
    updateFuturesDetails: (values: FuturesGroupDetailResp) => {
      set((store: IStore) => {
        return produce(store, _store => {
          const newFuturesDetails = { ..._store.futuresDetails, ...values }

          _store.futuresDetails = newFuturesDetails
        })
      })
    },
    /** 合约组详情图表数据 */
    futuresDetailsChartData: <IFuturesDetailsChartData>defaultFuturesDetailsChartData,
    updateFuturesDetailsChartData: (values: IFuturesDetailsChartData) => {
      set((store: IStore) => {
        return produce(store, _store => {
          const newFuturesDetailsChartData = { ..._store.futuresDetailsChartData, ...values }

          _store.futuresDetailsChartData = newFuturesDetailsChartData
        })
      })
    },
    /** 商户保证金币种配置 */
    marginSettings: [] as MerAssetsMarginSettingData[],
    updateMarginSettings: newMarginSettings =>
      set(
        produce((store: IStore) => {
          store.marginSettings = newMarginSettings
        })
      ),
    /** 合约资金划转 */
    futuresTransferModal: {
      visible: false,
      type: AssetsTransferTypeEnum.to,
      coinId: undefined,
      groupId: '',
    },
    updateFuturesTransferModal: newFuturesTransferModal =>
      set(produce(() => ({ futuresTransferModal: newFuturesTransferModal }))),
    /** 逐仓列表筛选条件 */
    futureAccountListSearchForm: { accountType: '' },
    updateFutureAccountListSearchForm: newFutureAccountListSearchForm =>
      set(produce(() => ({ futureAccountListSearchForm: newFutureAccountListSearchForm }))),
    /** 逐仓列表 */
    futuresGroupList: [] as FuturesAccountResp[],
    updateFuturesGroupList: newFuturesGroupList =>
      set(
        produce((store: IStore) => {
          store.futuresGroupList = newFuturesGroupList
        })
      ),
    /** 合约组保证金列表 */
    marginList: defaultPositionMarginList as FuturesDetailMarginListResp,
    updateMarginList: (values: FuturesDetailMarginListResp) => {
      set((store: IStore) => {
        return produce(store, _store => {
          const newMarginList = { ..._store.marginList, ...values }

          _store.marginList = newMarginList
        })
      })
    },
    /** 合约资产首页 - 保证金资产列表 */
    futuresAssetsMarginList: {} as FuturesAssetsListResp,
    updateFuturesAssetsMarginList: (values: FuturesAssetsListResp) => {
      set((store: IStore) => {
        return produce(store, _store => {
          const newFuturesAssetsMarginList = { ..._store.futuresAssetsMarginList, ...values }

          _store.futuresAssetsMarginList = newFuturesAssetsMarginList
        })
      })
    },
    /** 合约资产详情 - 逐仓/可用/仓位保证金折算率 */
    futuresAssetsMarginScale: {} as FuturesDetailMarginScaleDetailResp,
    updateFuturesAssetsMarginScale: (values: FuturesDetailMarginScaleDetailResp) => {
      set((store: IStore) => {
        return produce(store, _store => {
          const newFuturesAssetsMarginScale = { ..._store.futuresAssetsMarginScale, ...values }

          _store.futuresAssetsMarginScale = newFuturesAssetsMarginScale
        })
      })
    },
    /**
     * 资产 - 合约组本地设置缓存
     */
    assetsFuturesSetting: !getAssetsFuturesSettingCache()
      ? defaultAssetsFuturesSetting
      : { ...defaultAssetsFuturesSetting, ...getAssetsFuturesSettingCache() },
    updateAssetsFuturesSetting: (values: any) => {
      set((store: IStore) => {
        return produce(store, _store => {
          const newAssetsFuturesSetting = { ..._store.assetsFuturesSetting, ...values }

          _store.assetsFuturesSetting = newAssetsFuturesSetting
          setAssetsFuturesSettingCache(newAssetsFuturesSetting)
        })
      })
    },
    positionModule: {
      strategyInfo: !getPositionStrategyCache()
        ? defaultPositionStrategyCache
        : { ...defaultPositionStrategyCache, ...getPositionStrategyCache() },
      updateStrategyInfo: (newStrategyInfo: any) =>
        set((store: IStore) => {
          return produce(store, _store => {
            const newPositionModule = { ..._store.positionModule, strategyInfo: newStrategyInfo }
            _store.positionModule = newPositionModule
            setPositionStrategyCache(newStrategyInfo)
          })
        }),
    },
    /** 合约资产总览 */
    assetsFuturesOverview: totalDataDefault as FuturesAssetsResp,
    updateAssetsFuturesOverview: newAssetsFuturesOverview =>
      set(produce(() => ({ assetsFuturesOverview: newAssetsFuturesOverview }))),
    /** 当前持仓操作 loading 状态 */
    positionListLoading: <boolean>false,
    updatePositionListLoading: (newPositionListLoading: boolean) =>
      set(produce(() => ({ positionListLoading: newPositionListLoading }))),
    /** 合约币对详情 */
    tradePairDetail: <ITradePairDetailData>{},
    /** 合约资产 - 交易页用 */
    userAssetsFutures: defaultUserAssetsFutures,
    /** 合约持仓列表 - 交易页用 */
    positionListFutures: <IPositionListData[]>[],
    /** 合约 - 商户法币配置 */
    futuresCurrencySettings: defaultFuturesCurrencySettings as AssetsCurrencySettingsResp,
    updateFuturesCurrencySettings: (values: AssetsCurrencySettingsResp) =>
      set((store: IStore) => {
        return produce(store, _store => {
          const newFuturesCurrencySettings = { ..._store.futuresCurrencySettings, ...values }
          _store.futuresCurrencySettings = newFuturesCurrencySettings
        })
      }),
    /** 订阅 - 合约组详情和仓位信息 */
    wsPerpetualGroupDetailSubscribe: (callback, type = WSThrottleTypeEnum.cover) => {
      ws.subscribe({
        subs: { biz: WsBizEnum.perpetual, type: WsTypesEnum.perpetualGroupDetail },
        throttleTime: WsThrottleTimeEnum.Market,
        throttleType: type,
        callback,
      })
    },
    /** 取消订阅 - 合约组详情和仓位信息 */
    wsPerpetualGroupDetailUnSubscribe: callback => {
      ws.unsubscribe({
        subs: { biz: WsBizEnum.perpetual, type: WsTypesEnum.perpetualGroupDetail },
        callback,
      })
    },
    /** 推送回调 - 合约组可用资产 - 现货资产购买力 */
    async wsSpotAssetsChangeCallback(SpotAssetsData: SpotAssetsChange) {
      const data = SpotAssetsData[0]
      const store: IStore = get()
      const offset = store.futuresCurrencySettings.offset
      const newAssetData = {
        availableBalanceValue: data.assets,
        availableBalanceValueText: formatCurrency(String(data.assets), offset || 2),
      }

      store.updateUserAssetsFutures(newAssetData)
    },
    /** 订阅 - 合约组可用资产 - 现货资产购买力 */
    wsSpotAssetsChangeSubscribe: () => {
      const state: IStore = get()
      ws.subscribe({
        subs: { biz: WsBizEnum.perpetual, type: WsTypesEnum.spotAssetsChange },
        throttleTime: WsThrottleTimeEnum.Market,
        throttleType: WSThrottleTypeEnum.cover,
        callback: state.wsSpotAssetsChangeCallback,
      })
    },
    /** 取消订阅 - 合约组可用资产 - 现货资产购买力 */
    wsSpotAssetsChangeUnSubscribe: () => {
      const state: IStore = get()
      ws.unsubscribe({
        subs: { biz: WsBizEnum.perpetual, type: WsTypesEnum.spotAssetsChange },
        callback: state.wsSpotAssetsChangeCallback,
      })
    },
    /** 对手价 */
    positionDepthPrice: '',
    updatePositionDepthPrice: (value: string) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.positionDepthPrice = value
        })
      }),
    /** 对手盘价格推送 */
    wsDepthSubscribe: (code: string, callback) => {
      ws.subscribe({
        subs: OrderBookContractDepthSubs(code),
        throttleTime: WsThrottleTimeEnum.Medium,
        throttleType: WSThrottleTypeEnum.cover,
        callback,
      })
    },
    wsDepthUnSubscribe: (code: string, callback) => {
      ws.unsubscribe({
        subs: OrderBookContractDepthSubs(code),
        callback,
      })
    },

    /** 最新价格/最新成交价 */
    positionDealPrice: '',
    updatePositionDealPrice: (value: string) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.positionDealPrice = value
        })
      }),
    wsDealPriceCallback: (DealPriceData: any) =>
      set((store: IStore) => {
        DealPriceData = DealPriceData[0]

        return produce(store, _store => {
          _store.positionDealPrice = DealPriceData.price
        })
      }),
    /** 订阅 - 最新价格推送 */
    wsDealSubscribe: (subs, callback?) => {
      const state: IStore = get()
      ws.subscribe({
        subs,
        throttleTime: WsThrottleTimeEnum.Medium,
        throttleType: WSThrottleTypeEnum.cover,
        callback: callback || state.wsDealPriceCallback,
      })
    },
    /** 取消订阅 - 最新价格推送 */
    wsDealUnSubscribe: (subs, callback?) => {
      const state: IStore = get()
      ws.unsubscribe({
        subs,
        callback: callback || state.wsDealPriceCallback,
      })
    },
    /** 标记价格 */
    positionMarkPrice: '',
    updatePositionMarkPrice: (value: string) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.positionMarkPrice = value
        })
      }),
    wsMarkPriceCallback: (MarkPriceData: PerpetualIndexPrice) =>
      set((store: IStore) => {
        MarkPriceData = MarkPriceData[0]
        return produce(store, _store => {
          _store.positionMarkPrice = MarkPriceData.markPrice
        })
      }),
    /** 订阅 - 标记价格推送 */
    wsMarkPriceSubscribe: (subs, callback?) => {
      const state: IStore = get()
      ws.subscribe({
        subs,
        throttleTime: WsThrottleTimeEnum.Medium,
        throttleType: WSThrottleTypeEnum.cover,
        callback: callback || state.wsMarkPriceCallback,
      })
    },
    wsMarkPriceUnSubscribe: (subs, callback?) => {
      const state: IStore = get()
      ws.unsubscribe({
        subs,
        callback: callback || state.wsMarkPriceCallback,
      })
    },
    /** 持仓列表 symbolWassName */
    positionSymbolWassNameList: [] as string[],
    updatePositionSymbolWassNameList: (value: string[]) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.positionSymbolWassNameList = value
        })
      }),
    updateUserAssetsFutures: newUserAssetsFutures => set(produce(() => ({ userAssetsFutures: newUserAssetsFutures }))),
    updatePositionListFutures: newPositionListFutures =>
      set(produce(() => ({ positionListFutures: newPositionListFutures }))),
    updateTradePairDetail: newTradePairDetail => set(produce(() => ({ tradePairDetail: newTradePairDetail }))),
    /** 合约仓位页面 */
    futuresPosition: defaultFuturesPosition,
    updateFuturesPosition: values => {
      set((store: IStore) => {
        return produce(store, _store => {
          const newFuturesPosition = { ..._store.futuresPosition, ...values }
          _store.futuresPosition = newFuturesPosition
        })
      })
    },
    futuresEnums: {
      /** 强平类型 */
      historyPositionCloseTypeEnum: {
        codeKey: AssetsDictionaryTypeEnum.perpetualCloseType,
        enums: [],
      } as IStoreEnum,
      /** 账户类型 */
      perpetualAccountTypeEnum: {
        codeKey: AssetsDictionaryTypeEnum.perpetualAccountType,
        enums: [],
      } as IStoreEnum,
    },
    async fetchFuturesEnums() {
      const state: IStore = get()
      const data = await getCodeDetailListBatch(Object.values(state.futuresEnums).map(item => item.codeKey))
      set(
        produce((draft: IStore) => {
          const items = Object.values(draft.futuresEnums)
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
  }
}

const baseAssetsFuturesStore = create(subscribeWithSelector(getStore))

const useAssetsFuturesStore = createTrackedSelector(baseAssetsFuturesStore)

export { useAssetsFuturesStore, baseAssetsFuturesStore }
