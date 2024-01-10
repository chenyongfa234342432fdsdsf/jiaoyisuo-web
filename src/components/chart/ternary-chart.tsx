import { Empty, Spin } from '@nbit/arco'
import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isBetween from 'dayjs/plugin/isBetween'
import classNames from 'classnames'
import cacheUtils from 'store'

import { KLineChart } from '@nbit/chart-web'
import {
  getTheme,
  ChartLayoutOptionsType,
  KLineChartData,
  MainIndicatorType,
  SubIndicatorType,
  SwitchTimeType,
  DeptChartData,
  timeMap,
  tradingviewTimeMap,
  WSThrottleTypeEnum,
  sortMarketChartData,
  TimeSharingType,
} from '@nbit/chart-utils'
import { getIsLogin } from '@/helper/auth'

import { usePageContext } from '@/hooks/use-page-context'

import { YapiGetV1OrdersHistoryKlineListData } from '@/typings/yapi/OrdersHistoryKlineV1GetApi'
import { initMainIndicator, initSubIndicator, ChartKLineRequest } from '@/constants/market'
import { useMemoizedFn, useSafeState, useUnmount } from 'ahooks'
import { WsThrottleTimeEnum } from '@/constants/ws'

import { useTradeStore } from '@/store/trade'

import { useUserStore } from '@/store/user'
import { UserUpsAndDownsColorEnum } from '@/constants/user'
import { translateUrlToParams } from '@/helper/market'
import { t } from '@lingui/macro'
import { useCommonStore } from '@/store/common'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { getV1OptionMarketDealCountApiRequest, getV1OptionMarketKlinesApiRequest } from '@/apis/ternary-option'
import { OrderBookOptionKlineSubs } from '@/store/order-book/common'
import optionWs from '@/plugins/ws/option'
import { initOptionMainIndicator, initOptionSubIndicator } from '@/constants/ternary-option'
import { OptionOrder } from '@/plugins/ws/protobuf/ts/proto/OptionOrder'
import { oss_svg_image_domain_address } from '@/constants/oss'
import Lottie from 'lottie-react'
// import { KLineChart } from './src'
import HeaderData from './header-ternary-data'
import redUpJsonData from './animation/red-up.json'
import redDownJsonData from './animation/red-down.json'
import redOverUpJsonData from './animation/red-over-up.json'
import redOverDownJsonData from './animation/red-over-down.json'
import loadingJsonData from './animation/loading.json'
import loadingCompleteJsonData from './animation/loading-complete.json'
import greenUpJsonData from './animation/green-up.json'
import greenOverUpJsonData from './animation/green-over-up.json'
import greenDownJsonData from './animation/green-down.json'
import greenOverDownJsonData from './animation/green-over-down.json'
import winJsonData from './animation/data.json'

import styles from './chart.module.css'
import { SpotNotAvailable } from './not-available'
import Icon from '../icon'

for (let i = 0; i < 9; i += 1) {
  winJsonData.assets[i].u = oss_svg_image_domain_address
  winJsonData.assets[i].p = `option1/img_${i}.png`
}

dayjs.extend(customParseFormat)
dayjs.extend(isBetween)

enum ChartVersion {
  Tradingview = 'tradingview',
  Normal = 'normal',
  Dept = 'dept',
}

function KLine() {
  let currentModule
  const contractKline = {
    // perpetual_index_kline: getPerpetualMarketRestV1MarketIndexPriceKlinesApiRequest,
    // perpetual_market_kline: getPerpetualMarketRestV1MarketMarketPriceKlinesApiRequest,
    // perpetual_kline: getPerpetualMarketRestV1MarketKlinesApiRequest,
    kline: getV1OptionMarketKlinesApiRequest,
  }
  const TradeStore = useTradeStore()

  const { layout, setting } = TradeStore
  const useStore = useUserStore()
  const commonState = useCommonStore()
  const theme = commonState?.theme
  const { wsOptionOrderSubscribe, wsOptionOrderUnSubscribe } = useTernaryOptionStore() || {}
  const marketState = useTernaryOptionStore()
  const { personalCenterSettings } = useStore
  const colors = personalCenterSettings.colors || UserUpsAndDownsColorEnum.greenUpRedDown
  const isLogin = getIsLogin()
  const currentModuleRef = useRef<any>(null)
  const ws = optionWs

  currentModule = marketState

  useEffect(() => {
    currentModuleRef.current = currentModule
  }, [currentModule])
  const controlRef = useRef<boolean>(true)

  const priceOffset =
    Number(currentModule.currentCoin.priceOffset) || currentModule.currentCoin.last?.split('.')?.[1]?.length || 4
  const amountOffset =
    Number(currentModule.currentCoin.amountOffset) || currentModule.currentCoin.last?.split('.')?.[1]?.length || 4

  const {
    bgColor,
    textColor,
    brandColor,
    upColor,
    downColor,
    textColor01,
    upSpecialColor02,
    downSpecialColor02,
    cardBgColor02,
    textColor02,
  } = getTheme()
  const [ordersKlineData, setOrdersKlineData] = useSafeState<YapiGetV1OrdersHistoryKlineListData[]>([])
  const [currentChart, setCurrentChart] = useSafeState<string>(ChartVersion.Normal)
  const [curData, setCurData] = useSafeState<Array<KLineChartData>>([])
  const [getDataAndUpdateChart, setGetDataAndUpdateChart] = useSafeState<number>(0)
  const [getOrderDataIndex, setGetOrderDataIndex] = useSafeState<number>(0)
  const [ordersData, setOrdersData] = useSafeState<any>([])

  // const [currentPriceType, setCurrentPriceType] = useSafeState('perpetual_kline')
  // const currentPriceTypeRef = useRef('perpetual_kline')
  const curDataRef = useRef<Array<KLineChartData>>([])
  const tradingviewRef = useRef<{
    chartProperties: () => void
    insertIndicator: () => void
  }>(null)
  const onlineRef = useRef<boolean>(true)
  const firstLoadRef = useRef<boolean>(false)
  const pageVisibelRef = useRef<boolean>(false)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const [mainIndicator, setMainIndicator] = useSafeState<MainIndicatorType>(initOptionMainIndicator)

  const pageContext = usePageContext()
  const locale = pageContext?.locale || ''
  const urlPar = pageContext?.routeParams?.id

  const childRef = useRef<{
    updateCandlestickData: (data, ref) => void
    updateTimeData: (data, ref) => void
    updateVolumeData: (data) => void
    updateMaData: () => void
    updateWrData: () => void
    updateRsiData: () => void
    updateKdjData: () => void
    updateBollData: () => void
    updateMacdData: () => void
    scrollToTime: (v) => void
  }>()

  const modalRef = useRef<{
    openChartSettingModal: () => void
  }>()

  const [subIndicator, setSubIndicator] = useSafeState<SubIndicatorType>(initOptionSubIndicator)

  const mainIndicatorStorage = cacheUtils.get('mainIndicator') || '{}'
  const subIndicatorStorage = cacheUtils.get('subIndicator') || '{}'
  const KlineWs = {
    Sub: 1,
    unSub: 0,
    OutSub: 2,
    Second: 3,
  }
  const [klineWs, setKlineWs] = useSafeState<number>(KlineWs.unSub)
  const symbolName = translateUrlToParams(pageContext.routeParams.id)

  useEffect(() => {
    if (!currentModule.currentCoin.symbolName) {
      return
    }
    let chartRequestInterval

    chartRequestInterval = setInterval(() => {
      if (!navigator.onLine) {
        onlineRef.current = false
      } else {
        if (!onlineRef.current) {
          controlRef.current = false
          getKlineHistoryData(currentModule.currentCoin.id, curTimeRef.current, null, ChartKLineRequest.OutLine)
        }
      }
    }, 10000)

    const visibleChange = () => {
      // 页面变为可见时触发
      if (document.visibilityState === 'visible') {
        controlRef.current = false
        setKlineWs(KlineWs.unSub)
        pageVisibelRef.current = true
        requestAnimationFrame(() => {
          getKlineHistoryData(currentModule.currentCoin.id, curTimeRef.current, null, ChartKLineRequest.OutLine)
        })
      }
    }
    document.addEventListener('visibilitychange', visibleChange)
    return () => {
      clearInterval(chartRequestInterval)
      document.removeEventListener('visibilitychange', visibleChange)
    }
  }, [currentModule.currentCoin.symbolName])

  useEffect(() => {
    setKlineWs(KlineWs.unSub)
    return () => {
      controlRef.current = false
      curDataRef.current = []
      setCurData([])
    }
  }, [symbolName])

  const [curTime, setCurTime] = useSafeState<SwitchTimeType>({
    unit: 's',
    value: 1,
  })

  const [chartLayoutOptions, setChartLayoutOptions] = useSafeState<
    ChartLayoutOptionsType & { fontSize: number; fontFamily: string }
  >({
    background: {
      color: bgColor,
    },
    textColor,
    fontSize: 10,
    fontFamily:
      "DINPro, -apple-system, system-ui, 'PingFang SC', 'Microsoft Yahei', 'Heiti SC', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  })

  const curTimeRef = useRef<SwitchTimeType>(curTime)

  useEffect(() => {
    curTimeRef.current = curTime
  }, [curTime.value, curTime.unit])

  const getOrderDataHistory = (id, timeSharing, param?) => {
    const time = timeMap[`${timeSharing.value}${timeSharing.unit}`]

    getV1OptionMarketDealCountApiRequest({
      interval: time,
      optionId: id,
      limit: '1440',
      endTime: param?.time || undefined,
    }).then(res => {
      setOrdersData(res.data || [])
    })
  }
  useEffect(() => {
    if (!currentModule.currentCoin.id) {
      return
    }
    if (!isLogin) {
      return
    }

    getOrderDataHistory(currentModule.currentCoin.id, curTime)
  }, [isLogin, currentModule.currentCoin.id, curTime, getOrderDataIndex])

  useEffect(() => {
    const kLineCallback = data => {
      // 更新实时报价信息
      /** 如果页面已被销毁，就不设置值了，防止接口没有返回，页面已经切换了其它币种 */
      if (!controlRef.current) return

      if (data?.[0]?.time) {
        if (currentModuleRef.current?.currentCoin.symbol !== data?.[0]?.symbol) {
          return
        }
        if (pageVisibelRef.current) {
          setGetDataAndUpdateChart(new Date().valueOf() + 1)
          pageVisibelRef.current = false
        }

        data.forEach(item => {
          const value = {
            time: Number(item.time),
            open: Number(item.open),
            /** 后端返回数据有时候最高价小于开盘价，前端容错 */
            high: item.high < item.open ? item.open : item.high,
            low: item.low < item.close ? item.low : item.close,
            close: Number(item.close),
            volume: Number(item.volume),
            quoteVolume: Number(item.quoteVolume),
          }
          if (curDataRef.current?.length) {
            /** 图表拉取数据时，ws要根据当前选择的时间，来调整k线柱子，比如1小时k线，ws就在1小时跳动，这里要加入时间的判断 */
            const lastValue = Number(curDataRef.current[curDataRef.current.length - 1]?.time)

            /** sentry出现ws返回的时间比k线时间小的情况，按理说是不会的，容错处理 */
            if (value.time >= lastValue) {
              /** 时间不等时，判断图表所处时间范围 */
              if (
                lastValue === value.time ||
                (value.time > lastValue &&
                  value.time <
                    lastValue +
                      (curTimeRef.current.unit === TimeSharingType.Second
                        ? 1000
                        : Number(tradingviewTimeMap[`${curTimeRef.current.value}${curTimeRef.current.unit}`]) *
                          60 *
                          1000))
              ) {
                const newCurData = curDataRef.current.map((item, index) => {
                  if (index === curDataRef.current.length - 1) {
                    return {
                      ...value,
                      open: item.open,
                      volume: Number((value.volume + (item.volume || 0)).toFixed(amountOffset)),
                      quoteVolume: Number((value.quoteVolume + (item.quoteVolume || 0)).toFixed(amountOffset)),
                      high: value.high > item.high ? value.high : item.high,
                      low: value.low < item.low ? value.low : item.low,
                      time: item.time,
                    }
                  }
                  return item
                })
                // setCurData(sortMarketChartData(newCurData))
                curDataRef.current = newCurData
                updateIndSetting()
              } else {
                const newCurData = sortMarketChartData(curDataRef.current.concat([value]))
                // setCurData(newCurData)
                curDataRef.current = newCurData
              }

              const newValue = curDataRef.current[curDataRef.current.length - 1]
              if (curTimeRef.current?.unit === 'time' || curTimeRef.current?.unit === 's') {
                childRef.current?.updateTimeData(
                  {
                    ...newValue,
                    value: newValue.close,
                  },
                  curDataRef.current
                )
              } else {
                childRef.current?.updateCandlestickData(newValue, curDataRef.current)
              }
              childRef.current?.updateVolumeData({
                ...newValue,
                time: newValue.time,
                value: newValue.volume,
                quoteVolume: newValue.quoteVolume,
                dir: newValue.close > newValue.open ? 'rise' : 'fall',
              })
            }
          }
        })
      }
    }

    const subs = OrderBookOptionKlineSubs(currentModuleRef.current?.currentCoin.symbol, curTimeRef.current)
    if (klineWs === KlineWs.Sub || klineWs === KlineWs.OutSub || klineWs === KlineWs.Second) {
      ws.subscribe({
        subs,
        callback: kLineCallback,
        throttleType: WSThrottleTypeEnum.increment,
        throttleTime: WsThrottleTimeEnum.Fast,
      })
    }

    return () => {
      if (klineWs !== KlineWs.unSub) {
        ws.unsubscribe({
          subs,
          callback: kLineCallback,
        })
      }
    }
  }, [klineWs])

  useEffect(() => {
    const _bgColor = getTheme().bgColor
    const _textColor = getTheme().textColor
    setChartLayoutOptions({
      background: {
        color: _bgColor,
      },
      textColor: _textColor,
      fontSize: 10,
      fontFamily:
        "DINPro, -apple-system, system-ui, 'PingFang SC', 'Microsoft Yahei', 'Heiti SC', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    })
  }, [theme])

  /** ws 更新图表指标 */
  const updateIndSetting = () => {
    /** 如果设置了下面的指标，在 ws 改变的时候，会同时改变下面的指标，切换时间指标后，会导致可能出现 ws 数据不对的情况 */
    childRef.current?.updateMaData()
    childRef.current?.updateWrData()
    childRef.current?.updateRsiData()
    childRef.current?.updateKdjData()
    childRef.current?.updateBollData()
    childRef.current?.updateMacdData()
  }

  const apiTimeRef = useRef<Array<number>>([])

  let apiRequest = contractKline.kline

  /** 请求 k 线数据 */
  const getKlineHistoryData = (id, timeSharing, param?, requestType?) => {
    controlRef.current = true
    const symbol = symbolName
    const time = timeMap[`${timeSharing.value}${timeSharing.unit}`]
    const params = {
      // symbol,
      interval: time,
      optionId: id,
      limit: String(24 * 60),
      endTime: param?.time || undefined,
    }
    let apiRequest = contractKline.kline

    apiRequest(params).then(res => {
      if (res.isOk) {
        /** 如果页面已被销毁，就不设置值了，防止接口没有返回，页面已经切换了其它币种 */
        if (!controlRef.current) return
        const klineData: Array<KLineChartData> = []
        if (res.data?.list?.length) {
          res.data?.list?.forEach(item => {
            const barValue = {
              time: Number(item[6]),
              open: Number(item[0]),
              close: Number(item[3]),
              quoteVolume: Number(item[5]),
              volume: Number(item[4]),
              /** 后端返回数据有时候最高价小于开盘价，前端容错 */
              high: Number(item[1]) < Number(item[0]) ? Number(item[0]) : Number(item[1]),
              low: Number(item[2]) > Number(item[3]) ? Number(item[3]) : Number(item[2]),
            }
            klineData.push(barValue)
          })

          if (requestType === ChartKLineRequest.OutLine) {
            onlineRef.current = true
          }

          /** 滚动图表，如果接口返回的数据为空，就把之前的数据返回 */
          if (param?.time) {
            setCurData(sortMarketChartData(klineData).concat(curDataRef.current))
            curDataRef.current = sortMarketChartData(sortMarketChartData(klineData).concat(curDataRef.current))
          } else {
            /** 如果不是滚动的时候拉取数据，就把已记录的时间清空，这么做是为了防止图表滚动到最左侧的时候，频繁的去拉取接口 */
            apiTimeRef.current = []

            setCurData(sortMarketChartData(klineData))
            curDataRef.current = sortMarketChartData(klineData)
          }
          setGetDataAndUpdateChart(new Date().valueOf())

          /** 时间取整，行情异动的时间可能非 k 线柱子 */
          if (currentModule.marketChangesTime) {
            if (
              currentModule.marketChangesTime <
              curDataRef.current[curDataRef.current.length - 1].time - 1000 * 60 * 60 * 24
            ) {
              childRef.current?.scrollToTime(
                Math.floor(currentModule.marketChangesTime / 1000 / 60 / 60) * 1000 * 60 * 60
              )
            } else {
              childRef.current?.scrollToTime(Math.floor(currentModule.marketChangesTime / 1000 / 60) * 1000 * 60)
            }
          }
        }
        /** 非依赖请求 k 线时，不需要重新订阅 */
        if (!requestType) {
          setKlineWs(KlineWs.Sub)
        }
        if (requestType === ChartKLineRequest.OutLine) {
          setKlineWs(KlineWs.OutSub)
        }
        if (curTimeRef.current?.unit === TimeSharingType.Second) {
          setKlineWs(KlineWs.Second)
        }
      }
    })
  }

  /** 图表滚动的时候去拉去更多的数据，拼接在图表数据的头部 */
  const getMoreKlineData = param => {
    if (apiTimeRef.current?.indexOf(param.time) !== -1) {
      return
    } else {
      let value: any = apiTimeRef.current
      apiTimeRef.current = value.concat([param.time])
    }
    getKlineHistoryData(currentModule.currentCoin.id, curTimeRef.current, param, ChartKLineRequest.More)
    getOrderDataHistory(currentModule.currentCoin.id, curTimeRef.current, param)
  }

  useEffect(() => {
    if (!currentModule.marketChangesTime || !curDataRef.current?.length) {
      return
    }

    if (
      currentModule.marketChangesTime <
      curDataRef.current[curDataRef.current.length - 1].time - 1000 * 60 * 60 * 24
    ) {
      if (curTimeRef.current?.value === 1 && curTimeRef.current?.unit === 'h') {
        getKlineHistoryData(currentModule.currentCoin.id, curTimeRef.current, null, ChartKLineRequest.MarketChanges)
      } else {
        setCurTime({
          value: 1,
          unit: 'h',
        })
      }
    } else {
      if (curTimeRef.current?.value === 1 && curTimeRef.current?.unit === 'm') {
        getKlineHistoryData(currentModule.currentCoin.id, curTimeRef.current, null, ChartKLineRequest.MarketChanges)
      } else {
        setCurTime({
          value: 1,
          unit: 'm',
        })
      }
    }
  }, [currentModule.marketChangesTime])

  useEffect(() => {
    if (!currentModule.currentCoin.symbolName) {
      return
    }

    setCurData([])
    curDataRef.current = []
    // if (currentModule.currentCoin.id && currentChart !== ChartVersion.Dept && isLogin && layout.kLineHistory) {
    //   getOrdersHistoryKline({
    //     tradeId: currentModule.currentCoin.id,
    //   }).then(res => {
    //     if (res.isOk) {
    //       setOrdersKlineData((res.data as YapiGetV1OrdersHistoryKlineListData[]) || [])
    //     }
    //   })
    // }
    if (currentModule.currentCoin.id && curTime.value) {
      getKlineHistoryData(currentModule.currentCoin.id, curTime)
    }

    return () => {
      controlRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentModule.currentCoin.symbolName,
    curTime.unit,
    curTime.value,
    isLogin,
    layout.kLineHistory,
    // currentPriceTypeRef.current,
  ])

  const [openChartProperties, setOpenChartProperties] = useSafeState<string>('')

  const updateFirstLoadRef = () => {
    firstLoadRef.current = true
  }

  const updateMainIndicator = v => {
    setMainIndicator(v)
  }

  const updateSubIndicator = v => {
    setSubIndicator(v)
  }

  const onOrderWsCallBack = useMemoizedFn((data: OptionOrder[]) => {
    if (data?.length === 0) {
      return
    }
    // 这里写代码
    setGetOrderDataIndex(new Date().valueOf())
  })

  useEffect(() => {
    if (!isLogin) return

    wsOptionOrderSubscribe(onOrderWsCallBack)
  }, [isLogin])

  useUnmount(() => {
    wsOptionOrderUnSubscribe(onOrderWsCallBack)
  })

  return (
    <div className={styles.scoped} ref={fullscreenRef} id="fullscreen">
      <SpotNotAvailable className="not-avi" tradeCoin={currentModule.currentCoin}>
        <HeaderData
          ref={modalRef}
          currentChart={currentChart}
          setCurrentChart={setCurrentChart}
          locale={locale}
          mainIndicator={mainIndicator}
          setMainIndicator={setMainIndicator}
          setOpenChartProperties={setOpenChartProperties}
          subIndicator={subIndicator}
          setSubIndicator={setSubIndicator}
          curTime={curTime}
          setCurTime={setCurTime}
          fullscreenRef={fullscreenRef}
          updateFirstLoadRef={updateFirstLoadRef}
        />
        <div className={classNames('chart-wrap')}>
          <div
            className={classNames('chart-common', {
              show: currentChart === ChartVersion.Normal,
              hidden: currentChart !== ChartVersion.Normal,
            })}
          >
            {currentChart === ChartVersion.Normal &&
              (curDataRef.current.length && curData?.length ? (
                <KLineChart
                  theme={theme}
                  chartLayoutOptions={chartLayoutOptions}
                  data={curData}
                  curDataRef={curDataRef.current}
                  locale={locale}
                  createChart={{
                    brandColor,
                    upColor,
                    downColor,
                    bgColor,
                    textColor,
                    textColor01,
                    upSpecialColor02,
                    downSpecialColor02,
                    cardBgColor02,
                    textColor02,
                  }}
                  mainIndicator={mainIndicator}
                  updateMainIndicator={updateMainIndicator}
                  subIndicator={subIndicator}
                  updateSubIndicator={updateSubIndicator}
                  curTime={curTime}
                  ref={childRef}
                  modalRef={modalRef.current}
                  ordersKlineData={ordersKlineData}
                  ordersData={ordersData}
                  expandIcon={<Icon name="arrow_open" hasTheme className="expand-icon" />}
                  chartSettingIcon={{
                    hidden: <Icon name="spot_hidden" hasTheme className="expand-icon" />,
                    setting: <Icon name="icon_spot_set" hasTheme className="expand-icon" />,
                    delete: <Icon name="spot_close" hasTheme className="expand-icon" />,
                    hiddenHover: <Icon name="spot_hidden_hover" hasTheme className="expand-icon" />,
                    settingHover: <Icon name="icon_spot_set_hover" hasTheme className="expand-icon" />,
                    deleteHover: <Icon name="spot_close_hover" hasTheme className="expand-icon" />,
                  }}
                  coinInfo={{
                    baseSymbolName: currentModule.currentCoin.baseSymbolName,
                    quoteSymbolName: currentModule.currentCoin.quoteSymbolName,
                  }}
                  getDataAndUpdateChart={getDataAndUpdateChart}
                  getMoreKlineData={getMoreKlineData}
                  offset={{ priceOffset, amountOffset }}
                  updateMarketChangesTime={currentModule.updateMarketChangesTime}
                  colors={colors}
                  optionBuyCallback={currentModule.optionBuyCallback}
                  optionSellCallback={currentModule.optionSellCallback}
                  optionActiveTab={currentModule.optionActiveTab}
                  countDownComponent={currentModule.countDownComponent}
                  tradeRestSecond={currentModule.tradeRestSecond}
                  optionIcon={{
                    up: (
                      <Icon
                        name={
                          colors === UserUpsAndDownsColorEnum.greenUpRedDown
                            ? 'icon_options_levitate_rise_up'
                            : 'icon_options_levitate_fall_up'
                        }
                        className="text-[34px]"
                      />
                    ),
                    down: (
                      <Icon
                        name={
                          colors === UserUpsAndDownsColorEnum.greenUpRedDown
                            ? 'icon_options_levitate_fall_down'
                            : 'icon_options_levitate_rise_down'
                        }
                        className="text-[34px]"
                      />
                    ),
                    overUp: (
                      <Icon
                        name={
                          colors === UserUpsAndDownsColorEnum.greenUpRedDown
                            ? 'icon_options_levitate_rise_more_up'
                            : 'icon_options_levitate_fall_more_up'
                        }
                        className="text-[34px]"
                      />
                    ),
                    overDown: (
                      <Icon
                        name={
                          colors === UserUpsAndDownsColorEnum.greenUpRedDown
                            ? 'icon_options_levitate_fall_more_down'
                            : 'icon_options_levitate_rise_more_down'
                        }
                        className="text-[34px]"
                      />
                    ),
                  }}
                  optionAnimation={{
                    win: <Lottie animationData={winJsonData} loop={false} autoPlay />,
                    call: (
                      <Lottie
                        animationData={
                          colors === UserUpsAndDownsColorEnum.greenUpRedDown ? greenUpJsonData : redUpJsonData
                        }
                        loop={false}
                        autoPlay
                      />
                    ),
                    put: (
                      <Lottie
                        animationData={
                          colors === UserUpsAndDownsColorEnum.greenUpRedDown ? redDownJsonData : greenDownJsonData
                        }
                        loop={false}
                        autoPlay
                      />
                    ),
                    over_call: (
                      <Lottie
                        animationData={
                          colors === UserUpsAndDownsColorEnum.greenUpRedDown ? greenOverUpJsonData : redOverUpJsonData
                        }
                        loop={false}
                        autoPlay
                      />
                    ),
                    over_put: (
                      <Lottie
                        animationData={
                          colors === UserUpsAndDownsColorEnum.greenUpRedDown
                            ? redOverDownJsonData
                            : greenOverDownJsonData
                        }
                        loop={false}
                        autoPlay
                      />
                    ),
                    loading: <Lottie animationData={loadingCompleteJsonData} loop={false} autoPlay />,
                  }}
                />
              ) : (
                <div className="spin-wrap">
                  <Spin />
                </div>
              ))}
          </div>
        </div>
      </SpotNotAvailable>
    </div>
  )
}

export default KLine
