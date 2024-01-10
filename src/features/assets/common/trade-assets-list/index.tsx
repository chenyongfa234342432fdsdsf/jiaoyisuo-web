import { useState, useEffect } from 'react'
import { Popover, Checkbox, Tooltip, Spin } from '@nbit/arco'
import { t } from '@lingui/macro'
import { getIsLogin } from '@/helper/auth'
import { rateFilter, formatCoinAmount, sortCurrencyAssetsFn } from '@/helper/assets'
import { getCoinAssetData } from '@/apis/assets/main'
import LazyImage from '@/components/lazy-image'
import { AssetsListResp } from '@/typings/api/assets/assets'
import { useAssetsStore } from '@/store/assets'
import useApiAllMarketTradePair from '@/hooks/features/market/common/use-api-all-market-trade-pair'
import Icon from '@/components/icon'
import Link from '@/components/link'
import { useUpdateEffect } from 'ahooks'
import { SpotDepositeCell } from '@/features/orders/order-table-cell'
import { useMarketStore } from '@/store/market'
import { filter, find, map } from 'lodash'
import { NoDataElement } from '@/features/orders/order-table-layout'
import { getTradeRoutePath } from '@/helper/route/trade'
import styles from './index.module.css'

/** 现货交易 - 我的资产组件 */
export function TradeAssetsList() {
  const allTradePair = useApiAllMarketTradePair().data
  const assetsStore = useAssetsStore()
  const { currentCoin } = useMarketStore()
  /** 获取隐藏小额资产状态 */
  const { hideSmallAssets } = assetsStore
  const isLogin = getIsLogin()
  const [loading, setLoading] = useState(false)
  // 现货资产列表
  const [assetListData, setAssetListData] = useState<AssetsListResp[]>([])
  // 汇率接口
  const { fetchCoinRate } = useAssetsStore()
  // 标的币
  const sellCoin = find(assetListData, i => i.symbol === currentCoin?.sellSymbol)
  // 计价币
  const buyCoin = find(assetListData, i => i.symbol === currentCoin?.buySymbol)
  // 其他非 0 资产
  const otherAssetsList = filter(
    assetListData,
    i => i.symbol !== currentCoin?.sellSymbol && i.symbol !== currentCoin?.buySymbol && Number(i.totalAmount) > 0
  ).sort(sortCurrencyAssetsFn)
  // 获取币对信息
  const pushTradePairData = assetsList => {
    assetsList.forEach(async (item, index) => {
      try {
        const coinTradePair = allTradePair.filter(data => `${data.sellCoinId}` === `${item.coinId}`)
        if (coinTradePair) {
          item.tradeList = coinTradePair
        } else {
          item.tradeList = null
        }
      } catch (error) {
        item.tradeList = null
      }

      // 更新资产持仓
      if (index === assetsList.length - 1) {
        setAssetListData(assetsList)
      }
    })
  }

  /**
   * 获取现货资产总资产等
   * @returns
   */
  const getCoinAssetsListData = async () => {
    // pageSize 为 0 时返回全部
    const params = { isGt: false, pageNum: 1, pageSize: 0 }
    const res = await getCoinAssetData(params)
    const assetsList: any = res.data?.list
    if (res.isOk && assetsList) {
      try {
        pushTradePairData(assetsList)
      } catch (error) {
        // 交易币对接口异常时，不阻塞资产展示
        setAssetListData(assetsList)
      }
    }
  }

  /** 资产折合和资产列表依赖汇率接口 */
  const initData = async () => {
    if (!isLogin) {
      setAssetListData([])
      return
    }
    setLoading(true)
    try {
      fetchCoinRate()
      await getCoinAssetsListData()
    } catch (error) {
      setLoading(false)
    }
    setLoading(false)
  }

  useEffect(() => {
    initData()
  }, [])

  // 监听可用资产的 store，更新时更新持仓资产列表
  useUpdateEffect(() => {
    if (!assetsStore.userAssetsSpot.buyCoin.symbol) return
    if (assetsStore.isHasAssetsWSInfo) {
      initData()
      assetsStore.updateIsHasAssetsWSInfo(false)
    }
  }, [assetsStore.isHasAssetsWSInfo])

  // 币对或资产列表变化时，更新持仓列表数据
  useEffect(() => {
    pushTradePairData(assetListData)
  }, [allTradePair, assetListData])

  /**
   * 币种信息 item
   */
  const onLoadCoinItem = (coin: AssetsListResp) => {
    const {
      coinId,
      webLogo,
      tradeList = '',
      coinName = '--',
      lockAmount,
      availableAmount,
      totalAmount = '',
      symbol = '',
      usdBalance,
    } = coin

    // 是否要隐藏小额资产 (隐藏 1USD 以下的资产)
    if (hideSmallAssets && +usdBalance < 1) return null

    return (
      <div className="current-row">
        <div>
          {tradeList && tradeList.length > 0 ? (
            <Popover
              key={coinId}
              className="flex"
              position="bottom"
              trigger="hover"
              triggerProps={{
                className: styles['coin-popup-wrapper'],
              }}
              content={
                <div className="flex-1 text-xs">
                  {tradeList.map(item => {
                    return (
                      <Link href={getTradeRoutePath(item.symbolName!)} key={item.sellCoinId} className="coin-item">
                        {`${item.baseSymbolName || '--'}/${item.quoteSymbolName || '--'}`}
                      </Link>
                    )
                  })}
                </div>
              }
            >
              <div className="coin-wrap">
                <LazyImage className="icon" src={webLogo} alt={coinName} />
                <span className="ml-2 text-xs">{coinName}</span>
                <Icon hasTheme name="next_arrow" fontSize={8} className="ml-1 translate-y-px" />
              </div>
            </Popover>
          ) : (
            <div className="coin-wrap">
              <LazyImage className="icon" src={webLogo} alt={coinName} />
              <span className="ml-2">{coinName}</span>
            </div>
          )}
        </div>
        <div className="current-col">
          <div>{formatCoinAmount(symbol, totalAmount)}</div>
          {Number(totalAmount) > 0 && (
            <div className="text-text_color_02">{rateFilter({ symbol, amount: totalAmount })}</div>
          )}
        </div>
        <div className="current-col">
          <div>{formatCoinAmount(symbol, lockAmount)}</div>
          {Number(totalAmount) > 0 && (
            <div className="text-text_color_02">{rateFilter({ symbol, amount: lockAmount })}</div>
          )}
        </div>
        <div className="current-col">
          <div>{formatCoinAmount(symbol, availableAmount)}</div>
          {Number(totalAmount) > 0 && (
            <div className="text-text_color_02">{rateFilter({ symbol, amount: availableAmount })}</div>
          )}
        </div>
        <div className="current-col">
          <SpotDepositeCell coinId={coinId} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.scoped}>
      <Spin loading={loading}>
        {!assetListData.length && !loading ? (
          <div className="p-9">
            <NoDataElement />
          </div>
        ) : (
          <>
            <div className="current-header">
              <div>{t`assets.index.overview.menuName`}</div>
              <div className="justify-self-end">{t`features/assets/main/index-11`}</div>
              <div className="justify-self-end">{t`features/assets/main/my-assets/index-2`}</div>
              <div className="justify-self-end">{t`features_ternary_option_trade_form_index_zytmnxmige`}</div>
              <div className="justify-self-end">{t`order.columns.action`}</div>
            </div>
            <div className="current-content-wrapper">
              <div className="current-content">
                <span className="current-title">{t`features_assets_common_trade_assets_list_index_dxopk7677h`}</span>
                {sellCoin?.coinId && onLoadCoinItem(sellCoin)}
                {buyCoin?.coinId && onLoadCoinItem(buyCoin)}
              </div>
              <div className="current-content">
                <span className="current-title">{t`features_assets_common_trade_assets_list_index_lxvwkukxik`}</span>
                {map(otherAssetsList, i => onLoadCoinItem(i))}
              </div>
            </div>
          </>
        )}
      </Spin>
    </div>
  )
}

/** 隐藏小额资产 */
export function HideSmallAssetsNode() {
  const assetsStore = useAssetsStore()
  const { hideSmallAssets, updateHideSmallAssets } = { ...assetsStore } // 获取资产加密状态
  const changeHideSmallAssets = val => {
    updateHideSmallAssets(val)
  }

  return (
    <div className="flex items-center ml-14">
      <Tooltip content={<span className="text-xs">{t`features_assets_common_search_form_hide_less_index_2555`}</span>}>
        <Checkbox checked={hideSmallAssets} onChange={changeHideSmallAssets}>
          {({ checked }) => {
            return checked ? <Icon name="login_verify_selected" /> : <Icon name="icon_spot_unselected" hasTheme />
          }}
        </Checkbox>
        <span className="ml-2 text-text_color_02 text-xs">{t`features/assets/main/index-5`}</span>
      </Tooltip>
    </div>
  )
}
