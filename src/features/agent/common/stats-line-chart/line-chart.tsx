import { ThemeEnum } from '@/constants/base'
import { useCommonStore } from '@/store/common'
import { ResponsiveLine, Serie } from '@nivo/line'
import { useEffect, useState } from 'react'
import { IncreaseTag } from '@nbit/react'
import { useAgentChartStore } from '@/store/agent/agent-chart'
import { isEmpty } from 'lodash'
import styles from './index.module.css'

const spread = 12

function calTickSpread(data) {
  const length = data[0]?.data?.length || 0
  return Math.ceil(length / spread)
}

// calculate margin to align chart with legend header
function calMargin(length) {
  // add more spaces to single character font
  if (length === 1) return 20
  // length * fontSize
  return length * 11
}

const commonProperties = (themeSetting, axisLength) => {
  const margin = calMargin(axisLength)
  return {
    margin: { top: 20, right: 20, bottom: 40, left: margin },
    pointSize: 6,
    pointBorderWidth: 2,
    pointBorderColor: { theme: 'background' },
    width: 1200,
    height: 260,
    theme: {
      grid: {
        line: {
          // line_color_02
          stroke: ThemeEnum.dark === themeSetting ? '#323337' : '#F2F2F2',
          strokeWidth: 1,
        },
      },
      axis: {
        ticks: {
          text: {
            // text_color_02
            fill: ThemeEnum.dark === themeSetting ? '#C0C0C0' : '#7F7F81',
            fontSize: 11,
          },
        },
      },
    },
  }
}

function ResponsiveLineChart({ data, hasDecimal, chartKey }) {
  // fix weird line bug
  const [maxAxisLength, setMaxAxisLength] = useState(0)
  const { setLegendMap } = useAgentChartStore()
  const [localData, setlocalData] = useState(data)

  useEffect(() => {
    // set legend data
    if (!isEmpty(data)) {
      const legendData = data?.map(each => {
        const length = each?.data?.length
        return {
          id: each.id,
          value: each?.data[length - 1].y,
          date: each?.data[length - 1].x,
        }
      })
      setLegendMap(chartKey, legendData)
    }
  }, [data])

  useEffect(() => {
    setlocalData(data.filter(each => !each?.isNotChecked))
  }, [data])

  const { theme } = useCommonStore()
  return (
    <ResponsiveLine
      {...commonProperties(theme, maxAxisLength)}
      data={localData}
      xScale={{
        type: 'time',
        format: '%Y-%m-%d',
        useUTC: false,
        precision: 'day',
      }}
      xFormat="time:%Y-%m-%d"
      yScale={{
        type: 'linear',
        stacked: false,
      }}
      axisLeft={{
        legendOffset: 12,
        format: value =>
          setMaxAxisLength(prev => {
            const currentLength = value.toString().length
            if (currentLength > prev) return currentLength
            return prev
          }),
      }}
      axisBottom={{
        format: '%m-%d',
        tickValues: `every ${calTickSpread(data)} days`,
        legendOffset: -12,
      }}
      curve={'linear'}
      enablePoints
      useMesh
      enableGridX={false}
      enableArea
      crosshairType="cross"
      animate={false}
      colors={(node: any) => {
        return `${node.color}`
      }}
      // enableSlices="x"
      // sliceTooltip={({ slice }) => {
      //   console.log(slice, ' here')
      //   return <SlicedTooltip slice={slice} chartKey={chartKey} />
      // }}
      // remove tooltip
      tooltip={({ point }) => {
        const { xFormatted, yFormatted } = point.data

        return (
          <div className={styles['chart-tooltip']}>
            <div>
              +{' '}
              {hasDecimal ? (
                <IncreaseTag
                  hasColor={false}
                  hasPrefix={false}
                  hasPostfix={false}
                  kSign
                  digits={2}
                  value={yFormatted}
                  defaultEmptyText={'0.00'}
                  delZero={false}
                />
              ) : (
                yFormatted
              )}
            </div>

            <div>{xFormatted}</div>
          </div>
        )
      }}
    />
  )
}

export default ResponsiveLineChart
