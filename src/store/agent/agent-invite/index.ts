import { create } from 'zustand'

import { createTrackedSelector } from 'react-tracked'
import produce from 'immer'
import { devtools } from 'zustand/middleware'
import {
  useAgentInviteAnalysis,
  useAgentInviteInfoList,
  useAgentInviteInfoOverviewInit,
  useAgentInviteRebateRecordsV2,
  useAgentInviteTableCheckMoreV2,
  useGetContractStatusCode,
} from '@/hooks/features/agent/invite'
import {
  YapiPostV1AgentInviteDetailsApiResponseReal,
  YapiPostV1AgentInviteDetailsListMembersReal,
  YapiPostV1AgentRebateLogsApiRequestReal,
  YapiPostV2AgentInviteHistoryApiRequestReal,
} from '@/typings/api/agent-old/invite'
import {
  AgentProductTypeEnum,
  getDefaultLast30DaysStartAndEnd,
  InviteDetailsUidTypeEnum,
  inviteFilterFormHelper,
  YesOrNoEnum,
} from '@/constants/agent/invite'
import { YapiGetV1AgentInvitationCodeQueryMaxData } from '@/typings/yapi/AgentInvitationCodeQueryMaxV1GetApi'
import { YapiGetV1AgentInvitationCodeQueryProductCdData } from '@/typings/yapi/AgentInvitationCodeQueryProductCdV1GetApi'
// import { postV1AgentRebateLogsApiRequest, postV2AgentInviteHistoryApiRequest } from '@/apis/agent-old/invite-v2'
import {
  getV1AgentInvitationCodeQueryProductCdApiRequest,
  postV2AgentInviteDetailsAnalysisApiRequest,
} from '@/apis/agent'

type TStore = ReturnType<typeof getStore>
export type IAgentInviteStore = TStore

export function getDefaultChartFilterSetting() {
  return {
    startDate: undefined,
    endDate: undefined,
  }
}

function defaultPageConfig() {
  return {
    finished: false,
    page: 1,
    pageSize: 20,
  }
}

function getDefaultRebateRecordsSetting() {
  const defaultTime = getDefaultLast30DaysStartAndEnd()
  return {
    startDate: defaultTime.startDate,
    endDate: defaultTime.endDate,
    isGrant: YesOrNoEnum.all as any,
    productCd: AgentProductTypeEnum.total,
  } as YapiPostV1AgentRebateLogsApiRequestReal
}

function getDefaultFilterFormSetting() {
  const defaultTime = getDefaultLast30DaysStartAndEnd()
  return {
    startDate: defaultTime.startDate,
    endDate: defaultTime.endDate,
    levelLimit: '',
    productCd: AgentProductTypeEnum.total,
    queryType: InviteDetailsUidTypeEnum.myUid,
  } as YapiPostV2AgentInviteHistoryApiRequestReal
}

function getStore(set) {
  return {
    isEncrypt: false,
    toggleEncrypt: () => {
      set(
        produce((draft: TStore) => {
          draft.isEncrypt = !draft.isEncrypt
        })
      )
    },
    isInfoPopUnderOpen: [],
    setInfoPopUnderState: callback =>
      set(
        produce((draft: TStore) => {
          draft.isInfoPopUnderOpen = callback(draft.isInfoPopUnderOpen)
        })
      ),
    isFilterFormOpen: false,
    toggleFilterForm: () =>
      set(
        produce((draft: TStore) => {
          draft.isFilterFormOpen = !draft.isFilterFormOpen
        })
      ),

    isFilterFormOpenCheckMore: false,
    toggleFilterFormCheckMore: () =>
      set(
        produce((draft: TStore) => {
          draft.isFilterFormOpenCheckMore = !draft.isFilterFormOpenCheckMore
        })
      ),

    checkMoreTableUpUidHide: false,
    toggleCheckMoreUpUidHide() {
      set(
        produce((draft: TStore) => {
          draft.checkMoreTableUpUidHide = !draft.checkMoreTableUpUidHide
        })
      )
    },

    page: defaultPageConfig(),

    setPage: setting =>
      set(
        produce((draft: TStore) => {
          draft.page = {
            ...draft.page,
            ...setting,
          }
        })
      ),

    filterSettingCheckMoreActiveUid: '',
    setFilterSettingCheckMoreActiveUid(id: any) {
      set(
        produce((draft: TStore) => {
          draft.filterSettingCheckMoreActiveUid = id
        })
      )
    },

    filterSettingCheckMoreV2: getDefaultFilterFormSetting(),
    resetFilterSettingCheckMoreV2() {
      set(
        produce((draft: TStore) => {
          draft.filterSettingCheckMoreV2 = getDefaultFilterFormSetting()
        })
      )
    },
    setFilterSettingCheckMoreV2: (setting: YapiPostV2AgentInviteHistoryApiRequestReal) => {
      set(
        produce((draft: TStore) => {
          const merged = {
            ...draft.filterSettingCheckMoreV2,
            ...setting,
          }
          draft.filterSettingCheckMoreV2 = merged
        })
      )
    },

    filterRebateRecordsV2: getDefaultRebateRecordsSetting(),
    resetFilterRebateRecordsV2() {
      set(
        produce((draft: TStore) => {
          draft.filterRebateRecordsV2 = getDefaultRebateRecordsSetting()
        })
      )
    },
    setFilterRebateRecordsV2: (setting: YapiPostV1AgentRebateLogsApiRequestReal) => {
      set(
        produce((draft: TStore) => {
          const merged = {
            ...draft.filterRebateRecordsV2,
            ...setting,
          }
          draft.filterRebateRecordsV2 = merged
        })
      )
    },

    isSearchFocused: false,
    setOnSearchFocus(val: boolean) {
      set(
        produce((draft: TStore) => {
          draft.isSearchFocused = val
        })
      )
    },

    searchInput: '',
    setSearchInput(val: string) {
      set(
        produce((draft: TStore) => {
          draft.searchInput = val
        })
      )
    },

    chartFilterSetting: getDefaultChartFilterSetting(),
    setChartFilterSetting: setting =>
      set(
        produce((draft: TStore) => {
          draft.chartFilterSetting = {
            ...draft.chartFilterSetting,
            ...setting,
          }
        })
      ),

    selectedInvited: {} as YapiPostV1AgentInviteDetailsListMembersReal,
    setSelectedInvited: (data: YapiPostV1AgentInviteDetailsListMembersReal) =>
      set(
        produce((draft: TStore) => {
          draft.selectedInvited = data
        })
      ),

    contractStatusCode: {} as any,
    setContractStatusCode(data) {
      set(
        produce((draft: TStore) => {
          draft.contractStatusCode = data
        })
      )
    },

    // async fetchProductLines() {
    //   getV1AgentInvitationCodeQueryMaxApiRequest({}).then(res => {
    //     if (res.isOk) {
    //       set(
    //         produce((draft: TStore) => {
    //           draft.cache.productLineEnabledState = res.data || {}
    //         })
    //       )
    //     }
    //   })
    // },

    // 叠加代理商开通的产品
    async fetchProductLinesWithFee() {
      getV1AgentInvitationCodeQueryProductCdApiRequest({}).then(res => {
        if (res.isOk) {
          set(
            produce((draft: TStore) => {
              draft.cache.productLineEnabledStateWithFee = res.data || {}
            })
          )
        }
      })
    },

    apis: {
      // overviewInitApi: useAgentInviteInfoOverviewInit,
      // inviteDetailsApi: postV1AgentInviteDetailsApiRequest,
      // inviteDetailsAnalysisApi: postV2AgentInviteDetailsAnalysisApiRequest,
      // inviteDetailsCheckMoreTableApi: postV1AgentInviteHistoryApiRequest,
      // inviteDetailsCheckMoreTableApiV2: postV2AgentInviteHistoryApiRequest,
      // inviteDetailsRebateRecordsApiV2: postV1AgentRebateLogsApiRequest,
    },
    cache: {
      productLineEnabledState: {} as Partial<YapiGetV1AgentInvitationCodeQueryMaxData>,
      productLineEnabledStateWithFee: {} as Partial<YapiGetV1AgentInvitationCodeQueryProductCdData>,

      overviewInit: {} as YapiPostV1AgentInviteDetailsApiResponseReal,
      setOverviewInit(data?: YapiPostV1AgentInviteDetailsApiResponseReal) {
        set(
          produce((draft: TStore) => {
            draft.cache.overviewInit = data || {}
          })
        )
      },
      setProductLineEnabledStateWithFee(data) {
        set(
          produce((draft: TStore) => {
            draft.cache.productLineEnabledStateWithFee = data || {}
          })
        )
      },
    },
    hooks: {
      useAgentInviteInfoOverviewInit,
      useAgentInviteInfoList,
      useAnalysis: useAgentInviteAnalysis,
      // useInviteDetailsAnalysis,
      useGetContractStatusCode,
      // useAgentInviteTableCheckMoreV2,
      useAgentInviteRebateRecordsV2,
    },
    helper: inviteFilterFormHelper,
  }
}

const baseAgentInviteStore = create(devtools(getStore, { name: 'market-agent-invite-store' }))

const useAgentInviteStore = createTrackedSelector(baseAgentInviteStore)

export { useAgentInviteStore, baseAgentInviteStore }
