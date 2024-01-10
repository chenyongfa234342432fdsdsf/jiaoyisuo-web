import { t } from '@lingui/macro'
import { Checkbox } from '@nbit/arco'
import { IncreaseTag } from '@nbit/react'
import { useEffect, useState } from 'react'
import { useAgentChartStore } from '@/store/agent/agent-chart'
import AgentPopover from '../../agent-popover'
import styles from './index.module.css'

type TStatsCheckboxLegend = {
  data: any
  onchange: any
  hasDecimal?: boolean
  chartKey: string
}
type TStatsLegend = {
  data: any
  hasDecimal?: boolean
  chartKey: string
}

function StatsCheckboxLegend({ data, onchange, hasDecimal, chartKey }: TStatsCheckboxLegend) {
  const { legendMap } = useAgentChartStore()
  const legendData = legendMap?.[chartKey] || []
  const [checked, setchecked] = useState(data?.map(each => each.id))
  useEffect(() => {
    setchecked(data?.map(each => each.id))
  }, [data])

  const date = legendData?.[0]?.date || ''
  return (
    <>
      {data.length > 0 && <span className="font-normal text-text_color_02 text-sm">{date}</span>}
      <div className={styles.scoped}>
        <Checkbox.Group
          onChange={v => {
            setchecked(v)
            onchange(v)
          }}
          value={checked}
        >
          {data?.map((item, index: number) => {
            const legend = legendData.find(each => each.id === item.id) || {}
            return (
              <div key={index} className="legend">
                <div className="legend-header">
                  <AgentPopover content={t`features_agent_common_stats_line_chart_stats_checkbox_legend_index_5101602`}>
                    <Checkbox className="whitespace-nowrap" value={item.id}>
                      <span className=" text-base text-text_color_01 w-12 font-medium">
                        +{' '}
                        {hasDecimal ? (
                          <IncreaseTag
                            hasColor={false}
                            hasPrefix={false}
                            hasPostfix={false}
                            kSign
                            digits={2}
                            value={legend.value}
                            defaultEmptyText={'0.00'}
                            delZero={false}
                          />
                        ) : (
                          legend.value
                        )}
                      </span>
                    </Checkbox>
                  </AgentPopover>
                  <div className="flex flex-row items-center">
                    <div className="legend-icon" style={{ background: item.color }} />
                    <span className="legend-title">{item.id}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </Checkbox.Group>
      </div>
    </>
  )
}

function StatsLegend({ data, hasDecimal, chartKey }: TStatsLegend) {
  const { legendMap } = useAgentChartStore()
  // const dataLength = data?.[0]?.data?.length
  // const legendDate = data?.[0]?.data?.[dataLength - 1]?.x || dayjs()
  // const sumAllData = data?.reduce((a, c) => {
  //   a = [...a, ...c.data]
  //   return a
  // }, [])
  // const legendSumValue = sumBy(sumAllData, each => Number((each as any).y))
  return (
    <div className={styles.scoped}>
      {data?.map((item, index: number) => {
        return (
          <div key={index} className="legend">
            <div className="legend-header">
              <span className="font-normal text-text_color_02 text-sm">{legendMap?.[chartKey]?.[index]?.date}</span>
              <span className="ml-8 font-medium">
                +{' '}
                {hasDecimal ? (
                  <IncreaseTag
                    hasColor={false}
                    hasPrefix={false}
                    hasPostfix={false}
                    kSign
                    digits={2}
                    value={legendMap?.[chartKey]?.[index]?.value}
                    defaultEmptyText={'0.00'}
                    delZero={false}
                  />
                ) : (
                  legendMap?.[chartKey]?.[index]?.value
                )}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatsSingleCheckboxLegend({ data, onchange, hasDecimal, chartKey }: TStatsCheckboxLegend) {
  const { legendMap } = useAgentChartStore()
  // useEffect(() => {
  //   setchecked(data?.map(each => each.id))
  // }, [data])
  const allData = data?.[0]
  const singleAgentData = data?.[1]
  const [checked, setchecked] = useState<any>([allData?.id])

  const [selectedData, setselectedData] = useState<any>(allData)

  useEffect(() => {
    const selectedData = data.find(each => each?.id === checked?.[0]) || allData
    setselectedData(selectedData)
  }, [checked, allData])

  // useEffect(() => {
  //   // set default
  //   console.log(allData, 'here')
  //   setchecked([allData?.id])
  //   setselectedData(allData)
  // }, [...data])

  const legendData = legendMap?.[chartKey]?.find(each => each?.id === selectedData?.id) || {}
  return (
    <div className={styles.scoped}>
      <Checkbox.Group
        className={'w-full flex'}
        onChange={v => {
          const selected = v.includes(singleAgentData?.id) ? [singleAgentData?.id] : [allData?.id]
          setchecked(selected)
          onchange(selected)
        }}
        value={checked}
      >
        <div className="legend w-full">
          <div className="legend-header">
            <div className="flex flex-row justify-between w-full">
              <div>
                <span className="mr-8 text-text_color_03">{legendData?.date}</span>
                <span className=" text-base text-text_color_01 w-12 font-medium">
                  +{' '}
                  {hasDecimal ? (
                    <IncreaseTag
                      hasColor={false}
                      hasPrefix={false}
                      hasPostfix={false}
                      kSign
                      digits={2}
                      value={legendData?.value}
                      defaultEmptyText={'0.00'}
                      delZero={false}
                    />
                  ) : (
                    legendData?.value
                  )}
                </span>
              </div>
              <Checkbox className="whitespace-nowrap" value={singleAgentData?.id}>
                <span className="text-text_color_02">{singleAgentData?.id}</span>
              </Checkbox>
            </div>
            {/* <div className="flex flex-row items-center">
                <div className="legend-icon" style={{ background: singleAgentData?.color }} />
                <span className="legend-title">{singleAgentData?.id}</span>
              </div> */}
          </div>
        </div>
      </Checkbox.Group>
    </div>
  )
}

export { StatsCheckboxLegend, StatsLegend, StatsSingleCheckboxLegend }
