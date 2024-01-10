import { Message, Slider } from '@nbit/arco'
import { useEffect, useRef, useState } from 'react'
import { getTaActivitiesSliderPoints } from '@/helper/agent'
import { t } from '@lingui/macro'
import styles from './index.module.css'

function marksFormatter(range, value, max) {
  return range.reduce((aggre, curr, index) => {
    if (index === 0)
      aggre[curr] = (
        <span>
          {t`features_agent_index_5101414`}{' '}
          <span className="text-text_color_01 text-xs font-normal">{max - value}%</span>
        </span>
      )
    else if (index === range.length - 1)
      aggre[curr] = (
        <span>
          {t`features_agent_index_5101357`} <span className="text-text_color_01 text-xs font-normal">{value}%</span>
        </span>
      )
    else aggre[curr] = ''
    return aggre
  }, {})
}

function RatioSlider({ value, max, onchange, originValue }) {
  const sliderRange = getTaActivitiesSliderPoints(max)
  const [currentValue, setcurrentValue] = useState(value)

  useEffect(() => {
    onchange && onchange(currentValue)
  }, [currentValue])

  if (max === 0) return <span></span>
  return (
    <Slider
      className={styles.scoped}
      value={currentValue}
      max={max}
      min={sliderRange[0]}
      marks={marksFormatter(sliderRange, currentValue, max)}
      onChange={v => {
        if (v < originValue) {
          Message.clear()
          Message.info(t`features_agent_referral_ratio_modal_ratio_slider_index_yex4uvnntu`)
          setcurrentValue(originValue)
          return
        }
        setcurrentValue(v)
      }}
    />
  )
}

export default RatioSlider
