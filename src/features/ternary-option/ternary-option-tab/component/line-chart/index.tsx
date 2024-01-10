import { ResponsiveLine } from '@nivo/line'
import CommonResponsiveLineChart from '@/components/common-line-chart'
import { ThemeEnum } from '@nbit/chart-utils'
import { useCommonStore } from '@/store/common'
import { IncreaseTag } from '@nbit/react'
import styles from './index.module.css'

function TernaryOptionLineChart({ data, currency }) {
  const { theme } = useCommonStore()
  const chartData = data?.[0]?.data || []
  const numbs = chartData.map(x => Number(x.y).toFixed())
  let yMin = Math.min(...numbs)
  let yMax = Math.max(...numbs)
  if (yMin === 0 && yMax === 0) {
    yMin = -10
    yMax = 10
  } else {
    yMin = Math.ceil(yMin)
    yMax = Math.ceil(yMax)
  }
  return (
    // <CommonResponsiveLineChart
    //   data={data}
    //   xScale={{
    //     type: 'time',
    //     format: '%H:%M:%S',
    //     useUTC: false,
    //     precision: 'hour',
    //   }}
    //   axisBottom={{
    //     format: '%H:%M:%S',
    //     // tickValues: `every ${calTickSpread(data)} days`,
    //     legendOffset: -12,
    //   }}
    //   width={550}
    //   height={260}
    // />
    <ResponsiveLine
      data={data}
      useMesh
      enableArea
      enablePoints
      curve={'linear'}
      enableGridX={false}
      crosshairType="cross"
      // xScale={{
      //   type: 'time',
      //   format: '%H:%M:%S',
      //   useUTC: false,
      //   precision: 'hour',
      // }}
      axisBottom={{
        // format: '%H:%M:%S',
        tickValues: [chartData?.[0]?.x, chartData?.[chartData.length - 1]?.x], // `every 24 hour`,
        legendOffset: -12,
      }}
      axisLeft={{
        tickSize: 11,
      }}
      yScale={{
        min: yMin,
        max: yMax,
        type: 'linear',
        stacked: false,
        reverse: false,
      }}
      theme={{
        grid: {
          line: {
            // line_color_02
            stroke: ThemeEnum.dark === theme ? '#323337' : '#F2F2F2',
            strokeWidth: 1,
            strokeDasharray: '4 4',
          },
        },
        axis: {
          ticks: {
            line: {
              strokeWidth: 0,
            },
            text: {
              // text_color_03
              fill: '#9D9D9D',
              fontSize: 11,
            },
          },
          domain: {
            line: {
              stroke: ThemeEnum.dark === theme ? '#323337' : '#F2F2F2',
              strokeWidth: 1,
            },
          },
        },
      }}
      // theme={{
      //   axis: {
      //     ticks: {
      //       line: {
      //         stroke: '#F2F2F2',
      //       },
      //       text: {
      //         fill: '#9D9D9D',
      //       },
      //     },
      //     domain: {
      //       line: {
      //         stroke: '#E3E3E5',
      //         strokeWidth: 1,
      //       },
      //     },
      //   },
      //   grid: {
      //     line: {
      //       stroke: '#F2F2F2',
      //       strokeWidth: 1,
      //       strokeDasharray: '4 4',
      //     },
      //   },
      // }}
      colors={(node: any) => {
        return `${node.color}`
      }}
      margin={{ top: 15, right: 52, bottom: 25, left: 62 }}
      defs={[
        {
          id: 'gradientC',
          type: 'linearGradient',
          colors: [
            { offset: 0, color: '#F1AE3D' },
            { offset: 100, color: '#FFFFFF' },
          ],
        },
      ]}
      fill={[{ match: '*', id: 'gradientC' }]}
      tooltip={({ point }) => {
        const { y } = point.data
        return (
          <div className={styles['chart-tooltip']}>
            {
              <IncreaseTag
                hasPrefix
                hasColor={false}
                kSign
                value={y}
                delZero={false}
                defaultEmptyText={'0'}
                hasPostfix={false}
                right={` ${currency}`}
              />
            }
          </div>
        )
      }}
    />
  )
}

export default TernaryOptionLineChart
