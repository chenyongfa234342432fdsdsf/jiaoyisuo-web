import { getV1AgentInvitationCodeQueryProductCdApiRequest } from '@/apis/agent'
import { getCodeDetailListBatch } from '@/apis/common'
import { DateOptionsTypes } from '@/constants/agent'
import { DateOptionsTypesInvite } from '@/constants/agent/invite'
import {
  calRebatesRatios,
  dateOptionsToApiParams,
  fillMissingDataForChart,
  formatAgentInviteChartData,
  formatAgentTotalInviteChartData,
  formatIncomeAnalysisChartData,
  formatIncomesPieChartData,
  formatTotalIncomesChartData,
  mergeRebateDataByRebateType,
} from '@/helper/agent'
import { dateOptionsToApiParamsInvite } from '@/helper/agent/invite'
import { useAgentStore } from '@/store/agent'
import { useAgentStatsStore } from '@/store/agent/agent-gains'
import { useAgentInviteStore } from '@/store/agent/agent-invite'
import { YapiGetV1AgtRebateInfoHistoryOverviewData } from '@/typings/yapi/AgtRebateInfoHistoryOverviewV1GetApi'
import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'

// function useRebateInfoDetails(DateOptions: DateOptionsTypes) {
//   const [totalIncomes, settotalIncomes] = useState<ReturnType<typeof formatTotalIncomesChartData>>([])
//   const [incomesAnalysis, setincomesAnalysis] = useState<ReturnType<typeof formatIncomeAnalysisChartData>>([])
//   const [incomeRates, setincomeRates] = useState<ReturnType<typeof formatIncomesPieChartData>>([])
//   const { productCodeMap, chartFilterSetting, setRebateCurrency } = useAgentStatsStore()

//   useEffect(() => {
//     const params = dateOptionsToApiParams(DateOptions)
//     Promise.all([
//       postV2AgtRebateInfoHistoryQueryDetailsAnalysisApiRequest(params),
//       getV1AgentInvitationCodeQueryProductCdApiRequest({}),
//     ]).then(res => {
//       const rebateRes = res[0]
//       const productResMap = (res[1].data?.scaleList as any)?.map(scale => scale.productCd)

//       const totalIncomesChart = rebateRes.data?.list
//         ? formatTotalIncomesChartData(rebateRes.data.list, params.startDate, params.endDate)
//         : []
//       const incomesAnalysisChart = rebateRes.data?.list
//         ? formatIncomeAnalysisChartData(rebateRes.data.list, params.startDate, params.endDate)
//         : []
//       // const formattedInfoBarData = rebateRes.data?.incomes ? formatInfoBoxData(rebateRes.data.incomes) : {}
//       settotalIncomes(totalIncomesChart)
//       const analysis = incomesAnalysisChart.filter(each => productResMap.includes(each.productCd))
//       setincomesAnalysis(analysis)
//       const calculatedRatio = rebateRes.data?.list ? calRebatesRatios(rebateRes.data.list) : {}
//       !isEmpty(calculatedRatio) &&
//         setincomeRates(
//           formatIncomesPieChartData(calculatedRatio).filter(each => productResMap.includes(each.productCd))
//         )

//       // setincomes(formattedInfoBarData)
//       // settotalIncome(rebateRes.data?.totalIncome)
//       if (rebateRes.data) {
//         setRebateCurrency(rebateRes.data.legalCur)
//       }
//     })
//   }, [productCodeMap, chartFilterSetting, DateOptions])

//   return { totalIncomes, incomesAnalysis, incomeRates }
// }

// export function useInviteDetailsAnalysis(DateOptions: DateOptionsTypesInvite) {
//   const [invitedList, setinvitedList] = useState<ReturnType<typeof formatAgentInviteChartData>>([])
//   const [totalList, settotalList] = useState<ReturnType<typeof formatAgentTotalInviteChartData>>([])
//   const store = useAgentInviteStore()

//   useEffect(() => {
//     const params = dateOptionsToApiParamsInvite(DateOptions)
//     store.apis.inviteDetailsAnalysisApi(params).then(res => {
//       const invitedListChart = res.data?.invitedList
//         ? formatAgentInviteChartData((res.data?.invitedList || []) as any, params.startDate, params.endDate)
//         : []
//       const totalListChart = res.data?.totalList
//         ? formatAgentTotalInviteChartData((res.data?.totalList || []) as any, params.startDate, params.endDate)
//         : []
//       setinvitedList(invitedListChart)
//       settotalList(totalListChart)
//     })
//   }, [store.chartFilterSetting, DateOptions])

//   return { invitedList, totalList }
// }

function useGetAgentProductCode() {
  const { setProductCodeMap, setRebateCodeMap } = useAgentStatsStore()

  useEffect(() => {
    getCodeDetailListBatch(['agent_product_cd', 'rebate_type_cd']).then(res => {
      const codeMap = res[0]?.reduce((prev, curr) => {
        prev[curr.codeVal] = curr.codeKey
        return prev
      }, {})

      const rebateCodeMap = res[1]?.reduce((prev, curr) => {
        prev[curr.codeVal] = curr.codeKey
        return prev
      }, {})
      setProductCodeMap(codeMap)
      setRebateCodeMap(rebateCodeMap)
    })
  }, [])
}

function useFormatChartData(hasRebateTab, selectedRebateTab, data) {
  const [chartData, setchartData] = useState<ReturnType<typeof formatTotalIncomesChartData>>()
  useEffect(() => {
    if (!hasRebateTab) {
      setchartData(data)
      return
    }
    const selectedData = data.map(each => {
      return {
        ...each,
        data:
          selectedRebateTab !== undefined
            ? fillMissingDataForChart(
                each.data?.filter(eachData => {
                  return eachData.rebateTypeCd === selectedRebateTab
                }),
                each.startDate,
                each.endDate
              )
            : fillMissingDataForChart(mergeRebateDataByRebateType(each.data), each.startDate, each.endDate),
      }
    })
    setchartData(selectedData)
  }, [selectedRebateTab, data])

  return chartData
}

export function useAgentUserInBlacklist() {
  const store = useAgentStore()

  useEffect(() => {
    store.fetchUserInBlackList()
    return () => {
      store.clearBlackList()
    }
  }, [])
}

export { useGetAgentProductCode, useFormatChartData }
