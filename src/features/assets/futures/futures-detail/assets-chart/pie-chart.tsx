import { ResponsivePie } from '@nivo/pie'
import { useEffect, useState } from 'react'
import { decimalUtils } from '@nbit/utils'

const SafeCalcUtil = decimalUtils.SafeCalcUtil

export function PieChart({ data, totalPercent }) {
  const [pct, setPct] = useState(0)
  /** 是否处理百分比最大值，兼容多个相同的最大值，只减第一个 */
  const [isHandleMaxPercent, setIsHandleMaxPercent] = useState(false)
  /**
   * 计算资产占比图表数据
   */
  const onSetPieValue = pieItem => {
    let percent = pieItem.percent
    // 最大百分比大于 100 时，处理最大值 (为了兼容占比区间为（0%-1%）则展示为 1% ，占比区间为（99-100%）则展示为 99%)
    // 最大百分比小于 100 时，最大值加上剩余的百分比
    if (totalPercent > 100 || totalPercent < 100) {
      const maxPercentData = data.reduce((prev, current) => {
        return Number(prev.percent) > Number(current.percent) ? prev : current
      })
      const maxPercent = maxPercentData.percent

      if (Number(percent) === Number(maxPercent)) {
        if (Number(totalPercent) > 100) {
          percent = +SafeCalcUtil.sub(maxPercent, SafeCalcUtil.sub(totalPercent, 100))
        }
        if (Number(totalPercent) < 100) {
          percent = +SafeCalcUtil.add(maxPercent, SafeCalcUtil.sub(100, totalPercent))
        }
        setIsHandleMaxPercent(true)
        return percent
      }
    }

    return percent
  }

  function CenterLabelLayer({ centerX, centerY }) {
    return (
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          fill: 'var(--text_color_01)',
        }}
      >
        {pct}%
      </text>
    )
  }

  useEffect(() => {
    data && data.length > 0 && setPct(onSetPieValue(data[0]))
  }, [data])

  return (
    <ResponsivePie
      sortByValue
      data={data}
      // arcLinkLabel={d => `${onSetPieValue(d.data)}%`}
      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
      arcLinkLabelsDiagonalLength={8} // 链接对角线长度
      arcLinkLabelsStraightLength={8} // 链接直线段的长度
      arcLinkLabelsTextOffset={3} // 距链接末端的 X 偏移量
      innerRadius={0.5} // 内圈半径
      // arcLinkLabelsTextColor={'var(--text_color_01)'} // 连接标签文本颜色
      // arcLinkLabelsColor={{ from: 'color' }} // 连接标签线颜色
      enableArcLinkLabels={false} // 启用/禁用弧标签
      enableArcLabels={false} // 启用/禁用弧标签
      animate
      colors={(node: any) => {
        return `${node.data.color}`
      }}
      activeOuterRadiusOffset={8} // 悬浮动画效果
      tooltip={function (e) {
        return null
        // 悬浮动画内容
        // return (
        //   <div className="bg-card_bg_color_01 text-text_color_01 p-2 rounded">
        //     {e.datum.id} {e.datum.value}
        //   </div>
        // )
      }}
      layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', CenterLabelLayer]}
      onClick={node => {
        const _data: any = node.data
        setPct(onSetPieValue(_data))
      }}
      onMouseMove={node => {
        const _data: any = node.data
        setPct(onSetPieValue(_data))
      }}
      // isInteractive={false} // 悬浮动画
    />
  )
}
