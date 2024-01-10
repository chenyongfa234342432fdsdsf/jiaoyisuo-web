import { t } from '@lingui/macro'
import NoDataImage from '@/components/no-data-image'
import Icon from '@/components/icon'
import { useEffect, useState } from 'react'
import { useAgentStatsStore } from '@/store/agent/agent-gains'
import { fillMissingDataForChart, formatTotalIncomesChartData, mergeRebateDataByRebateType } from '@/helper/agent'
import classNames from 'classnames'
import { isEmpty } from 'lodash'
import { AgentChartKeyEnum } from '@/constants/agent/agent'
import ResponsiveLineChart from './line-chart'
import styles from './index.module.css'
import { StatsCheckboxLegend, StatsLegend, StatsSingleCheckboxLegend } from './stats-checkbox-legend'

function StatsChartTabs({ onchange }) {
  const { rebateCodeMap } = useAgentStatsStore()
  const options = [
    {
      codeKey: t`common.all`,
      codeVal: undefined,
    },
    ...Object.keys(rebateCodeMap).map(key => {
      return {
        codeKey: rebateCodeMap[key],
        codeVal: key,
      }
    }),
  ]
  const [selected, setselected] = useState<string | undefined>()

  useEffect(() => {
    onchange && onchange(selected)
  }, [selected])

  return (
    <div className={styles['stats-chart-tabs']}>
      {options.map(option => (
        <span
          key={option.codeVal}
          className={classNames({ '!text-text_color_01 !bg-bg_sr_color': selected === option.codeVal })}
          onClick={() => setselected(option.codeVal)}
        >
          {option.codeKey}
        </span>
      ))}
    </div>
  )
}

function StatsLineChart({
  title,
  icon,
  data,
  legend,
  hasRebateTab,
  hasDecimal,
  onchange,
  chartKey,
}: {
  title: string
  icon: JSX.Element
  data: ReturnType<typeof formatTotalIncomesChartData>
  legend: JSX.Element
  hasRebateTab?: boolean
  hasDecimal: boolean
  onchange?: (v: ReturnType<typeof formatTotalIncomesChartData>) => void
  chartKey: string
}) {
  const [chartData, setchartData] = useState<ReturnType<typeof formatTotalIncomesChartData>>([])
  const [selectedRebateTab, setselectedRebateTab] = useState()

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

  useEffect(() => {
    onchange && onchange(chartData)
  }, [chartData])

  return (
    <div className={styles.scoped}>
      <div className="flex flex-col">
        <span className="gains-title">
          {icon}
          {title}
        </span>
        {hasRebateTab && <StatsChartTabs onchange={setselectedRebateTab} />}
      </div>
      {legend}
      <div className="w-full h-60">
        {chartData.length > 0 ? (
          <ResponsiveLineChart chartKey={chartKey} data={chartData} hasDecimal={hasDecimal} />
        ) : (
          <NoDataImage size="h-24 w-28" />
        )}
      </div>
    </div>
  )
}

export function TotalIncomesLineChart({ data }: { data: ReturnType<typeof formatTotalIncomesChartData> }) {
  const [chartData, setchartData] = useState(data)

  return (
    <StatsLineChart
      title={t`features_agent_common_stats_line_chart_index_djznrriy_i`}
      icon={<Icon name="rebates_total_income" />}
      data={data}
      legend={<StatsLegend chartKey={AgentChartKeyEnum.TotalIncomes} data={chartData} hasDecimal />}
      hasRebateTab
      hasDecimal
      onchange={setchartData}
      chartKey={AgentChartKeyEnum.TotalIncomes}
    />
  )
}

export function TotalInvitesLineChart({ data }) {
  const [chartData, setchartData] = useState(data)

  return (
    <StatsLineChart
      title={t`features_agent_common_stats_line_chart_index_5mgxj8m4kx`}
      icon={<Icon name="rebates_invited_user" />}
      data={data}
      legend={<StatsLegend chartKey={AgentChartKeyEnum.InvitedList} data={chartData} />}
      onchange={setchartData}
      hasDecimal={false}
      chartKey={AgentChartKeyEnum.InvitedList}
    />
  )
}

function CheckboxLineChart({
  title,
  icon,
  data,
  hasRebateTab,
  hasDecimal,
  isSingleCheckbox,
  chartKey,
}: {
  title: string
  icon: JSX.Element
  data: ReturnType<typeof formatTotalIncomesChartData>
  hasRebateTab?: boolean
  hasDecimal: boolean
  isSingleCheckbox?: boolean
  chartKey: string
}) {
  const [checkboxLineChartData, setcheckboxLineChartData] = useState(data)
  useEffect(() => {
    let defaultData = data
    if (isSingleCheckbox && !isEmpty(data)) defaultData = [{ ...data[0] }]
    !isEmpty(defaultData) && setcheckboxLineChartData(defaultData)
  }, [data])
  return (
    <StatsLineChart
      title={title}
      icon={icon}
      data={checkboxLineChartData}
      legend={
        isSingleCheckbox ? (
          <StatsSingleCheckboxLegend
            chartKey={chartKey}
            data={data}
            onchange={v =>
              setcheckboxLineChartData(
                (data || []).map(each => {
                  if (!v.includes(each.id)) {
                    return {
                      ...each,
                      isNotChecked: true,
                    }
                  }
                  return each
                })
              )
            }
          />
        ) : (
          <StatsCheckboxLegend
            chartKey={chartKey}
            data={data}
            onchange={v =>
              setcheckboxLineChartData(
                (data || []).map(each => {
                  if (!v.includes(each.id)) {
                    return {
                      ...each,
                      isNotChecked: true,
                    }
                  }
                  return each
                })
              )
            }
            hasDecimal={hasDecimal}
          />
        )
      }
      hasRebateTab={hasRebateTab}
      hasDecimal={hasDecimal}
      chartKey={chartKey}
    />
  )
}

export function IncomesAnalysisLineChart({ data }) {
  return (
    <CheckboxLineChart
      title={t`features_agent_gains_index_5101573`}
      icon={<Icon name="rebates_detailed_analysis" />}
      data={data}
      hasRebateTab
      hasDecimal
      chartKey={AgentChartKeyEnum.IncomeAnalysis}
    />
  )
}

export function InvitesAnalysisLineChart({ data }) {
  return (
    <CheckboxLineChart
      title={t`features_agent_invite_analytics_index_5101576`}
      icon={<Icon name="rebates_detailed_people" />}
      data={data}
      hasDecimal={false}
      isSingleCheckbox
      chartKey={AgentChartKeyEnum.TotalInvitedList}
    />
  )
}
