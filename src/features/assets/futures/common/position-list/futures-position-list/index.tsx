/**
 * 合约交易页 - 持仓组件
 */
import { t } from '@lingui/macro'
import { useMemoizedFn, useUnmount, useUpdateEffect, useMount } from 'ahooks'
import classNames from 'classnames'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import {
  getFuturesPositionList,
  onChangePositionData,
  onGetMarkPriceSubs,
  onFilterSymbolWassName,
  onChangePositionSize,
} from '@/helper/assets/futures'
import { useEffect, useState } from 'react'
import { Message, Spin } from '@nbit/arco'
import { PerpetualGroupDetail } from '@/plugins/ws/protobuf/ts/proto/PerpetualGroupDetails'
import { PerpetualIndexPrice } from '@/plugins/ws/protobuf/ts/proto/PerpetualIndexPrice'
import { useUserStore } from '@/store/user'
import { UserFuturesTradeStatus } from '@/constants/user'
import { TriggerPriceTypeEnum } from '@/constants/assets/futures'
import { FuturesGuideIdEnum } from '@/constants/future/trade'
import { useFuturesStore } from '@/store/futures'
import { useGetPositionListFutures } from '@/hooks/features/assets/futures'
import styles from './index.module.css'
import { FuturesPositionListView } from '../position-list-view'

export function FuturesPositionList({ isShow = true }: { isShow?: boolean }) {
  const userStore = useUserStore()
  const { futureEnabled } = useFuturesStore()
  const {
    isLogin,
    userInfo: { isOpenContractStatus },
  } = userStore

  /** 合约资产和持仓列表 */
  const assetsFuturesStore = useAssetsFuturesStore()
  const {
    updatePositionListFutures,
    positionSymbolWassNameList,
    wsPerpetualGroupDetailSubscribe,
    wsPerpetualGroupDetailUnSubscribe,
    wsMarkPriceSubscribe,
    wsMarkPriceUnSubscribe,
    wsDealSubscribe,
    wsDealUnSubscribe,
    positionListLoading,
    updatePositionListLoading,
  } = { ...assetsFuturesStore }

  const [isFirst, setIsFirst] = useState<boolean>(true)

  const onLoadPositionList = async () => {
    isFirst && updatePositionListLoading(true)
    try {
      const data = await getFuturesPositionList()
      if (data) {
        updatePositionListFutures(data)
        onFilterSymbolWassName(data)
      }
    } catch (error) {
      Message.error(t`features_assets_main_assets_detail_trade_pair_index_2562`)
    } finally {
      isFirst && updatePositionListLoading(false)
      setIsFirst(false)
    }
  }

  /**
   * 合约组详情推送回调
   */
  const onWsCallBack = useMemoizedFn(async (data: PerpetualGroupDetail[]) => {
    if (data && data.length > 0) {
      onLoadPositionList()
    }
  })

  /**
   * 标记价格推送回调
   */
  const onMarkPriceWsCallBack = useMemoizedFn((data: PerpetualIndexPrice[]) => {
    onChangePositionData(data)
  })

  /**
   * 最新价格推送回调
   */
  const onDealPriceWsCallBack = useMemoizedFn((data: any[]) => {
    onChangePositionSize(data)
  })

  const positionListFutures = useGetPositionListFutures()

  useEffect(() => {
    if (!isLogin || isOpenContractStatus === UserFuturesTradeStatus.close) {
      updatePositionListFutures([])
      return
    }
    onLoadPositionList()
    // 订阅合约组详情和仓位
    wsPerpetualGroupDetailSubscribe(onWsCallBack)

    return () => {
      updatePositionListFutures([])
    }
  }, [isLogin, isOpenContractStatus, futureEnabled])

  useUpdateEffect(() => {
    if (!isLogin || isOpenContractStatus === UserFuturesTradeStatus.close) return
    if (futureEnabled || !isShow) {
      wsMarkPriceUnSubscribe(onGetMarkPriceSubs(), onMarkPriceWsCallBack)
      wsDealUnSubscribe(onGetMarkPriceSubs(TriggerPriceTypeEnum.new), onDealPriceWsCallBack)
      return
    }

    wsMarkPriceSubscribe(onGetMarkPriceSubs(), onMarkPriceWsCallBack)

    // 最新价订阅
    wsDealSubscribe(onGetMarkPriceSubs(TriggerPriceTypeEnum.new), onDealPriceWsCallBack)
  }, [positionSymbolWassNameList, isLogin, isOpenContractStatus, futureEnabled, isShow])

  useUnmount(() => {
    wsPerpetualGroupDetailUnSubscribe(onWsCallBack)
    wsMarkPriceUnSubscribe(onGetMarkPriceSubs(), onMarkPriceWsCallBack)
    wsDealUnSubscribe(onGetMarkPriceSubs(TriggerPriceTypeEnum.new), onDealPriceWsCallBack)
    updatePositionListFutures([])
  })

  if (!isShow) return null

  return (
    <div
      className={classNames(styles['assets-position-wrapper'], 'w-full h-full')}
      id={FuturesGuideIdEnum.currentPosition}
    >
      <Spin loading={positionListLoading}>
        <FuturesPositionListView assetsListData={positionListFutures} onSuccess={onLoadPositionList} />
      </Spin>
    </div>
  )
}
