/**
 * 合约交易页 - 账户列表视图
 */
import { useInterval, useMount, useUnmount, useUpdateEffect } from 'ahooks'
import classNames from 'classnames'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { onGetContractOverview } from '@/helper/assets/futures'
import { useEffect, useRef, useState } from 'react'
import { Spin } from '@nbit/arco'
import { useFuturesStore } from '@/store/futures'
import { useUserStore } from '@/store/user'
import { UserFuturesTradeStatus } from '@/constants/user'
import { FuturesAccountResp } from '@/typings/api/assets/futures'
import futuresAccountList from '@/helper/assets/json/futuresAccountList.json'
import { AssetWsSubscribePageEnum } from '@/constants/assets'
import styles from './index.module.css'
import { FuturesList } from '../index/futures-list'

export function FuturesAccountListView({ isActive = false }) {
  const userStore = useUserStore()
  const {
    isLogin,
    userInfo: { isOpenContractStatus },
  } = userStore
  const { futureEnabled } = useFuturesStore()

  /** 合约资产和持仓列表 */
  const assetsFuturesStore = useAssetsFuturesStore()
  const { futuresGroupList, fetchFuturesEnums, futureAccountListSearchForm, updateFuturesGroupList } = {
    ...assetsFuturesStore,
  }
  const { accountType } = { ...futureAccountListSearchForm }

  useMount(() => {
    if (!isLogin || !isOpenContractStatus) return
    fetchFuturesEnums()
  })
  const [loading, setLoading] = useState(!futureEnabled)

  /**
   * 过滤资产列表 - 列表搜索、隐藏零额等
   */
  const displayAssetsList =
    (futuresGroupList &&
      futuresGroupList.length > 0 &&
      futuresGroupList.filter((item: FuturesAccountResp) => {
        return !!(accountType ? item.accountType === accountType : item)
      })) ||
    []

  /** 查逐仓列表，计算合约资产 */
  const getFuturesListData = async () => {
    if (!isLogin || isOpenContractStatus === UserFuturesTradeStatus.close) {
      setLoading(false)
      return
    }

    await onGetContractOverview(true, false)
    setLoading(false)
  }

  /** 轮询逐仓列表接口 */
  useInterval(() => {
    isActive && getFuturesListData()
  }, 5000)

  useEffect(() => {
    getFuturesListData()
  }, [isLogin, isOpenContractStatus])

  useUnmount(() => {
    updateFuturesGroupList([])
  })

  const [maxHight, setMaxHight] = useState<number>()
  const rootRef = useRef<HTMLDivElement>(null)
  useUpdateEffect(() => {
    const handleResize = () => {
      setMaxHight(rootRef?.current?.offsetHeight)
    }

    const domHight = rootRef?.current?.offsetHeight
    domHight && setMaxHight(domHight - 62)

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [rootRef?.current?.offsetHeight])

  return (
    <div className={classNames(styles['assets-position-wrapper'], 'w-full h-full py-4')} ref={rootRef}>
      <Spin loading={loading}>
        <FuturesList
          assetsListData={futureEnabled ? futuresAccountList.data.list : displayAssetsList}
          height={maxHight}
          onSuccess={getFuturesListData}
          fromPage={AssetWsSubscribePageEnum.trade}
        />
      </Spin>
    </div>
  )
}
