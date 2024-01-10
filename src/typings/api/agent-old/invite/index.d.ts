import { InviteDetailsUidTypeEnum, InviteFilterInviteTypeEnum, InviteFilterKycEnum, InviteFilterSortEnum, YesOrNoEnum } from '@/constants/agent/invite'
import { YapiGetV1AgentAbnormalData } from '@/typings/yapi/AgentAbnormalV1GetApi'
import {
  YapiPostV1AgentInviteDetailsApiRequest,
  YapiPostV1AgentInviteDetailsApiResponse,
  YapiPostV1AgentInviteDetailsListMembers,
} from '@/typings/yapi/AgentInviteDetailsV1PostApi'
import {
  YapiPostV1AgentInviteHistoryApiRequest,
  YapiPostV1AgentInviteHistoryData,
  YapiPostV1AgentInviteHistoryListMembersData,
} from '@/typings/yapi/AgentInviteHistoryV1PostApi'
import { YapiPostV2AgentInviteHistoryApiRequest, YapiPostV2AgentInviteHistoryListData } from '@/typings/yapi/AgentInviteHistoryV2PostApi'
import { YapiPostV1AgentRebateLogsApiRequest, YapiPostV1AgentRebateLogsList } from '@/typings/yapi/AgentRebateLogsV1PostApi'

export type InviteFormValidator = {
  alertMessage?: string
  isValid?: boolean
}
export type InviteFormObject<T> = {
  value: T
  // on validation failed alert message
  onValidateFailedMessage?: () => React.ReactDOM
  validator?: () => InviteFormValidator
  toApiValue?: (...any) => any
}

export type InviteFormObjectWrapper<Type> = {
  [Property in keyof Type]: InviteFormObject<Type[Property]>
}

export type InviteFilterFormViewModelHelper = {
  toApiApiRequest: (viewModel: InviteFilterFormViewModel) => Partial<YapiPostV1AgentInviteDetailsApiRequest>
  // fromApiRequest: (data: YapiPostV1AgentInviteDetailsApiResponse) => InviteFilterFormViewModel
  getDefaultViewModel: () => InviteFilterFormViewModel
}

type InviteFilterFormViewModelValueOnly = Partial<
  Omit<
    YapiPostV1AgentInviteDetailsApiRequest,
    'isAgt' | 'kycStatus' | 'registerSort' | 'childNumSort' | 'page' | 'pageSize'
  > & {
    isAgt: InviteFilterInviteTypeEnum
    kycStatus: InviteFilterKycEnum
    registerSort: InviteFilterSortEnum
    childNumSort: InviteFilterSortEnum
  }
>

export type InviteFilterFormViewModel = InviteFormObjectWrapper<InviteFilterFormViewModelValueOnly>

export type YapiPostV1AgentInviteDetailsApiResponseReal = Partial<
  Omit<YapiPostV1AgentInviteDetailsApiResponse, 'members'> & {
    members?: {
      list?: YapiPostV1AgentInviteDetailsListMembers[]
    }
  }
>

export type YapiPostV1AgentInviteHistoryApiResponseReal = Partial<
  Omit<YapiPostV1AgentInviteHistoryData, 'members'> & {
    members: {
      list: YapiPostV1AgentInviteHistoryListMembersData[]
      total: number
      pageSize: number
      pages: number
    }
  }
>

export type YapiPostV1AgentInviteHistoryApiRequestReal = Partial<
  Omit<YapiPostV1AgentInviteHistoryApiRequest, 'targetUid' | 'levelLimit'> & {
    targetUid: string
    levelLimit: string | number
    page: number
    pageSize: number
    forceUpdate: object
  }
>
export type YapiPostV1AgentInviteDetailsListMembersReal = Partial<
  Omit<YapiPostV1AgentInviteDetailsListMembers, 'uid'> & { uid: string }
>

export type YapiPostV2AgentInviteHistoryApiRequestReal =Partial<Omit<YapiPostV2AgentInviteHistoryApiRequest, 
'targetUid' | 'levelLimit' | 'startDate' | 'endDate' | 'parentUid'> & {
  targetUid: string | number
  parentUid: string | number
  levelLimit: string | number
  // page: number
  // pageSize: number
  forceUpdate: any,
  queryType: InviteDetailsUidTypeEnum
  startDate: number | string
  endDate: number | string
}
> 

export type YapiPostV2AgentInviteHistoryListDataReal = Partial<YapiPostV2AgentInviteHistoryListData & {
  registerTime: string
}>

export type YapiPostV1AgentRebateLogsApiRequestReal = Partial<Omit<YapiPostV1AgentRebateLogsApiRequest, 'targetUid' | 'levelLimit'
| 'startDate' | 'endDate'
> & {
  targetUid: string
  levelLimit: string | number
  isGrant: YesOrNoEnum | string
  // page: number
  // pageSize: number
  forceUpdate: any,
  startDate: number | string
  endDate: number | string
}
> 
export type YapiPostV1AgentRebateLogsListReal = Partial<YapiPostV1AgentRebateLogsList>

export type YapiGetV1AgentAbnormalDataReal = Partial<YapiGetV1AgentAbnormalData>

