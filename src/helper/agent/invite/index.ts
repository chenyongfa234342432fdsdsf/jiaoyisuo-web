import { DateOptionsTypesInvite, showAgentSearchMsg } from '@/constants/agent/invite'
import { baseAgentInviteStore } from '@/store/agent/agent-invite'
import { baseUserStore } from '@/store/user'
import {
  YapiPostV1AgentRebateLogsApiRequestReal,
  YapiPostV1AgentRebateLogsListReal,
  YapiPostV2AgentInviteHistoryApiRequestReal,
  YapiPostV2AgentInviteHistoryListDataReal,
} from '@/typings/api/agent-old/invite'
import { PaginationProps } from '@nbit/arco'
import dayjs from 'dayjs'
import { isEmpty, omitBy } from 'lodash'

export function dateOptionsToApiParamsInvite(DateOptions: DateOptionsTypesInvite) {
  const { chartFilterSetting } = baseAgentInviteStore.getState()
  let endTime = dayjs()
  let startTime = endTime

  switch (DateOptions) {
    case DateOptionsTypesInvite.custom:
      startTime = dayjs(chartFilterSetting.startDate)
      endTime = dayjs(chartFilterSetting.endDate).endOf('day')
      break
    case DateOptionsTypesInvite.last30Days:
      // inclusive of today
      startTime = endTime.subtract(29, 'day').startOf('day')
      break
    case DateOptionsTypesInvite.last7Days:
      // inclusive of today
      startTime = endTime.subtract(6, 'day').startOf('day')
      break
    default:
      startTime = endTime.subtract(1, 'year').startOf('day')
  }

  return {
    startDate: startTime.valueOf(),
    endDate: endTime.valueOf(),
  }
}

// export function apiAgentInviteTableCheckMoreHandler({ setIsLoading, requestData, setPage, setDataList }) {
//   setIsLoading && setIsLoading(true)

//   baseAgentInviteStore
//     .getState()
//     .apis.inviteDetailsCheckMoreTableApiV2(requestData)
//     .then(res => {
//       const total = res?.data?.total || 0

//       setPage(prev => {
//         return {
//           ...prev,
//           total,
//         }
//       })

//       setDataList(prevList => {
//         let resolvedList: YapiPostV2AgentInviteHistoryListDataReal[] = [...(res.data?.list || [])]
//         return resolvedList
//       })
//     })
//     .finally(() => {
//       setIsLoading(false)
//     })
// }

// export function apiAgentInviteRecordsCheckMoreHandler({ setIsLoading, requestData, setPage, setDataList }) {
//   setIsLoading && setIsLoading(true)

//   baseAgentInviteStore
//     .getState()
//     .apis.inviteDetailsRebateRecordsApiV2(requestData)
//     .then(res => {
//       const total = res?.data?.total || 0

//       setPage(prev => {
//         return {
//           ...prev,
//           total,
//         }
//       })

//       setDataList(prevList => {
//         let resolvedList: YapiPostV1AgentRebateLogsListReal[] = [...(res.data?.list || [])]
//         return resolvedList
//       })
//     })
//     .finally(() => {
//       setIsLoading(false)
//     })
// }

export function isHidePagination(page: PaginationProps) {
  if (!page.hideOnSinglePage) return false
  if (page.current === 1 && (page.pageSize || 0) >= (page.total || 0)) {
    return true
  }
  return false
}

export function agentGetUserId() {
  return baseUserStore.getState().userInfo?.uid
}

export function sanitizeInviteDetailsApiRequest() {
  const state = baseAgentInviteStore.getState().filterSettingCheckMoreV2
  const userId = agentGetUserId()
  let requestData: YapiPostV2AgentInviteHistoryApiRequestReal = omitBy(
    {
      ...state,
      startDate: dayjs(state.startDate).valueOf(),
      endDate: dayjs(state.endDate).valueOf(),
      forceUpdate: '',
    },
    x => !x
  )

  // if (!state.targetUid && !state.levelLimit) return
  if (isEmpty(requestData)) return
  if (requestData.targetUid === userId) {
    showAgentSearchMsg()
    return
  }

  return requestData
}

export function sanitizeRebateDetailsApiRequest() {
  const state = baseAgentInviteStore.getState().filterRebateRecordsV2
  const userId = agentGetUserId()
  let requestData: YapiPostV1AgentRebateLogsApiRequestReal = omitBy(
    {
      ...state,
      startDate: dayjs(state.startDate).valueOf(),
      endDate: dayjs(state.endDate).valueOf(),
      forceUpdate: '',
    },
    x => !x
  )

  if (isEmpty(requestData)) return
  if (requestData.targetUid === userId) {
    showAgentSearchMsg()
    return
  }

  return requestData
}
