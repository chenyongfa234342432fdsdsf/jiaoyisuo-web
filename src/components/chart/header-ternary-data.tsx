import { Popover } from '@nbit/arco'
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import dayjs from 'dayjs'

import customParseFormat from 'dayjs/plugin/customParseFormat'
import isBetween from 'dayjs/plugin/isBetween'
import { IconFindReplace, IconSettings } from '@nbit/arco/icon'
import classNames from 'classnames'
import cacheUtils from 'store'

import {
  MainIndicatorType,
  SubIndicatorType,
  SwitchTimeType,
  KLineChartType,
  timeLocaleLanguageMap,
  TradingviewIndicatorType,
  tradingviewTimeMap,
} from '@nbit/chart-utils'

import { t } from '@lingui/macro'

import Icon from '@/components/icon'
import Tabs from '@/components/tabs'
import { useMarketStore } from '@/store/market'
// import { timeLocaleLanguageMap } from './utils'
import { AutoAddMarginCheckBox } from '@/features/trade/trade-order/base'
import { fullscreen } from '@/helper/common'
import { useTernaryOptionStore } from '@/store/ternary-option'
import IndicatorModal from './indicator-modal'
import styles from './chart.module.css'

interface PropsType {
  currentChart: string
  setCurrentChart: (value: string) => void
  locale: string
  mainIndicator: MainIndicatorType
  setMainIndicator: (value: MainIndicatorType) => void
  setOpenChartProperties: (value: string) => void
  subIndicator: SubIndicatorType
  setSubIndicator: (value: SubIndicatorType) => void
  curTime: SwitchTimeType
  setCurTime: (value: SwitchTimeType) => void
  fullscreenRef: React.RefObject<HTMLDivElement>
  updateFirstLoadRef: () => void
}

dayjs.extend(customParseFormat)
dayjs.extend(isBetween)

enum ChartVersion {
  Tradingview = 'tradingview',
  Normal = 'normal',
  Dept = 'dept',
}

function HeaderData(props: PropsType, ref) {
  // get TernaryOptionStore
  const marketState = useTernaryOptionStore()

  const initialShareTimeList = marketState.initialShareTimeList

  const { currentChart, locale, curTime, setCurTime } = props
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)

  return (
    <div
      className="k-set-wrap"
      style={{
        borderBottom: '1px solid var(--line_color_02)',
      }}
    >
      <div className="left-wrap">
        <div className="tile">
          <div
            className="tile-scroll"
            style={{
              maxWidth: 'calc(100% - 100px)',
              marginLeft: 0,
              overflowX: 'auto',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {currentChart !== ChartVersion.Dept &&
              initialShareTimeList.map((item, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => {
                      setCurTime(item)
                    }}
                    style={{ marginLeft: !index ? 0 : '12px' }}
                    className={classNames({
                      'tile-time': curTime.value === item.value && curTime.unit === item.unit,
                      'tile-unuse-time': curTime.value !== item.value || curTime.unit !== item.unit,
                    })}
                  >
                    {timeLocaleLanguageMap[locale]?.[`${item.value}${item.unit}`]}
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      <div className="right-wrap">
        {isFullScreen ? (
          <Icon
            onClick={() => {
              fullscreen(isFullScreen, props.fullscreenRef, setIsFullScreen)
            }}
            hasTheme
            name="icon_cancel_full"
            className="full-icon"
          />
        ) : (
          <Icon
            onClick={() => {
              fullscreen(isFullScreen, props.fullscreenRef, setIsFullScreen)
            }}
            hasTheme
            name="icon_full"
            className="full-icon"
          />
        )}
      </div>
    </div>
  )
}

export default forwardRef(HeaderData)
