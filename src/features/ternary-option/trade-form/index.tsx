import { useLayoutStore } from '@/store/layout'
import { KLineChartType } from '@nbit/chart-utils'
import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { useCommonStore } from '@/store/common'
import { useGetWsAssets } from '@/hooks/features/assets'
import Icon from '@/components/icon'
import { Button, Checkbox, Message, Modal, Radio, Slider, Spin, Table, Tooltip } from '@nbit/arco'
import { t } from '@lingui/macro'
import { usePageContext } from '@/hooks/use-page-context'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { useUserStore } from '@/store/user'
import {
  getV1OptionProductPeriodsApiRequest,
  getV1OptionProductYieldRateApiRequest,
  postV1OptionOrdersPlaceApiRequest,
  postV1OptionPlanOrdersPlaceApiRequest,
} from '@/apis/ternary-option'
import { getCoinBalance } from '@/apis/assets/main'
import { formatCurrency, formatNonExponential, formatNumberDecimalDelZero } from '@/helper/decimal'
import { decimalUtils } from '@nbit/utils'
import { AssetWsSubscribePageEnum } from '@/constants/assets'
import { Asset_Body } from '@/plugins/ws/protobuf/ts/proto/Asset'
import {
  OptionGuideCache,
  OPTION_GUIDE_ELEMENT_IDS_ENUM,
  TernaryTabTypeEnum,
  TernaryOptionTradeDirectionEnum,
  TernaryOptionIdEnum,
  TernaryBuyTypeEnum,
  OptionGuideType,
} from '@/constants/ternary-option'
import { link } from '@/helper/link'
import Link from '@/components/link'
import { getCacheAgentBindUser, setCacheAgentBindUser } from '@/helper/cache/option'
import { UserUpsAndDownsColorEnum } from '@/constants/user'
import { WsBizEnum, WsThrottleTimeEnum, WsTypesEnum } from '@/constants/ws'
import optionWs from '@/plugins/ws/option'
import { WSThrottleTypeEnum } from '@/plugins/ws/constants'
import { ISubscribeParams } from '@/plugins/ws/types'
import AsyncSuspense from '@/components/async-suspense'
import ErrorBoundary from '@/components/error-boundary'
import { getMergeModeStatus } from '@/features/user/utils/common'
import Tabs from '@/components/tabs'
import { formatTradePair } from '@/helper/market'
import { useHover, usePrevious } from 'ahooks'
import { YapiGetV1OptionProductPeriodsListData } from '@/typings/yapi/OptionProductPeriodsV1GetApi'
import { getCodeDetailListBatch } from '@/apis/common'
import { I18nsEnum } from '@/constants/i18n'
import { useHelpCenterUrl } from '@/hooks/use-help-center-url'
import CouponSelect from '@/features/welfare-center/common/coupon-select'
import { ICoupons } from '@/typings/api/welfare-center/coupons-select'
import { BusinessSceneEnum } from '@/constants/welfare-center/coupon-select'
import { YapiPostV1OptionPlanOrdersPlaceApiRequestListCoupons } from '@/typings/yapi/OptionPlanOrdersPlaceV1PostApi'
import { sendRefreshCouponSelectApiNotify } from '@/helper/welfare-center/coupon-select'
import { useGetCouponSelectList } from '@/hooks/features/welfare-center/coupon-select'
import Styles from './index.module.css'
import UpAndDown from './up-and-down'
import TradeInputNumber from '../trade-input-number'
import CountDown from './count-down'
import QuickTradeCountDown from './quick-trade-count-down'
// import { TernaryOptionTradeGuide } from './guide'

const RadioGroup = Radio.Group
const priceSource = 'mark_price'

interface HeaderProps {
  type: KLineChartType
}

const TernaryOptionTradeGuide = React.lazy(() => import('./guide'))

/** 三元期权是否为涨 */
function isUpOptionDirection(direction: TernaryOptionTradeDirectionEnum | string) {
  return [TernaryOptionTradeDirectionEnum.call, TernaryOptionTradeDirectionEnum.overCall].includes(
    direction as TernaryOptionTradeDirectionEnum
  )
}
/** 三元期权是否为涨超、跌超 */
function isOverOptionDirection(direction: TernaryOptionTradeDirectionEnum | string) {
  return [TernaryOptionTradeDirectionEnum.overCall, TernaryOptionTradeDirectionEnum.overPut].includes(
    direction as TernaryOptionTradeDirectionEnum
  )
}

const ternaryOptionTradeDirectionMap = () => {
  return {
    [TernaryOptionTradeDirectionEnum.call]: t`features_ternary_option_trade_form_index_4vstfyckf4`,
    [TernaryOptionTradeDirectionEnum.put]: t`features_ternary_option_trade_form_index_mwkepdklwp`,
    [TernaryOptionTradeDirectionEnum.overCall]: t`features_ternary_option_trade_form_index_wksh3pany7`,
    [TernaryOptionTradeDirectionEnum.overPut]: t`features_ternary_option_trade_form_index_wkr5bjtk7h`,
  }
}

const ternaryOptionTradeDirectionTextMap = () => {
  return {
    [TernaryOptionTradeDirectionEnum.call]: t`features/orders/details/future-6`,
    [TernaryOptionTradeDirectionEnum.put]: t`features/orders/details/future-5`,
    [TernaryOptionTradeDirectionEnum.overCall]: t`features_ternary_option_trade_form_index_wksh3pany7`,
    [TernaryOptionTradeDirectionEnum.overPut]: t`features_ternary_option_trade_form_index_wkr5bjtk7h`,
  }
}

/** 下单间隔 */
const PlanRestSecond = 30

function Header() {
  const { headerData } = useLayoutStore()
  useGetCouponSelectList(BusinessSceneEnum.option)
  const ternaryOptionTradeDirectionMapColor = {
    [TernaryOptionTradeDirectionEnum.call]: 'text-buy_up_color',
    [TernaryOptionTradeDirectionEnum.put]: 'text-sell_down_color',
    [TernaryOptionTradeDirectionEnum.overCall]: 'text-buy_up_color',
    [TernaryOptionTradeDirectionEnum.overPut]: 'text-sell_down_color',
  }

  const [actions, setActions] = useState<any>([])
  const [rateList, setRateList] = useState<any>([])
  const [ratetotalList, setRateTotalList] = useState<any>([])
  const [rateOtherList, setRateOtherList] = useState<any>([])

  const { isMergeMode } = useCommonStore()

  const multiplicationList = [
    {
      value: '2',
      text: '2x',
    },
  ]

  const tempMultiplicationList = [10, 20, 50, 100]

  const pageContext = usePageContext()
  const ternryOptionState = useTernaryOptionStore()
  const { setOptionTab } = ternryOptionState

  const [showGuideType, setShowGuideType] = useState<string>('')
  const symbolName = pageContext.routeParams.id

  const [curStatus, setCurStatus] = useState<{
    dir: TernaryOptionTradeDirectionEnum | string
    time: string
  }>({
    dir: '',
    time: '',
  })

  const [curIncome, setCurIncome] = useState({
    price: '',
    rate: '',
  })

  const [curOtherIncome, setCurOtherIncome] = useState({
    price: '',
    rate: '',
  })

  const [checkboxValue, setCheckboxValue] = useState<string>(TernaryBuyTypeEnum.Normal)
  const [intelCheckboxValue, setIntelCheckboxValue] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<number | string>('')
  const [inputFrequencyValue, setInputFrequencyValue] = useState<number | string>('')
  const [inputAmountValue, setInputAmountValue] = useState<number | string>('')

  const [amountList, setAmountList] = useState<Array<number>>([])
  const [selectList, setSelectList] = useState<Array<number>>([])
  const [initialList, setInitialList] = useState<Array<number>>([])

  const [buttonLoading, setButtonLoading] = useState<boolean>(false)
  const [clickOverVisible, setClickOverVisible] = useState<boolean>(false)

  const [frequencyVisible, setFrequencyVisible] = useState<boolean>(false)
  const [amountVisible, setAmountVisible] = useState<boolean>(false)
  const [intelVisible, setIntelVisible] = useState<boolean>(false)
  const [restSecond, setRestSecond] = useState<number>(0)

  const [editAmountVisible, setEditAmountVisible] = useState<boolean>(false)
  const [optionGuideVisible, setOptionGuideVisible] = useState<boolean>(false)

  const [availableAmount, setAvailableAmount] = useState<string>('')
  // const [clickCurrentIndex, setClickCurrentIndex] = useState<number>(-1)
  const [percent, setPercent] = useState(0)
  const [timeStamp, setTimeStamp] = useState<number>(0)

  const [activeTab, setActiveTab] = useState<string | number>(TernaryOptionIdEnum.binaryOption)

  const optionAmountList = getCacheAgentBindUser(OptionGuideCache.optionAmountList)

  const userStore = useUserStore()

  const { personalCenterSettings } = userStore

  // 已选优惠券列表
  const [coupons, setCoupons] = useState<YapiPostV1OptionPlanOrdersPlaceApiRequestListCoupons[] | any>([])
  // 已选体验金，合约和期权开仓需要
  const [voucherAmount, setVoucherAmount] = useState('')

  useEffect(() => {
    if (!optionAmountList) {
      return
    }
    setInitialList(optionAmountList)
    setSelectList(optionAmountList)
  }, [JSON.stringify(optionAmountList)])

  const tabList = [
    {
      title: t`features_ternary_option_trade_form_index_ovuimlq73j`,
      id: TernaryOptionIdEnum.binaryOption,
    },
    {
      title: t`features_trade_trade_header_pop_menu_index_pweylulaexiyla3oov_3y`,
      id: TernaryOptionIdEnum.ternaryOption,
    },
  ]

  const findValue = (arr, key, value) => {
    return arr.filter(item => {
      return item[key]?.toString() === value?.toString()
    })?.[0]
  }

  const text = t({
    id: 'features_ternary_option_trade_form_index_v_6hj0aq_a',
    values: {
      0: findValue(actions, 'value', curStatus.time)?.text,
      1: ternryOptionState?.currentCoin?.tradeInfo?.baseSymbolName,
    },
  })

  const selectLiTime = value => {
    setCurStatus({
      ...curStatus,
      time: value,
    })
  }

  const selectLiMul = value => {
    if (!value?.value) {
      setInputValue(Number(value))
      return
    }
    const result = (Number(inputValue) || ternryOptionState.currentCoin.minAmount) * value.value
    setInputValue(result > ternryOptionState.currentCoin.maxAmount ? ternryOptionState.currentCoin.maxAmount : result)
  }

  const optionOrdersPlace = (fromDown?) => {
    // if (!curStatus.dir) {
    //   return Message.info(t`features_ternary_option_trade_form_index_wofcl7qmop`)
    // }
    if (!inputValue) {
      return Message.info(t`features_ternary_option_trade_form_index_racfebgz5j`)
    }

    if (Number(availableAmount) < Number(inputValue)) {
      return Message.info(t`features_ternary_option_trade_form_index_4edzlijuyt`)
    }
    let yieldId = 0
    if (activeTab === TernaryOptionIdEnum.binaryOption) {
      yieldId = rateList?.[0]?.id || 0
      if (fromDown) {
        yieldId = rateOtherList?.[0]?.id
      }
    } else {
      yieldId = findValue(rateList, 'amplitude', percent)?.id

      if (fromDown) {
        yieldId = findValue(rateOtherList, 'amplitude', -percent)?.id
      }
    }

    if (!yieldId) {
      return
    }
    setButtonLoading(true)

    const sideInd =
      activeTab === TernaryOptionIdEnum.binaryOption
        ? !fromDown
          ? TernaryOptionTradeDirectionEnum.call
          : TernaryOptionTradeDirectionEnum.put
        : !fromDown
        ? TernaryOptionTradeDirectionEnum.overCall
        : TernaryOptionTradeDirectionEnum.overPut
    postV1OptionOrdersPlaceApiRequest({
      optionId: ternryOptionState?.currentCoin?.id || 0,
      periodId: findValue(actions, 'value', curStatus.time)?.id,
      yieldId,
      sideInd,
      amount: Number(inputValue) || 0,
      coupons,
      voucherAmount,
    })
      .then(res => {
        if (res.isOk) {
          Message.success(t`features/orders/details/modify-stop-limit-0`)
          sendRefreshCouponSelectApiNotify()
          setRestSecond(actions[0]?.limitRange || PlanRestSecond)

          // setInputValue('')
          // setCurStatus({
          //   ...curStatus,
          //   dir: '',
          // })
          // setCurIncome({
          //   price: '',
          //   rate: '',
          // })
          // setPercent(0)
          setOptionTab(TernaryTabTypeEnum.position)
        }
      })
      .finally(() => {
        setButtonLoading(false)
      })
  }

  const intelCheckboxValueMap = {
    true: 1,
    false: 2,
  }

  const optionOrdersPlanPlace = (fromDown?) => {
    // if (!curStatus.dir) {
    //   return Message.info(t`features_ternary_option_trade_form_index_wofcl7qmop`)
    // }
    if (!inputValue) {
      return Message.info(t`features_ternary_option_trade_form_index_racfebgz5j`)
    }

    if (Number(availableAmount) < Number(inputValue)) {
      return Message.info(t`features_ternary_option_trade_form_index_4edzlijuyt`)
    }

    if (!inputFrequencyValue) {
      return Message.info(t`features_ternary_option_trade_form_index_gnwr93svca`)
    }
    if (!inputAmountValue) {
      return Message.info(t`features_ternary_option_trade_form_index_uybuayy_lr`)
    }
    let yieldId = rateList?.[0]?.id
    if (fromDown) {
      yieldId = rateOtherList?.[0]?.id
    }
    if (!yieldId) {
      return
    }
    setButtonLoading(true)
    postV1OptionPlanOrdersPlaceApiRequest({
      optionId: ternryOptionState?.currentCoin?.id || 0,
      periodId: findValue(actions, 'value', curStatus.time)?.id,
      yieldId,
      sideInd: fromDown ? TernaryOptionTradeDirectionEnum.put : TernaryOptionTradeDirectionEnum.call,
      amount: Number(inputValue) || 0,
      cycles: Number(inputFrequencyValue) || 0,
      maxAmount: Number(inputAmountValue) || 0,
      isSmart: intelCheckboxValueMap[intelCheckboxValue?.toString()],
      coupons,
      voucherAmount,
    })
      .then(res => {
        if (res.isOk) {
          Message.success(t`features/orders/details/modify-stop-limit-0`)
          sendRefreshCouponSelectApiNotify()
          // setInputValue('')
          setInputFrequencyValue('')
          setInputAmountValue('')
          // setCheckboxValue(TernaryBuyTypeEnum.Normal)
          setOptionTab(TernaryTabTypeEnum.position)
          setIntelCheckboxValue(false)
          setRestSecond(actions[0]?.limitRange || PlanRestSecond)
        }
      })
      .finally(() => {
        setButtonLoading(false)
      })
  }

  const getTimeList = () => {
    getV1OptionProductPeriodsApiRequest({
      optionId: String(ternryOptionState?.currentCoin?.id),
    }).then(res => {
      if (res.isOk) {
        const _actions =
          res.data?.map(item => {
            return {
              ...item,
              value: item.period >= 60 ? `${item.period / 60}m` : `${item.period}s`,
              text:
                item.period >= 60
                  ? `${item.period / 60}${t`features_ternary_option_trade_form_index_0yieh6myhw`}`
                  : `${item.period}${t`features_ternary_option_trade_form_index_0yieh6myhw1`}`,
            }
          }) || []
        setActions(_actions)
        setCurStatus({
          dir: '',
          time: _actions[0]?.value,
        })
      }
    })
  }

  /** 计算收益率 & 价格 */
  const getPriceAndRate = () => {
    if (rateList?.length && rateOtherList?.length) {
      if (activeTab === TernaryOptionIdEnum.binaryOption) {
        const value = Number(rateList[0]?.yield || rateList[0]?.yieldRate)
        const putValue = Number(rateOtherList[0]?.yield || rateOtherList[0]?.yieldRate)
        const price = `>${ternryOptionState?.currentCoin?.last}`
        const putPrice = `<${ternryOptionState?.currentCoin?.last}`
        const rate = isMergeMode
          ? formatNumberDecimalDelZero(decimalUtils.SafeCalcUtil.add(value, 1), 4)
          : `${(value * 100).toFixed(2)}%`

        const putRate = isMergeMode
          ? formatNumberDecimalDelZero(decimalUtils.SafeCalcUtil.add(putValue, 1), 4)
          : `${(putValue * 100).toFixed(2)}%`
        setCurIncome({
          price,
          rate,
        })
        setCurOtherIncome({
          price: putPrice,
          rate: putRate,
        })
      } else {
        const price = `>${decimalUtils.SafeCalcUtil.add(
          ternryOptionState?.currentCoin?.last,
          decimalUtils.SafeCalcUtil.mul(percent, 1)
        )?.toString()}`
        const putPrice = `<${decimalUtils.SafeCalcUtil.add(
          ternryOptionState?.currentCoin?.last,
          decimalUtils.SafeCalcUtil.mul(percent, -1)
        )?.toString()}`
        const value =
          findValue(rateList, 'amplitude', percent)?.yield || findValue(rateList, 'amplitude', percent)?.yieldRate || 0

        const putValue =
          findValue(rateOtherList, 'amplitude', -percent)?.yield ||
          findValue(rateOtherList, 'amplitude', -percent)?.yieldRate ||
          0
        const rate = isMergeMode
          ? formatNumberDecimalDelZero(decimalUtils.SafeCalcUtil.add(value, 1), 4)
          : `${(value * 100).toFixed(2)}%`
        const putRate = isMergeMode
          ? formatNumberDecimalDelZero(decimalUtils.SafeCalcUtil.add(putValue, 1), 4)
          : `${(putValue * 100).toFixed(2)}%`
        setCurIncome({
          price,
          rate,
        })
        setCurOtherIncome({
          price: putPrice,
          rate: putRate,
        })
      }
    }
  }

  useEffect(() => {
    if (!rateList?.length || !activeTab || !rateOtherList?.length) {
      return
    }

    getPriceAndRate()
  }, [activeTab, percent, rateList, rateOtherList, ternryOptionState?.currentCoin?.last])

  const dealData = (data, _activeTab) => {
    const putList = data.filter(item => {
      return item.sideInd === TernaryOptionTradeDirectionEnum.put
    })

    const callList = data.filter(item => {
      return item.sideInd === TernaryOptionTradeDirectionEnum.call
    })

    const overCallList = data.filter(item => {
      return item.sideInd === TernaryOptionTradeDirectionEnum.overCall
    })

    const overPutList = data.filter(item => {
      return item.sideInd === TernaryOptionTradeDirectionEnum.overPut
    })

    overCallList.sort((a, b) => {
      return Number(a?.amplitude) - Number(b?.amplitude)
    })

    overPutList.sort((a, b) => {
      return Number(a?.amplitude) - Number(b?.amplitude)
    })

    if (_activeTab === TernaryOptionIdEnum.binaryOption) {
      setRateList(callList)
      setRateOtherList(putList)
    } else {
      setRateList(overCallList)
      setRateOtherList(overPutList)
    }

    if (!percent) {
      setPercent(Number(overCallList[0]?.amplitude))
    }
  }

  const getYieldRateList = () => {
    if (!ternryOptionState?.currentCoin?.id || !curStatus.time) {
      return
    }
    getV1OptionProductYieldRateApiRequest({
      optionId: String(ternryOptionState?.currentCoin?.id),
      periodId: findValue(actions, 'value', curStatus.time)?.id,
      // sideInd: curStatus.dir,
    }).then(res => {
      if (res.isOk) {
        if (res.data?.length) {
          setRateTotalList(res.data)
        }
      }
    })
  }

  const clearAllStatus = () => {
    setInputFrequencyValue('')
    setInputAmountValue('')
    setInputValue('')
    setCurStatus({
      dir: '',
      time: '',
    })
    setCurIncome({
      price: '',
      rate: '',
    })
    setCurOtherIncome({
      price: '',
      rate: '',
    })
    setPercent(0)
    setRateList([])
    setRateOtherList([])
    setRateTotalList([])
    setCheckboxValue(TernaryBuyTypeEnum.Normal)
    setActiveTab(TernaryOptionIdEnum.binaryOption)
    setIntelCheckboxValue(false)
  }

  useEffect(() => {
    if (!ternryOptionState?.currentCoin?.id || !curStatus.time || !actions?.length || !userStore.isLogin) {
      return
    }

    getYieldRateList()
  }, [ternryOptionState?.currentCoin?.id, curStatus.time, actions, userStore.isLogin])

  const inputOnchange = value => {
    setInputValue(value)
  }

  const inputFrequencyOnchange = value => {
    setInputFrequencyValue(value)
  }

  const inputAmountOnchange = value => {
    setInputAmountValue(value)
  }

  const checkboxOnchange = value => {
    setCheckboxValue(value)
    if (value === TernaryBuyTypeEnum.Advance) {
      const showGuideAdvanced = getCacheAgentBindUser(OptionGuideCache.optionAdvancedStep)
      if (!showGuideAdvanced) {
        // setFrequencyVisible(true)
        setShowGuideType(OptionGuideType.advance)
        setCacheAgentBindUser(OptionGuideCache.optionAdvancedStep, true)
      }
    }
  }

  const intelCheckboxOnchange = value => {
    setIntelCheckboxValue(value)
  }

  useEffect(() => {
    if (ratetotalList?.length) {
      dealData(ratetotalList, activeTab)
    }
  }, [ratetotalList, activeTab])

  const colors = personalCenterSettings.colors || UserUpsAndDownsColorEnum.greenUpRedDown

  function onSliderChange(_percent) {
    let realPercent = 0
    for (let i = 0; i < rateList?.length; i += 1) {
      const left = Number(_percent) - Number(rateList[i]?.amplitude)
      const right = Number(rateList[i + 1]?.amplitude) - Number(_percent)
      if (Number(_percent) >= Number(rateList[i]?.amplitude) && Number(_percent) <= Number(rateList[i + 1].amplitude)) {
        if (left <= right) {
          realPercent = Number(rateList[i]?.amplitude)
          setPercent(realPercent)
          break
        } else {
          realPercent = Number(rateList[i + 1]?.amplitude)
          setPercent(realPercent)
          break
        }
      }
    }
  }

  function formatTooltip(val) {
    return <span>{`±${val}`}</span>
  }

  const fetchAssets = async coinId => {
    const res = await getCoinBalance({
      coinId,
    })
    if (!res.isOk || !res.data) {
      return
    }

    const coin = res.data?.list?.find(item => item.coinId?.toString() === coinId?.toString())

    // 只返回可用余额
    setAvailableAmount(formatNonExponential(Number(coin?.availableAmount || 0)))
  }

  useEffect(() => {
    if (!ternryOptionState?.currentCoin?.id || !userStore.isLogin) {
      return
    }
    // @ts-ignore
    fetchAssets(ternryOptionState?.currentCoin?.coinId)
  }, [ternryOptionState?.currentCoin?.id, userStore.isLogin])

  /** ws 回调 */
  const coinAssetWSCallBack = async (data: Asset_Body) => {
    setAvailableAmount(formatNonExponential(Number(data?.[0]?.total || 0)))
  }

  // websocket 推送资产
  useGetWsAssets({ wsCallBack: coinAssetWSCallBack, page: AssetWsSubscribePageEnum.other })

  const minAmplitude = Number(rateList?.[0]?.amplitude)
  const maxAmplitude = Number(rateList?.[(rateList?.length || 0) - 1]?.amplitude)

  useEffect(() => {
    getCodeDetailListBatch(['option_common_amount']).then(res => {
      const data =
        res?.[0]?.map((item: any) => {
          return Number(item.codeVal)
        }) || tempMultiplicationList
      setAmountList(data)
      if (!optionAmountList) {
        setInitialList(data.slice(0, 4))
        setSelectList(data.slice(0, 4))
      }
    })
  }, [])

  useEffect(() => {
    if (!ternryOptionState?.currentCoin?.id) {
      return
    }
    const showGuideBinary = getCacheAgentBindUser(OptionGuideCache.optionBinaryStep)
    if (!showGuideBinary) {
      setOptionGuideVisible(true)
    }
  }, [ternryOptionState?.currentCoin?.id])

  useEffect(() => {
    if (!userStore.isLogin || !ternryOptionState?.currentCoin?.id || !curStatus.time || !actions?.length) {
      return
    }
    const onRateChange = data => {
      if (data?.[0]?.list?.length) {
        setRateTotalList(data[0].list)
      }
    }
    const subscribeParams: ISubscribeParams[] = [
      {
        subs: {
          biz: WsBizEnum.option,
          type: WsTypesEnum.optionYields,
          contractCode: `${ternryOptionState?.currentCoin?.id}_${findValue(actions, 'value', curStatus.time)?.id}`,
        },
        throttleTime: WsThrottleTimeEnum.Market,
        throttleType: WSThrottleTypeEnum.cover,
        callback: onRateChange,
      },
    ]
    subscribeParams.forEach(({ callback, ...params }) => {
      optionWs.subscribe({
        ...params,
        callback,
      })
    })
    return () => {
      subscribeParams.forEach(params => {
        optionWs.unsubscribe(params)
      })
    }
  }, [userStore.isLogin, ternryOptionState?.currentCoin?.id, curStatus.time, actions])

  useEffect(() => {
    if (!ternryOptionState?.currentCoin?.id) {
      return
    }

    clearAllStatus()
    getTimeList()
  }, [ternryOptionState?.currentCoin?.id])

  const onBlur = e => {
    if (Number(e.target.value) < ternryOptionState?.currentCoin?.minAmount) {
      setInputValue(ternryOptionState?.currentCoin?.minAmount)
    }
  }

  const coinData = ternryOptionState?.currentCoin

  const prevLast = usePrevious(coinData.last)

  const locale = pageContext.locale

  let step = 1
  let amplitudeLength = 0
  rateList?.forEach(item => {
    const index = item.amplitude?.indexOf('.')
    if (index !== -1) {
      const calcLength = item.amplitude?.substring(index + 1, item.amplitude?.length)
      if (calcLength?.length > amplitudeLength) {
        amplitudeLength = calcLength?.length
      }
    }
  })

  const videoUrl = useHelpCenterUrl('option_video') || ''

  step = amplitudeLength ? 1 / 10 ** amplitudeLength : step

  const iconRef = useRef(null)
  const isHovering = useHover(iconRef)

  const buyUpFunc = () => {
    checkboxValue === TernaryBuyTypeEnum.Advance && activeTab === TernaryOptionIdEnum.binaryOption
      ? optionOrdersPlanPlace()
      : optionOrdersPlace()
  }

  const buyDownFunc = () => {
    checkboxValue === TernaryBuyTypeEnum.Advance && activeTab === TernaryOptionIdEnum.binaryOption
      ? optionOrdersPlanPlace(true)
      : optionOrdersPlace(true)
  }

  useEffect(() => {
    ternryOptionState.updateOptionBuyCallback(buyUpFunc)
    ternryOptionState.updateOptionSellCallback(buyDownFunc)
  }, [
    userStore.isLogin,
    checkboxValue,
    activeTab,
    inputValue,
    curStatus.time,
    actions,
    rateList,
    rateOtherList,
    percent,
  ])

  useEffect(() => {
    ternryOptionState.updateOptionActiveTab(activeTab)
  }, [activeTab])

  useEffect(() => {
    ternryOptionState.updateTradeRestSecond(restSecond)
    ternryOptionState.updateCountDownComponent(type => {
      return <QuickTradeCountDown restSecond={restSecond} setRestSecond={setRestSecond} type={type} />
    })
  }, [restSecond])
  return (
    <div className={Styles.scoped}>
      <div className="home-wrap py-0.5">
        <Spin loading={buttonLoading} className="w-full">
          <UpAndDown />
          <div className="w-full relative">
            <Tabs
              mode="line"
              needGuide={[OPTION_GUIDE_ELEMENT_IDS_ENUM.binary, OPTION_GUIDE_ELEMENT_IDS_ENUM.ternary]}
              value={activeTab}
              classNames="futures-tabs-wrap"
              tabList={tabList}
              onChange={val => {
                setActiveTab(val.id)
                if (val.id === TernaryOptionIdEnum.ternaryOption) {
                  const showGuideTernary = getCacheAgentBindUser(OptionGuideCache.optionTernaryStep)
                  if (!showGuideTernary) {
                    setShowGuideType(OptionGuideType.ternaryOption)
                    setCacheAgentBindUser(OptionGuideCache.optionTernaryStep, true)
                  }
                }
              }}
            />
            <div
              ref={iconRef}
              onClick={() => {
                if (activeTab === TernaryOptionIdEnum.binaryOption) {
                  setCheckboxValue(TernaryBuyTypeEnum.Normal)

                  setShowGuideType(OptionGuideType.binaryOptionAndAdvance)
                } else {
                  setShowGuideType(OptionGuideType.ternaryOption)
                }
              }}
              className="absolute right-4 top-4 text-text_color_03 text-xs font-normal leading-3 cursor-pointer"
            >
              {isHovering ? (
                <>
                  <Icon name="icon_option_guide_hover" className="text-xs mr-1" />
                  <span className="text-brand_color">{t`features/trade/index-3`}</span>
                </>
              ) : (
                <>
                  <Icon name="icon_option_guide" hasTheme className="text-xs mr-1" />
                  <span>{t`features/trade/index-3`}</span>
                </>
              )}
            </div>
          </div>
          <div className="w-full h-[1px] bg-line_color_02"></div>
          {activeTab === TernaryOptionIdEnum.binaryOption ? (
            <div className="buy-type-wrap">
              <div className="common-text-title-14">{t`features_ternary_option_trade_form_index_sovn7pc3ri`}</div>
              <div className="radio-wrap">
                <RadioGroup defaultValue={TernaryBuyTypeEnum.Normal} value={checkboxValue} onChange={checkboxOnchange}>
                  <Radio value={TernaryBuyTypeEnum.Normal}>
                    {({ checked }) => {
                      return checked ? (
                        <>
                          <Icon name="icon_options_selected" className="text-sm" />{' '}
                          <span className="ml-1 text-sm text-brand_color">{t`features_ternary_option_trade_form_index_5izijenrn4`}</span>
                        </>
                      ) : (
                        <>
                          <Icon name="icon_options_unselected" className="text-sm" hasTheme />{' '}
                          <span className="ml-1 text-sm hover:text-brand_color">{t`features_ternary_option_trade_form_index_5izijenrn4`}</span>
                        </>
                      )
                    }}
                  </Radio>

                  <Radio value={TernaryBuyTypeEnum.Advance} className="!mr-0">
                    {({ checked }) => {
                      return checked ? (
                        <div id={OPTION_GUIDE_ELEMENT_IDS_ENUM.advance}>
                          <Icon name="icon_options_selected" className="text-sm" />{' '}
                          <span className="ml-1 text-sm text-brand_color">{t`features_ternary_option_trade_form_index_m6azpdbxcz`}</span>
                        </div>
                      ) : (
                        <div id={OPTION_GUIDE_ELEMENT_IDS_ENUM.advance}>
                          <Icon name="icon_options_unselected" className="text-sm" hasTheme />{' '}
                          <span className="ml-1 text-sm hover:text-brand_color">{t`features_ternary_option_trade_form_index_m6azpdbxcz`}</span>
                        </div>
                      )
                    }}
                  </Radio>
                </RadioGroup>
              </div>
            </div>
          ) : null}
          <div className="trade-wrap">
            {activeTab === TernaryOptionIdEnum.ternaryOption ? (
              <div id={OPTION_GUIDE_ELEMENT_IDS_ENUM.ternaryPercent}>
                <div className="text-text_color_02">{t`features_ternary_option_trade_form_index_vasck9mtko`}</div>
                <Slider
                  className="slider-wrap"
                  disabled={!userStore.isLogin}
                  marks={{
                    [minAmplitude]: `±${minAmplitude}`,
                    [maxAmplitude]: `±${maxAmplitude}`,
                  }}
                  value={percent}
                  step={step}
                  min={minAmplitude || 0}
                  max={maxAmplitude || 100}
                  onChange={onSliderChange}
                  // defaultValue={0}
                  formatTooltip={formatTooltip}
                />
              </div>
            ) : null}
            <div
              className="w-full"
              id={
                activeTab === TernaryOptionIdEnum.binaryOption
                  ? OPTION_GUIDE_ELEMENT_IDS_ENUM.binaryPlan
                  : OPTION_GUIDE_ELEMENT_IDS_ENUM.ternaryPlan
              }
            >
              <div className="amount-wrap">
                <div className="common-text-content-14-02">
                  {t`features_ternary_option_trade_form_index_ofajdmsbpf`}
                  <Icon
                    hasTheme
                    name="rebates_edit"
                    className="text-xs  ml-1"
                    onClick={() => {
                      setEditAmountVisible(true)
                    }}
                  />
                </div>
                <div className="common-text-content-14-02 !leading-[18px]">
                  {t`features_ternary_option_trade_form_index_zytmnxmige`}({ternryOptionState?.currentCoin?.coinSymbol}
                  ):
                  <span className="common-text-title-14 ml-1 !leading-[18px]">{availableAmount}</span>
                  <Icon
                    name="a-spot_available"
                    className="text-xs  ml-1"
                    onClick={() => {
                      link('/assets/main/deposit')
                    }}
                  />
                </div>
              </div>
              <TradeInputNumber
                className="trade-input"
                precision={ternryOptionState?.currentCoin?.priceOffset || 2}
                // min={ternryOptionState?.currentCoin?.minAmount}
                max={ternryOptionState?.currentCoin?.maxAmount}
                suffix={
                  inputValue ? (
                    <Icon
                      name="close"
                      onClick={() => {
                        setInputValue('')
                      }}
                      hasTheme
                      className="text-xs ml-2"
                    />
                  ) : null
                }
                onBlur={onBlur}
                formatter={item => {
                  return inputValue as any
                }}
                value={inputValue}
                onChange={inputOnchange}
                placeholder={`${t`features_ternary_option_trade_form_index_8zn9xcwe1h`}${
                  ternryOptionState?.currentCoin?.minAmount || 10
                } ${ternryOptionState?.currentCoin?.coinSymbol || 'USDT'}`}
                prefix={t`features_trade_trade_amount_input_index_5101476`}
              />
              <CouponSelect
                businessScene={BusinessSceneEnum.option}
                symbol={ternryOptionState?.currentCoin?.coinSymbol}
                margin={inputValue}
                onChange={c => {
                  setCoupons(c?.coupons)
                  setVoucherAmount(c?.voucherAmount as any)
                }}
              />

              <div className="all-mul">
                {initialList?.map((item, index) => {
                  return (
                    <div
                      className={classNames('mul-li h-6 bg-bg_sr_color text-text_color_02 rounded', {
                        'ml-2': index !== 0,
                        // 'h-6': index < 3 && commonState?.locale !== I18nsEnum['zh-HK'],
                      })}
                      onClick={() => {
                        selectLiMul(item)
                      }}
                      key={index}
                    >
                      {item}
                    </div>
                  )
                })}
                <div
                  className={classNames('mul-li h-6 bg-bg_sr_color text-text_color_02 rounded ml-2', {
                    // 'h-6': index < 3 && commonState?.locale !== I18nsEnum['zh-HK'],
                  })}
                  onClick={() => {
                    selectLiMul(multiplicationList[0])
                  }}
                >
                  {multiplicationList[0].text}
                </div>
              </div>
              {checkboxValue === TernaryBuyTypeEnum.Advance && activeTab === TernaryOptionIdEnum.binaryOption ? (
                <>
                  <div className="mt-4">
                    <Tooltip mini content={t`features_ternary_option_trade_form_index_xpozgsahgn`}>
                      <span
                        id={OPTION_GUIDE_ELEMENT_IDS_ENUM.advanceMaxSum}
                        style={{
                          borderBottom: '1px dashed var(--text_color_02)',
                        }}
                        className="text-text_color_02"
                      >{t`features_ternary_option_trade_form_index_xj4qthe3c2`}</span>
                    </Tooltip>
                  </div>
                  <TradeInputNumber
                    className="trade-input advan-trade-input"
                    precision={0}
                    min={1}
                    max={999999999}
                    value={inputFrequencyValue}
                    onChange={inputFrequencyOnchange}
                    placeholder={t`features_ternary_option_trade_form_index_djrqjo1nr5`}
                  />
                  <div className="mt-4">
                    <Tooltip mini content={t`features_ternary_option_trade_form_index_gnzenhdwab`}>
                      <span
                        id={OPTION_GUIDE_ELEMENT_IDS_ENUM.advanceMaxAmount}
                        style={{
                          borderBottom: '1px dashed var(--text_color_02)',
                        }}
                        className="text-text_color_02"
                      >{t`features_ternary_option_trade_form_index_w0cl0r4doh`}</span>
                    </Tooltip>
                  </div>
                  <TradeInputNumber
                    className="trade-input advan-trade-input"
                    precision={0}
                    min={ternryOptionState?.currentCoin?.minAmount}
                    max={999999999}
                    value={inputAmountValue}
                    onChange={inputAmountOnchange}
                    placeholder={t`features_ternary_option_trade_form_index_jc9_j43kyz`}
                  />
                  <div className="flex justify-between mt-3 checkbox-wrap">
                    <div id={OPTION_GUIDE_ELEMENT_IDS_ENUM.advanceAuto}>
                      <Checkbox checked={intelCheckboxValue} onChange={intelCheckboxOnchange}>
                        {({ checked }) => {
                          return checked ? (
                            <Icon name="login_verify_selected" />
                          ) : (
                            <Icon name="login_verify_unselected" hasTheme />
                          )
                        }}
                      </Checkbox>

                      <Tooltip mini content={t`features_ternary_option_trade_form_index_xs5cai8bca`}>
                        <span
                          className="ml-1 common-text-content-12-01 cursor-pointer"
                          style={{
                            borderBottom: '1px dashed var(--text_color_02)',
                          }}
                        >{t`features_ternary_option_trade_form_index_khkeazi_wp`}</span>
                      </Tooltip>
                    </div>
                  </div>
                </>
              ) : null}
              <div
                style={{
                  width: 'calc(100% + 32px)',
                  marginLeft: '-16px',
                }}
                className="mt-4 h-[1px] bg-line_color_02"
              ></div>
              <div
                className="all-time mt-4"
                style={{
                  maxWidth: '100%',
                  overflowX: 'auto',
                }}
              >
                {actions?.map((item, index) => {
                  return (
                    <div
                      className={classNames('time-li h-[30px] rounded', {
                        'select-time-li': curStatus.time === item.value,
                        'not-select-time-li': curStatus.time !== item.value,
                        'ml-[11px]': index !== 0,
                      })}
                      onClick={() => {
                        selectLiTime(item.value)
                      }}
                      key={index}
                    >
                      {item.text}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="dir-wrap">
            <div className="mt-3">
              <span className="common-text-content-14-02">
                {ternryOptionState?.currentCoin?.priceSource === priceSource
                  ? t`future.funding-history.index-price.column.mark-price`
                  : t`future.funding-history.index-price.column.index-price`}
              </span>
              <span className={classNames('last-price ml-2')}>
                {formatTradePair(coinData as any).ternaryOptionLastWithDiffTarget(prevLast as any)}
              </span>
            </div>
            <div className="mt-3 flex items-center">
              <div
                style={{
                  width: 'calc((100% - 10px) / 2)',
                }}
                className="flex items-center common-text-content-14-02"
              >
                <Tooltip mini content={t`features_ternary_option_trade_form_index_dhuf8rafe9`}>
                  <span
                    className="cursor-pointer h-[16px] leading-[14px]"
                    style={{
                      borderBottom: '1px dashed var(--text_color_02)',
                    }}
                  >{t`features_ternary_option_trade_form_index_1qdylzztl0`}</span>
                </Tooltip>

                <span className="common-text-title-14 ml-2">{curIncome.price}</span>
              </div>
              <div
                style={{
                  width: 'calc((100% - 10px) / 2)',
                }}
                className="flex  items-center common-text-content-14-02 ml-[10px]"
              >
                <Tooltip mini content={t`features_ternary_option_trade_form_index_dhuf8rafe9`}>
                  <span
                    className="cursor-pointer h-[16px] leading-[14px]"
                    style={{
                      borderBottom: '1px dashed var(--text_color_02)',
                    }}
                  >{t`features_ternary_option_trade_form_index_1qdylzztl0`}</span>
                </Tooltip>

                <span className="common-text-title-14 ml-2">{curOtherIncome.price}</span>
              </div>
            </div>

            <div
              className="mt-[7px] flex button-disable"
              id={
                activeTab === TernaryOptionIdEnum.binaryOption
                  ? OPTION_GUIDE_ELEMENT_IDS_ENUM.binaryDir
                  : OPTION_GUIDE_ELEMENT_IDS_ENUM.ternaryDir
              }
            >
              <div className="buy-button-wrap">
                <Button
                  // loading={buttonLoading}
                  type="primary"
                  className={classNames('button common-text-title-14 buy-up-color !text-xs', {
                    // '!text-xs': curIncome.rate?.length > 7 && locale === I18nsEnum['en-US'],
                  })}
                  disabled={!!restSecond}
                  onClick={() => {
                    if (!userStore.isLogin) {
                      link(`/login?redirect=${pageContext.path}`)
                    } else {
                      buyUpFunc()
                    }
                  }}
                >
                  {userStore.isLogin ? (
                    restSecond ? (
                      <CountDown restSecond={restSecond} setRestSecond={setRestSecond} />
                    ) : (
                      `(${
                        isMergeMode
                          ? t`features_ternary_option_trade_form_index_ws9rgn5jlq`
                          : t`features_ternary_option_trade_form_index_wykzdkzyqq`
                      }${curIncome.rate})${t`features/user/personal-center/settings/payment/index-29999`}${
                        activeTab === TernaryOptionIdEnum.binaryOption
                          ? ternaryOptionTradeDirectionMap()[TernaryOptionTradeDirectionEnum.call]
                          : ternaryOptionTradeDirectionMap()[TernaryOptionTradeDirectionEnum.overCall]
                      }`
                    )
                  ) : (
                    <span>
                      <Link href={`/login?redirect=${pageContext.path}`}> {t`user.field.reuse_07`} </Link>
                      {t`user.third_party_01`}
                      <Link href="/register"> {t`user.validate_form_11`} </Link>
                    </span>
                  )}
                </Button>
              </div>

              <div className="sell-button-wrap">
                <Button
                  // loading={buttonLoading}
                  disabled={!!restSecond}
                  type="primary"
                  className={classNames('button ml-[10px] common-text-title-14 sell-down-color !text-xs', {
                    // '!text-xs': curOtherIncome.rate?.length > 7 && locale === I18nsEnum['en-US'],
                  })}
                  onClick={() => {
                    if (!userStore.isLogin) {
                      link(`/login?redirect=${pageContext.path}`)
                    } else {
                      buyDownFunc()
                    }
                  }}
                >
                  {userStore.isLogin ? (
                    restSecond ? (
                      <CountDown restSecond={restSecond} setRestSecond={setRestSecond} />
                    ) : (
                      `(${
                        isMergeMode
                          ? t`features_ternary_option_trade_form_index_ws9rgn5jlq`
                          : t`features_ternary_option_trade_form_index_wykzdkzyqq`
                      }${curOtherIncome.rate})${t`features/user/personal-center/settings/payment/index-29999`}${
                        activeTab === TernaryOptionIdEnum.binaryOption
                          ? ternaryOptionTradeDirectionMap()[TernaryOptionTradeDirectionEnum.put]
                          : ternaryOptionTradeDirectionMap()[TernaryOptionTradeDirectionEnum.overPut]
                      }`
                    )
                  ) : (
                    <span>
                      <Link href={`/login?redirect=${pageContext.path}`}> {t`user.field.reuse_07`} </Link>
                      {t`user.third_party_01`}
                      <Link href="/register"> {t`user.validate_form_11`} </Link>
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Spin>
      </div>
      <AsyncSuspense hasLoading>
        <ErrorBoundary>
          <TernaryOptionTradeGuide
            setCheckboxValue={setCheckboxValue}
            showGuideType={showGuideType}
            setShowGuideType={setShowGuideType}
          />
        </ErrorBoundary>
      </AsyncSuspense>

      {/* <Modal
        className={Styles['modal-frequency']}
        visible={frequencyVisible}
        title={t`features_ternary_option_trade_form_index_xj4qthe3c2`}
        closeIcon={<Icon className="text-xl" name="close" hasTheme />}
        footer={
          <Button
            type="primary"
            onClick={() => {
              setFrequencyVisible(false)
              setAmountVisible(true)
            }}
          >{t`user.field.reuse_23`}</Button>
        }
        onCancel={() => {
          setFrequencyVisible(false)
        }}
      >
        <span className="text-text_color_01 text-sm leading-[22px]">{t`features_ternary_option_trade_form_index_xpozgsahgn`}</span>
      </Modal>

      <Modal
        className={Styles['modal-amount']}
        visible={amountVisible}
        closeIcon={<Icon className="text-xl" name="close" hasTheme />}
        title={t`features_ternary_option_trade_form_index_w0cl0r4doh`}
        footer={
          <Button
            type="primary"
            onClick={() => {
              setAmountVisible(false)
              setIntelVisible(true)
            }}
          >{t`user.field.reuse_23`}</Button>
        }
        onCancel={() => {
          setAmountVisible(false)
        }}
      >
        <span className="text-text_color_01 text-sm leading-[22px]">{t`features_ternary_option_trade_form_index_gnzenhdwab`}</span>
      </Modal>

      <Modal
        className={Styles['modal-intel']}
        visible={intelVisible}
        closeIcon={<Icon className="text-xl" name="close" hasTheme />}
        title={t`features_ternary_option_trade_form_index_khkeazi_wp`}
        footer={
          <Button
            type="primary"
            onClick={() => {
              setIntelVisible(false)
              setCacheAgentBindUser(OptionGuideCache.optionAdvanced, true)
            }}
          >{t`features_trade_spot_index_2510`}</Button>
        }
        onCancel={() => {
          setIntelVisible(false)
        }}
      >
        <span className="text-text_color_01 text-sm leading-[22px]">{t`features_ternary_option_trade_form_index_xs5cai8bca`}</span>
      </Modal> */}

      <Modal
        className={Styles['modal-amount-select']}
        visible={editAmountVisible}
        closeIcon={<Icon className="text-xl" name="close" hasTheme />}
        title={t`features_ternary_option_trade_form_index_ofajdmsbpf`}
        footer={
          <div className="w-full">
            <Button
              className={'button'}
              onClick={() => {
                setSelectList(initialList)
                setEditAmountVisible(false)
              }}
            >{t`trade.c2c.cancel`}</Button>
            <Button
              className={'button ml-4'}
              type="primary"
              onClick={() => {
                setEditAmountVisible(false)
                setInitialList(selectList)
                setCacheAgentBindUser(OptionGuideCache.optionAmountList, selectList)
              }}
            >{t`user.field.reuse_17`}</Button>
          </div>
        }
        onCancel={() => {
          setEditAmountVisible(false)
        }}
      >
        <span className="text-text_color_02 text-sm leading-[22px]">{t`features_ternary_option_trade_form_index_hkx8shgham`}</span>
        <div className="flex mt-4 flex-wrap gap-2">
          {amountList?.map((item, index) => {
            return (
              <div
                className={classNames('mul-li h-6 bg-bg_sr_color text-text_color_01 rounded', {
                  'amount-select': selectList.indexOf(item) !== -1,
                })}
                onClick={() => {
                  const _selectList = JSON.parse(JSON.stringify(selectList))
                  if (_selectList.indexOf(item) !== -1) {
                    _selectList.splice(_selectList.indexOf(item), 1)
                  } else {
                    _selectList.push(item)
                  }
                  if (_selectList?.length > 4) {
                    Message.info(t`features_ternary_option_trade_form_index_csmj5iw0hv`)
                    return
                  }
                  _selectList.sort((a, b) => {
                    return a - b
                  })
                  setSelectList(_selectList)
                }}
                key={index}
              >
                {item}
              </div>
            )
          })}
        </div>
      </Modal>

      <Modal
        className={Styles['modal-option-guide']}
        visible={optionGuideVisible}
        closeIcon={null}
        title={t`features_ternary_option_trade_form_index_oea9x3gmfi`}
        footer={
          <div className="w-full">
            <Button
              className={'button'}
              onClick={() => {
                setOptionGuideVisible(false)
              }}
            >
              {t`features_trade_spot_index_2510`}
            </Button>
            <Button
              className={'button ml-4'}
              type="primary"
              onClick={() => {
                setOptionGuideVisible(false)
                setShowGuideType(OptionGuideType.binaryOption)
                setCacheAgentBindUser(OptionGuideCache.optionBinaryStep, true)
              }}
            >
              {t`hooks_features_trade_6iy79tvo64`}
            </Button>
          </div>
        }
        onCancel={() => {
          setOptionGuideVisible(false)
        }}
      >
        <span className="text-text_color_01 text-sm leading-[22px]">
          {t({
            id: `features_ternary_option_trade_form_index_k7jmgxlpcd`,
            values: { businessName: headerData?.businessName || '' },
          })}
          <span
            className="text-brand_color cursor-pointer"
            onClick={() => {
              window.open(videoUrl?.substring(1, videoUrl?.length))
            }}
          >{t`features_ternary_option_trade_form_index_lvisz3kl4k`}</span>
          {t`features_ternary_option_trade_form_index_1b121nmfnm`}
        </span>
      </Modal>
    </div>
  )
}

export default Header
