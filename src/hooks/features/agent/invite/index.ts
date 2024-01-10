import { baseAgentInviteStore, useAgentInviteStore } from '@/store/agent/agent-invite'
import { YapiPostV1AgentInviteDetailsAnalysisData } from '@/typings/yapi/AgentInviteDetailsAnalysisV1PostApi'
import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { getCodeDetailList } from '@/apis/common'
import { useCommonStore } from '@/store/common'
import { PaginationProps } from '@nbit/arco'
import {
  agentGetUserId,
  // apiAgentInviteRecordsCheckMoreHandler,
  // apiAgentInviteTableCheckMoreHandler,
  sanitizeInviteDetailsApiRequest,
  sanitizeRebateDetailsApiRequest,
} from '@/helper/agent/invite'
import { YapiPostV1AgentRebateLogsListReal } from '@/typings/api/agent-old/invite'
import { useUpdateEffect } from 'react-use'
import { useMount } from 'ahooks'
import { isFalsyExcludeZero } from '@/helper/common'
import { YapiPostV2AgentInviteHistoryListData } from '@/typings/yapi/AgentInviteHistoryV2PostApi'
import { useAgentStore } from '@/store/agent'

export function useAgentInviteInfoOverviewInit() {}

export function useAgentInviteInfoList() {}

export function useAgentInviteSearching() {}

export function useAgentInviteAnalysis() {
  const store = useAgentInviteStore()
  const [apiData, setApiData] = useState<YapiPostV1AgentInviteDetailsAnalysisData>()

  // const apiRequest = (resolve, reject) => {
  //   store.apis
  //     .inviteDetailsAnalysisApi({
  //       ...(store.chartFilterSetting as any),
  //     })
  //     .then(res => {
  //       if (res.isOk) {
  //         const data = res.data
  //         // store.resetEditingFilterSetting()
  //         return resolve(data)
  //       }
  //       return reject()
  //     })
  // }

  // const { refreshCallback: refresh, apiStatus } = useReqeustMarketHelper({
  //   apiRequest,
  //   setApiData,
  //   deps: [store.chartFilterSetting.startDate, store.chartFilterSetting.endDate],
  // })

  // return { apiData, setApiData, refresh, apiStatus }
}

export function useAgentInviteTableCheckMoreV2() {
  const store = useAgentInviteStore()
  const state = store.filterSettingCheckMoreV2
  const defaultPageConfig = store.helper.getCheckMoreDefaultPage()
  const [page, setPage] = useState<PaginationProps>(defaultPageConfig)
  const [dataList, setDataList] = useState<YapiPostV2AgentInviteHistoryListData[]>([])
  const [isLoading, setIsLoading] = useState<null | boolean>(null)

  useUpdateEffect(() => {
    setPage(defaultPageConfig)
    setDataList([])
  }, [store.filterSettingCheckMoreV2])

  useUpdateEffect(() => {
    setDataList([])
  }, [page.pageSize])

  // useEffect(() => {
  //   // 判断 targetUid 和 parentUid 都等于 undefined 时，需要阻止请求，避免二次请求问题
  //   if (state.targetUid === undefined && state.parentUid === undefined) return
  //   let requestData = sanitizeInviteDetailsApiRequest()
  //   if (!requestData) return

  //   requestData = {
  //     ...requestData,
  //     page: page.current,
  //     pageSize: page.pageSize,
  //   }

  //   apiAgentInviteTableCheckMoreHandler({ setIsLoading, setDataList, setPage, requestData })
  // }, [
  //   state.levelLimit,
  //   state.targetUid,
  //   state.parentUid,
  //   state.productCd,
  //   state.minTotalRebate,
  //   state.maxTotalRebate,
  //   state.minRebateRatio,
  //   state.maxRebateRatio,
  //   state.startDate,
  //   state.endDate,
  //   state.queryType,
  //   page.current,
  //   page.pageSize,
  //   state.forceUpdate,
  // ])

  return { apiData: dataList, setApiData: setDataList, page, setPage, isLoading }
}

export function useAgentInviteRebateRecordsV2() {
  const userId = agentGetUserId()
  const store = useAgentInviteStore()
  const state = store.filterRebateRecordsV2
  const setState = store.setFilterRebateRecordsV2
  const defaultPageConfig = store.helper.getCheckMoreDefaultPage()
  const [page, setPage] = useState<PaginationProps>(defaultPageConfig)
  const [dataList, setDataList] = useState<YapiPostV1AgentRebateLogsListReal[]>([])
  const [isLoading, setIsLoading] = useState<null | boolean>(null)

  useUpdateEffect(() => {
    setPage(defaultPageConfig)
    setDataList([])
  }, [store.filterRebateRecordsV2])

  useUpdateEffect(() => {
    setDataList([])
  }, [page.pageSize])

  // useEffect(() => {
  //   // 判断 levelLimit 等于 undefined 时，需要阻止请求，避免二次请求问题
  //   if (state.levelLimit === undefined) return
  //   let requestData = sanitizeRebateDetailsApiRequest()
  //   requestData = {
  //     ...requestData,
  //     page: page.current,
  //     pageSize: page.pageSize,
  //   }

  //   apiAgentInviteRecordsCheckMoreHandler({ setIsLoading, setDataList, setPage, requestData })
  // }, [
  //   state.targetUid,
  //   state.levelLimit,
  //   state.productCd,
  //   state.isGrant,
  //   state.startDate,
  //   state.endDate,
  //   page.current,
  //   page.pageSize,
  //   state.forceUpdate,
  // ])

  return { apiData: dataList, setApiData: setDataList, page, setPage, isLoading }
}

export function useGetContractStatusCode() {
  const { locale } = useCommonStore()
  const { setContractStatusCode } = useAgentInviteStore()

  useEffect(() => {
    getCodeDetailList({ lanType: locale, codeVal: 'contract_status_cd' }).then(res => {
      const codeMap = res.data?.reduce((prev, curr) => {
        prev[curr.codeVal] = curr.codeKey
        return prev
      }, {})
      setContractStatusCode(codeMap)
    })
  }, [])
}

// export function useAgentProductLine() {
//   const store = useAgentInviteStore()
//   useMount(() => {
//     if (isEmpty(store.cache.productLineEnabledState)) {
//       store.fetchProductLines()
//     }
//   })
//   const productLine = store.cache.productLineEnabledState
//   const hasSpot = !isFalsyExcludeZero(productLine.spot)
//   const hasContract = !isFalsyExcludeZero(productLine.contract)
//   const hasBorrow = !isFalsyExcludeZero(productLine.borrowCoin)
//   const hasOption = !isFalsyExcludeZero(productLine.option)
//   const hasRecreation = !isFalsyExcludeZero(productLine.recreation)

//   return { hasSpot, hasBorrow, hasContract, hasOption, hasRecreation }
// }

// export function useAgentProductLineWithFee() {
//   const store = useAgentInviteStore()
//   useMount(() => {
//     if (isEmpty(store.cache.productLineEnabledStateWithFee)) {
//       store.fetchProductLinesWithFee()
//     }
//   })
//   const productLine = store.cache.productLineEnabledStateWithFee
//   const hasSpot = !isFalsyExcludeZero(productLine.spot)
//   const hasContract = !isFalsyExcludeZero(productLine.contract)
//   const hasBorrow = !isFalsyExcludeZero(productLine.borrowCoin)

//   return { hasSpot, hasBorrow, hasContract }
// }

export function getAgentProductLineWithFee() {
  const store = baseAgentInviteStore.getState()

  const productLine = store.cache.productLineEnabledStateWithFee
  const hasSpot = !isFalsyExcludeZero(productLine.spot)
  const hasContract = !isFalsyExcludeZero(productLine.contract)
  const hasBorrow = !isFalsyExcludeZero(productLine.borrowCoin)

  return { hasSpot, hasBorrow, hasContract }
}
