/**
 * 持仓列表 - 三元期权
 */
import { t } from '@lingui/macro'
import { useEffect, useState } from 'react'
import { useMemoizedFn, useMount, useRequest, useUnmount, useUpdateEffect } from 'ahooks'
import { useUserStore } from '@/store/user'
import { Message } from '@nbit/arco'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { getOptionCurrentPositionApi } from '@/apis/ternary-option/position'
import { OptionOrder } from '@/plugins/ws/protobuf/ts/proto/OptionOrder'
import { getOptionCurrencySetting, onFilterSymbol, onGetMarkPriceSubs } from '@/helper/ternary-option/position'
import { OptionsOrderProfitTypeEnum } from '@/constants/ternary-option'
import { OptionPositionListView } from './position-list-view'

interface ITernaryOptionPositionProps {
  isShow?: boolean
}
export function TernaryOptionPosition(props: ITernaryOptionPositionProps) {
  const { isShow = true } = props
  const userStore = useUserStore()
  const { isLogin } = userStore
  /** 是否首次加载，首次调接口 loading 效果 */
  const [isFirst, setIsFirst] = useState<boolean>(true)
  const {
    updatePositionListOption,
    fetchOptionDictionaryEnums,
    positionSymbolList,
    wsOptionOrderSubscribe,
    wsOptionOrderUnSubscribe,
    wsMarkPriceSubscribe,
    wsMarkPriceUnSubscribe,
  } = useTernaryOptionStore() || {}
  useMount(() => {
    fetchOptionDictionaryEnums()
    getOptionCurrencySetting()
  })
  const [resultData, setResultData] = useState<any>({})

  /** 查询当前持仓列表 */
  const { run: getPositionList, loading } = useRequest(
    async () => {
      try {
        const params = { pageNum: 1, pageSize: 500 }
        const res = await getOptionCurrentPositionApi(params)
        isFirst && setIsFirst(false)

        const { isOk, data } = res || {}
        if (!isOk || !data) {
          updatePositionListOption([])
          onFilterSymbol([])
          return
        }

        const { list } = data || {}
        if (list) {
          updatePositionListOption(list)
          onFilterSymbol(list)
          return
        }
      } catch (error) {
        Message.error(t`features_assets_main_assets_detail_trade_pair_index_2562`)
      }
    },
    { debounceWait: 300, manual: true, debounceLeading: true }
  )

  const onOrderWsCallBack = useMemoizedFn((data: OptionOrder[]) => {
    if (data?.length === 0) return
    const optionOrder = data[0]?.optionOrder

    if (optionOrder?.length === 0) return

    if (data?.length === 0 || optionOrder?.length === 0) return
    const newResultData = optionOrder[0]
    let timer: null | NodeJS.Timeout
    if (newResultData?.profitable !== OptionsOrderProfitTypeEnum.notProfit) {
      setResultData(newResultData)
      timer = setTimeout(() => {
        getPositionList()
        timer && clearTimeout(timer)
      }, 1600)

      return
    }

    getPositionList()
  })

  useEffect(() => {
    if (!isLogin) return

    getPositionList()
    wsOptionOrderSubscribe(onOrderWsCallBack)
  }, [isLogin])

  // 订阅订单变动、指数价和标记价
  useUpdateEffect(() => {
    if (!isLogin || !isShow || positionSymbolList.length === 0) return

    wsMarkPriceUnSubscribe(onGetMarkPriceSubs())
    wsMarkPriceSubscribe(onGetMarkPriceSubs())
  }, [positionSymbolList, isLogin, isShow])

  useUnmount(() => {
    wsOptionOrderUnSubscribe(onOrderWsCallBack)
    wsMarkPriceUnSubscribe(onGetMarkPriceSubs())
  })

  if (!isShow) return null

  return <OptionPositionListView loading={isFirst ? loading : false} result={resultData} />
}
