/**
 * 代理商中心
 */
import produce from 'immer'
import create from 'zustand'
import { createTrackedSelector } from 'react-tracked'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  getAgentCenterCurrentCurrencyCache,
  getAgentCenterEncryptionCache,
  setAgentCenterCurrentCurrencyCache,
  setAgentCenterEncryptionCache,
} from '@/helper/cache/agent'
import {
  AgentCenterTimeTypeEnum,
  DateTypeEnum,
  IAgentCurrencyList,
  InviteDetailRegisterSortTypeEnum,
} from '@/constants/agent/agent-center'
import {
  IAgentCenterEarningsDetailReq,
  IAgentCenterEarningsDetailResp,
  IAgentCenterInviteDetailData,
  IAgentCenterInviteDetailReq,
  IAgentCenterInviteDetailResp,
  IAgentCenterOverviewDataReq,
  IAgentCenterOverviewDataResp,
} from '@/typings/api/agent/agent-center'
import dayjs from 'dayjs'

type IStore = ReturnType<typeof getStore>

export const defaultOverviewParams = {
  /** 合约币对 */
  model: '',
  dateType: DateTypeEnum.today,
  /** 开始时间 */
  startTime: dayjs().startOf('date').valueOf(),
  /** 结束时间 */
  endTime: dayjs().endOf('date').valueOf(),
}

export const initRebateDetailForm = {
  productCd: '',
  startTime: new Date(new Date(new Date().getTime()).setHours(0, 0, 0, 0)).getTime(),
  endTime: new Date(new Date(new Date().getTime()).setHours(23, 59, 59, 59)).getTime(),
  rebateType: '',
  minAmount: '',
  maxAmount: '',
  rebateLevel: 0,
  pageNum: 1,
  pageSize: 10,
}

export const initInviteDetailForm = {
  registerDateSort: InviteDetailRegisterSortTypeEnum.default,
  rebateLevel: '',
  isRealName: 0,
  teamNumMin: '',
  teamNumMax: '',
  startTime: 0,
  endTime: 0,
  pageNum: 1,
  pageSize: 10,
  uid: '',
}

export const defaultOverviewTimeTab = AgentCenterTimeTypeEnum.today

function getStore(set, get) {
  return {
    /** 用户代理模式列表（tab） */
    userAgentList: [] as string[],
    updateUserAgentList: (newUserAgentList: string[]) => {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.userAgentList = newUserAgentList
        })
      })
    },
    /** 当前选中代理模式 tab */
    currentModalTab: '' as string,
    updateCurrentModalTab: (newCurrentModalTab: string) => {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.currentModalTab = newCurrentModalTab
        })
      })
    },
    /** 总览时间选中 tab */
    overviewTimeTab: defaultOverviewTimeTab as string,
    updateOverviewTimeTab: (newOverviewTimeTab: string) => {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.overviewTimeTab = newOverviewTimeTab
        })
      })
    },
    /** 总览筛选条件 */
    overviewParams: defaultOverviewParams as IAgentCenterOverviewDataReq,
    updateOverviewParams: (newOverviewParams: IAgentCenterOverviewDataReq) => {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.overviewParams = newOverviewParams
        })
      })
    },
    /** 总览数据 */
    overviewData: {} as IAgentCenterOverviewDataResp,
    updateOverviewData: (newOverviewData: IAgentCenterOverviewDataResp) => {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.overviewData = newOverviewData
        })
      })
    },
    /** 返佣详情筛选表单 */
    rebateDetailForm: initRebateDetailForm as IAgentCenterEarningsDetailReq,
    updateRebateDetailForm: newRebateDetailForm =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.rebateDetailForm = { ..._store.rebateDetailForm, ...newRebateDetailForm }
        })
      }),
    /** 返佣详情 */
    rebateData: {} as IAgentCenterEarningsDetailResp,
    updateRebateData: (newRebateData: IAgentCenterEarningsDetailResp) => {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.rebateData = newRebateData
        })
      })
    },
    /** 邀请详情筛选表单 */
    inviteDetailForm: initInviteDetailForm as IAgentCenterInviteDetailReq,
    updateInviteDetailForm: (newInviteDetailForm: IAgentCenterInviteDetailReq) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.inviteDetailForm = { ..._store.inviteDetailForm, ...newInviteDetailForm }
        })
      }),
    /** 邀请详情 */
    inviteDetail: {} as IAgentCenterInviteDetailResp,
    updateInviteDetail: (newInviteDetail: IAgentCenterInviteDetailResp) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.inviteDetail = { ..._store.inviteDetail, ...newInviteDetail }
        })
      }),
    /** 是否隐藏代理中心金额 */
    encryption: getAgentCenterEncryptionCache() || false,
    updateEncryption: (newEncryption: boolean) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.encryption = newEncryption
          setAgentCenterEncryptionCache(newEncryption)
        })
      }),
    /** 获取当前用户产品线 */
    productLine: [] as string[],
    updateProductLine: newProductLine =>
      set(
        produce((store: IStore) => {
          store.productLine = newProductLine
        })
      ),
    /** 代理商法币列表 */
    agentCurrencyList: [] as IAgentCurrencyList[],
    updateAgentCurrencyList: (newAgentCurrencyList: IAgentCurrencyList[]) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.agentCurrencyList = newAgentCurrencyList
        })
      }),
    /** 当前法币 */
    currentCurrency: (getAgentCenterCurrentCurrencyCache() as IAgentCurrencyList) || ({} as IAgentCurrencyList),
    updateCurrentCurrency: (newCurrentCurrency: IAgentCurrencyList) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.currentCurrency = newCurrentCurrency
          setAgentCenterCurrentCurrencyCache(newCurrentCurrency)
        })
      }),
    /** 是否展示法币搜索弹框 */
    visibleCurrencyListModal: false,
    updateVisibleCurrencyListModal: newVisibleCurrencyListModal =>
      set(
        produce((store: IStore) => {
          store.visibleCurrencyListModal = newVisibleCurrencyListModal
        })
      ),
    /** 邀请详情 - 区域代理等级列表 */
    areaAgentLevelList: [] as number[],
    updateAreaAgentLevelList: (newAreaAgentLevelList: number[]) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.areaAgentLevelList = newAreaAgentLevelList
        })
      }),
  }
}

const baseAgentCenterStore = create(subscribeWithSelector(getStore))

const useAgentCenterStore = createTrackedSelector(baseAgentCenterStore)

export { useAgentCenterStore, baseAgentCenterStore }
