import { divide } from 'lodash'
import { t } from '@lingui/macro'
import { decimalUtils } from '@nbit/utils'
import { baseUserStore } from '@/store/user'
import { PickRequired } from '@/typings/common'
import { getBusinessName } from '@/helper/common'
import { WsBizEnum, WsTypesEnum } from '@/constants/ws'
import { UserUpsAndDownsColorEnum } from '@/constants/user'
import { YapiGetV1CommonBusinessIdData } from '@/typings/yapi/CommonBusinessIdV1GetApi'
import { MarketSectorType } from '@/typings/api/market/market-sector'
import { getAuthModuleRoutes } from '@/helper/module-config'

const { colors } = baseUserStore.getState().personalCenterSettings
const SafeCalcUtil = decimalUtils.SafeCalcUtil

enum sectorMarketEnum {
  none,
  two = 2,
  three = 3,
  lastThree = -3,
  four = 4,
  five = 5,
  eight = 8,
  ten = 10,
  fifteen = 15,
}
/** 领涨跌颜色* */
const onChangeButtonColor = value => {
  const isUpAndDown = colors === UserUpsAndDownsColorEnum.greenUpRedDown
  if (value > 0) {
    return isUpAndDown ? 'bg-buy_up_color' : 'bg-sell_down_color'
  } else if (value < 0) {
    return isUpAndDown ? 'bg-sell_down_color' : 'bg-buy_up_color'
  } else {
    return 'bg-bg_button_disabled'
  }
}

export const marketSectorHandleSortData = data => {
  const getColorClass = chg => {
    let color = 'sector-grey'
    if (chg > 0) {
      color = 'sector-buy'
    } else if (chg < 0) {
      color = 'sector-danger'
    }
    return color
  }

  return data.map(v => ({
    ...v,
    chg: Number(v.chg),
    color: getColorClass(v.chg),
  }))
}

/** 处理股票热力图数据* */
export const marketSectorHandleHotData = data => {
  return data.map(v => ({
    ...v,
    chg: Number(v.chg),
    chgValue: `${v.chg > 0 ? `+${v.chg}` : v.chg}%`,
    color: onChangeButtonColor(v.chg),
  }))
}
/**
 * Sector price index
 * @param item
 * @returns ws config
 */
export function wsSectorIndexSub(bizId: PickRequired<YapiGetV1CommonBusinessIdData, 'businessId'>['businessId']) {
  return {
    biz: WsBizEnum.spot,
    type: WsTypesEnum.concept,
    contractCode: bizId.toString(),
  }
}

export enum SectorCategoryEnum {
  spot = 'spot',
  futures = 'futures',
}

export function getSectorCategoriesTabs() {
  const spot = { title: t`order.constants.marginMode.spot`, id: SectorCategoryEnum.spot }
  const contract = { title: t`future.funding-history.future-select.future`, id: SectorCategoryEnum.futures }
  const tabList = getAuthModuleRoutes({ spot, contract })

  return tabList
}

class MarketSectorData {
  /** 新处理的板块* */
  public hotData: MarketSectorType

  public newProportionHot: MarketSectorType[]

  /** 最后三个板块 */
  public proportionHot: MarketSectorType[]

  /** 最后三个板块占比 */
  public maxValueArray: number[]

  /** 最大的占比 */
  public maxValue: number

  /** 相差多少倍 */
  public diff: number

  /** 多用占比* */
  public multiUseProportion: number

  /** 多用占比进行平均* */
  public proportionAverage: number

  constructor() {
    this.maxValueArray = []
    this.proportionHot = []
    this.newProportionHot = []
    this.hotData = {} as MarketSectorType
    this.diff = sectorMarketEnum.none
    this.maxValue = sectorMarketEnum.none
    this.proportionAverage = sectorMarketEnum.none
    this.multiUseProportion = sectorMarketEnum.none
  }
}

/** 单列模式* */
export const DepthDataObject = (() => {
  let instance: MarketSectorData | null = null
  const createInstance = () => {
    return new MarketSectorData()
  }
  return {
    getInstance: () => {
      if (!instance) {
        instance = createInstance()
      }
      return instance
    },
  }
})()
const DepthData = DepthDataObject.getInstance()

/** 处理板块中其它占比问题* */
export const marketSectorHandleOtherData = (data, otherData: MarketSectorType) => {
  let {
    diff,
    hotData,
    maxValue,
    proportionHot,
    maxValueArray,
    newProportionHot,
    proportionAverage,
    multiUseProportion,
  } = DepthData
  // 获取最后三个
  if (data?.length > sectorMarketEnum.three) {
    proportionHot = data?.slice(sectorMarketEnum.lastThree)
  } else {
    proportionHot = data || []
  }
  // 如果没有数据，直接返回空数组
  if (!data?.length) {
    return data || []
  }
  maxValueArray = proportionHot?.map(item => item?.value || sectorMarketEnum.none) || []
  maxValue = Math.max(...maxValueArray)
  hotData = (otherData || {}) as MarketSectorType
  diff = divide(maxValue || sectorMarketEnum.none, hotData?.value || sectorMarketEnum.none)
  // “其他”项的占比小于最小显示占比 r，则将“其他”项的占比设置为 r
  if (diff > sectorMarketEnum.fifteen) {
    const ten = sectorMarketEnum.ten
    if (hotData?.value && hotData?.value < ten) {
      multiUseProportion = Number(`${SafeCalcUtil.sub(ten, hotData.value)}`)
      hotData.value = ten
    }
  } else if (diff > sectorMarketEnum.eight) {
    const five = sectorMarketEnum.five
    if (hotData?.value && hotData?.value < five) {
      multiUseProportion = Number(`${SafeCalcUtil.sub(five, hotData.value)}`)
      hotData.value = five
    }
  } else if (diff > sectorMarketEnum.four) {
    const three = sectorMarketEnum.three
    if (hotData?.value && hotData?.value < three) {
      multiUseProportion = Number(`${SafeCalcUtil.sub(three, hotData.value)}`)
      hotData.value = three
    }
  } else {
    multiUseProportion = sectorMarketEnum.none
    hotData.value = sectorMarketEnum.two
  }
  if (multiUseProportion) {
    proportionAverage = Number(`${SafeCalcUtil.div(multiUseProportion, data?.length || sectorMarketEnum.none)}`)
    data.forEach(v => {
      v.value = Number(`${SafeCalcUtil.add(v.value, proportionAverage)}`)
    })
  }
  newProportionHot = [...data, hotData]
  return newProportionHot
}

export function getMarketDefaultSeoMeta(pageTitle?: string) {
  const values = {
    businessName: getBusinessName(),
  }

  return {
    title: pageTitle,
    description: t({
      id: `helper_market_sector_index_2fx_qgeqgg`,
      values,
    }),
  }
}
