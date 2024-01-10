import { WsBizEnum, WsTypesEnum } from '@/constants/ws'
import { IOptionCurrentPositionList } from '@/typings/api/ternary-option/position'
import { baseTernaryOptionStore } from '@/store/ternary-option'
import { getProductCurrencies } from '@/apis/ternary-option'
import { OptionSideIndCallEnum, OptionSideIndEnum } from '@/constants/ternary-option'
import { decimalUtils } from '@nbit/utils'
import { getOptionWsContractCode } from '../ws'

export const getOptionCurrencySetting = async () => {
  const optionPositionStore = baseTernaryOptionStore.getState()
  const { isOk, data } = await getProductCurrencies({})
  isOk && data && optionPositionStore.updateOptionCurrencySetting(data)
}

/**
 * 根据持仓列表过滤 symbol
 * @param positionList 当前持仓列表
 */
export const onFilterSymbol = (positionList: IOptionCurrentPositionList[]) => {
  const optionPositionStore = baseTernaryOptionStore.getState()
  let newList: string[] = []
  for (let i = 0; i < positionList.length; i += 1) {
    if (newList.indexOf(positionList[i].symbol) === -1) {
      newList.push(positionList[i].symbol)
    }
  }

  optionPositionStore.updatePositionSymbolList(newList)
}

/**
 * 根据 symbol 生成指数价格/标记价格推送 subs
 * @param type 订阅类型
 */
export const onGetMarkPriceSubs = () => {
  const { positionSymbolList = [] } = baseTernaryOptionStore.getState()

  if (positionSymbolList && positionSymbolList.length > 0) {
    const newList = positionSymbolList.map((contractCode: string) => {
      return {
        biz: WsBizEnum.option,
        type: WsTypesEnum.optionMarket,
        contractCode: getOptionWsContractCode(contractCode),
      }
    })

    return newList
  }
}

/**
 * 根据实时价格计算盈亏值
 */
export const onGetPositionProfit = (data: IOptionCurrentPositionList, currentPrice?: string) => {
  const { sideInd, targetPrice, realYield, amount } = data
  currentPrice = currentPrice || data?.currentPrice || '0'
  const isProfit = OptionSideIndCallEnum.includes(sideInd as OptionSideIndEnum)
    ? +currentPrice > +targetPrice
    : +currentPrice < +targetPrice
  const profitVal = isProfit ? `${decimalUtils.SafeCalcUtil.mul(realYield, amount)}` : `-${amount}`
  return profitVal
}
