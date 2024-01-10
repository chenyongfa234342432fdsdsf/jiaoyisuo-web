import {
  DateOptionsTypes,
  incomeAnalysisChartDefaultProperties,
  pieChartDefaultProperties,
  productCodeMapToRates,
  totalIncomeChartDefaultProperties,
} from '@/constants/agent'
import { baseAgentStatsStore } from '@/store/agent/agent-gains'
import { YapiPostV1AgtRebateInfoHistoryQueryDetailsListIncomes } from '@/typings/yapi/AgtRebateInfoHistoryQueryDetailsV1PostApi'
import dayjs from 'dayjs'
import { isNull, sum, sumBy, uniqWith } from 'lodash'
import { t } from '@lingui/macro'
import {
  YapiPostV2AgtRebateInfoHistoryQueryDetailsAnalysisApiResponse,
  YapiPostV2AgtRebateInfoHistoryQueryDetailsAnalysisListData,
} from '@/typings/yapi/AgtRebateInfoHistoryQueryDetailsAnalysisV2PostApi'
import { YapiPostV2AgentInviteDetailsAnalysisApiResponse } from '@/typings/yapi/AgentInviteDetailsAnalysisV2PostApi'
import { agentInviteTotalListOptions } from '@/constants/agent/agent'
import { totalInvitedChartCheckboxOptions } from '@/constants/agent/invite'
import { decimalUtils } from '@nbit/utils'
import { formatNumberDecimal } from '../decimal'
import { getBusinessName } from '../common'

const dateTemplate = 'YYYY-MM-DD hh:mm:ss'
const SafeCalcUtil = decimalUtils.SafeCalcUtil

function formatInfoBoxData(data: YapiPostV1AgtRebateInfoHistoryQueryDetailsListIncomes[]) {
  return data.reduce((prev, curr) => {
    prev[curr.dateType] = curr
    return prev
  }, {})
}

function formatDateOptions(type: DateOptionsTypes) {
  const now = dayjs()
  if (type === DateOptionsTypes.last7Days) {
    const start = now.subtract(7, 'days')
    return {
      startDate: start.format(dateTemplate),
      endDate: now.format(dateTemplate),
    }
  }
  const start = now.subtract(30, 'days')
  return {
    startDate: start.format(dateTemplate),
    endDate: now.format(dateTemplate),
  }
}

function dateOptionsToApiParams(DateOptions: DateOptionsTypes) {
  const { chartFilterSetting } = baseAgentStatsStore.getState()
  let endTime = dayjs()
  let startTime = endTime
  switch (DateOptions) {
    case DateOptionsTypes.custom:
      startTime = dayjs(chartFilterSetting.startDate).startOf('day')
      endTime = dayjs(chartFilterSetting.endDate).endOf('day')
      break
    case DateOptionsTypes.last30Days:
      // inclusive of today
      startTime = endTime.subtract(29, 'day').startOf('day')
      break
    case DateOptionsTypes.last7Days:
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

function fillMissingDataForChart(chartData, startDate, endDate) {
  let result = [] as any[]
  const formattedStartDate = dayjs(startDate)
  const formattedEndDate = dayjs(endDate)
  const chartDataMap =
    chartData?.reduce((prev, curr) => {
      prev[curr.x] = curr
      return prev
    }, {}) || {}
  for (let start = formattedStartDate; start.diff(formattedEndDate) <= 0; start = start.add(1, 'day')) {
    if (chartDataMap?.[start.format('YYYY-MM-DD')])
      result.push({ x: start.format('YYYY-MM-DD'), ...chartDataMap[start.format('YYYY-MM-DD')] })
    else result.push({ x: start.format('YYYY-MM-DD'), y: 0 })
  }

  return result
}

function mergeRebateDataByProductCd(data) {
  const result = data.reduce((aggre, curr, index) => {
    const duplicated = data
      .slice(index + 1)
      .filter(each => each.x === curr.x && each.rebateTypeCd === curr.rebateTypeCd)
    const mergeValue = [curr, ...duplicated].reduce((a, c) => {
      a = {
        ...c,
        y: a?.y ? SafeCalcUtil.add(a.y, c.y).toString() : c.y,
      }
      return a
    }, {})
    delete mergeValue.productCd
    aggre.push(mergeValue)
    return aggre
  }, [])
  return uniqWith(result, (a: any, b: any) => a.rebateTypeCd === b.rebateTypeCd && a.x === b.x)
}

function mergeRebateDataByRebateType(data) {
  const result = data.reduce((aggre, curr, index) => {
    const duplicated = data.slice(index + 1).filter(each => each.x === curr.x)
    const mergeValue = [curr, ...duplicated].reduce((a, c) => {
      a = {
        ...c,
        y: a?.y ? SafeCalcUtil.add(a.y, c.y).toString() : c.y,
      }
      return a
    }, {})
    delete mergeValue.productCd
    aggre.push(mergeValue)
    return aggre
  }, [])
  return uniqWith(result, (a: any, b: any) => a.x === b.x)
}

function formatTotalIncomesChartData(
  apiData: YapiPostV2AgtRebateInfoHistoryQueryDetailsAnalysisApiResponse['data']['list'],
  startDate: number,
  endDate: number
) {
  let data = apiData.map(each => {
    return {
      rebateTypeCd: each.rebateTypeCd,
      productCd: each.productCd,
      x: dayjs(each.rebateTime).format('YYYY-MM-DD'),
      y: Number(each.rebate),
    }
  })
  data = mergeRebateDataByProductCd([...data]) as any
  // data = fillMissingDataForChart(data, startDate, endDate)

  return [
    {
      id: 'totalIncomesChart',
      data,
      ...totalIncomeChartDefaultProperties,
      startDate,
      endDate,
    },
  ]
}

export function formatAgentInviteChartData(
  apiData: YapiPostV2AgentInviteDetailsAnalysisApiResponse['data']['invitedList'],
  startDate: number,
  endDate: number
) {
  let data = apiData.map(each => {
    return { x: dayjs(each.date).format('YYYY-MM-DD'), y: each.num }
  })
  data = fillMissingDataForChart(data, startDate, endDate)
  const id = JSON.stringify({
    ...data[data.length - 1],
    y: sumBy(data, each => Number((each as any).y)),
  })

  return [
    {
      id,
      data,
      ...totalIncomeChartDefaultProperties,
    },
  ]
}

export function formatAgentTotalInviteChartData(
  apiData: YapiPostV2AgentInviteDetailsAnalysisApiResponse['data']['totalList'],
  startDate: number,
  endDate: number
) {
  let data = Object.keys(agentInviteTotalListOptions).map((key, index) => {
    const objKey = agentInviteTotalListOptions[key]
    let data = apiData?.map(each => {
      return { x: dayjs(each.date).format('YYYY-MM-DD'), y: each[objKey] }
    })
    data = fillMissingDataForChart(data, startDate, endDate)
    const checkboxVal = {
      ...data[data.length - 1],
      y: sumBy(data, each => Number(each.y)),
    }
    const checkboxTitle = JSON.stringify(checkboxVal)

    return {
      id: totalInvitedChartCheckboxOptions()[objKey],
      data,
      checkboxTitle,
      ...totalIncomeChartDefaultProperties,
    }
  })

  return data
}

function formatIncomeAnalysisChartData(
  apiData: YapiPostV2AgtRebateInfoHistoryQueryDetailsAnalysisApiResponse['data']['list'],
  startDate: number,
  endDate: number
) {
  const { productCodeMap } = baseAgentStatsStore.getState()

  const productMap = apiData.reduce((prev, curr) => {
    if (!prev[curr.productCd])
      prev[curr.productCd] = [
        {
          ...curr,
          x: dayjs(curr.rebateTime).format('YYYY-MM-DD'),
          y: Number(curr.rebate),
        },
      ]
    else
      prev[curr.productCd].push({
        ...curr,
        x: dayjs(curr.rebateTime).format('YYYY-MM-DD'),
        y: Number(curr.rebate),
      })
    return prev
  }, {})

  const formattedChartData = Object.keys(productCodeMap).map((key, index) => {
    const data = productMap?.[key] || [] // fillMissingDataForChart(productMap[key], startDate, endDate)
    const checkboxVal = {
      ...data[data.length - 1],
      y: sumBy(data, (each: any) => Number(each.y)),
    }
    const checkboxTitle = JSON.stringify(checkboxVal)
    return {
      id: productCodeMap[key],
      data,
      ...incomeAnalysisChartDefaultProperties[index],
      checkboxTitle,
      productCd: key,
      startDate,
      endDate,
    }
  })

  return formattedChartData
}

function calRebatesRatios(rebates: YapiPostV2AgtRebateInfoHistoryQueryDetailsAnalysisListData[]) {
  const { productCodeMap } = baseAgentStatsStore.getState()
  const result = Object.keys(productCodeMap).map(key => {
    const rebateByProduct = rebates.filter(rebate => rebate.productCd === key)
    return sumBy(rebateByProduct, each => Number(each.rebate))
  })
  const total = sum(result)

  const ratios = result.map(each => formatNumberDecimal((each / total) * 100, 2, true))
  return Object.keys(productCodeMap).reduce((a, c, i) => {
    a[c] = ratios[i]
    return a
  }, {})
}

function formatIncomesPieChartData(apiData) {
  const data = apiData
  const { productCodeMap } = baseAgentStatsStore.getState()
  if (Object.values(data).every(isNull)) return []

  const formatted = Object.keys(productCodeMap).map((key, index) => {
    return {
      id: key,
      label: productCodeMap[key],
      value: data[key] || 0,
      productCd: key,
      ...pieChartDefaultProperties[index],
    }
  })

  return formatted
}

// filter and format to api request structure
function formatQueryRebateToApi(params) {
  delete params.columnDetails
  if (params.productCd === 0) {
    delete params.productCd
  }

  // api requires both min and maxAmount properties
  if (params.minAmount && !params.maxAmount) {
    params.maxAmount = Number.MAX_SAFE_INTEGER
  }
  if (params.maxAmount && !params.minAmount) {
    params.minAmount = 0
  }

  return params
}

function formatDatePickerData(data) {
  return {
    startDate: dayjs(data[0]).valueOf(),
    endDate: dayjs(data[1]).valueOf(),
  }
}

function formatToDatePicker(data) {
  if (!data.startDate && !data.endDate) return []
  return [dayjs(data.startDate).format('YYYY-MM-DD'), dayjs(data.endDate).format('YYYY-MM-DD')]
}

export function generateAgentDefaultSeoMeta(
  // TODO commTitle 备用，后面扩张
  keys: {
    title: string
    description?: string
    commTitle?: string
  },
  values?: any
) {
  const businessName = getBusinessName()
  if (!values) {
    values = { businessName }
  } else {
    values.businessName = businessName
  }
  return {
    title: keys.title,
    description: t({
      id: keys?.description || `helper_agent_index_gr1uz7jkp0`,
      values,
    }),
  }
}

function getTaActivitiesSliderPoints(value: number) {
  const points = [0]
  const step = Math.floor(value / 5)
  for (let i = 1; i < 5; i += 1) {
    points.push(step * i)
  }
  points.push(value)
  return points
}

export {
  formatDateOptions,
  dateOptionsToApiParams,
  formatInfoBoxData,
  formatQueryRebateToApi,
  formatTotalIncomesChartData,
  formatIncomeAnalysisChartData,
  formatIncomesPieChartData,
  formatDatePickerData,
  formatToDatePicker,
  calRebatesRatios,
  fillMissingDataForChart,
  mergeRebateDataByRebateType,
  getTaActivitiesSliderPoints,
}
