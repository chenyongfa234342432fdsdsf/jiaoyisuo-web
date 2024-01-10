import { useState, useEffect } from 'react'
import { useUpdateEffect, useMount } from 'ahooks'
import { t } from '@lingui/macro'
import { getCoinAssetDetail } from '@/apis/assets/main'
import { getRecordsList } from '@/apis/assets/financial-record'
import { CoinAssetsDetailResp, RecordsListResp } from '@/typings/api/assets/assets'
import { Spin, Message } from '@nbit/arco'
import { usePageContext } from '@/hooks/use-page-context'
import { RecordList } from '@/features/assets/financial-record/record-list'
import { useAssetsStore } from '@/store/assets'
import { FinancialRecordListFromPage } from '@/constants/assets'
import { TotalAssets } from './total-assets'
import { TradePair } from './trade-pair'
import styles from './index.module.css'

export function CoinAssetsDetail() {
  // 资产数据字典
  const { fetchAssetEnums } = useAssetsStore()
  useMount(fetchAssetEnums)

  const pageContext = usePageContext()
  const coinId = pageContext?.urlParsed?.search?.cid
  const totalDataDefault: CoinAssetsDetailResp = {
    coinName: '--',
    symbol: '',
    totalAmount: '0',
    availableAmount: '0',
    lockAmount: '0',
    positionAmount: '0',
    positionAmountData: {
      marginAssets: '0',
      financialAssets: '0',
      futuresAssets: '0',
    },
    lockAmountData: {
      spotLockAssets: '0',
      marginLockAssets: '0',
      swapLockAssets: '0',
      withdrawLockAssets: '0',
    },
  }
  const [totalData, setTotalData] = useState<CoinAssetsDetailResp>(totalDataDefault) // 总资产折合等数据
  const [loading, setLoading] = useState(false)
  const [recordTableData, setRecordTableData] = useState<RecordsListResp[]>([])
  const [totalCount, setTotalCount] = useState<number>(0) // 总条数
  const [page, setPage] = useState({
    pageNum: 1, // 当前页码
    pageSize: 20, // 每页展示条数
  })
  const assetsStore = useAssetsStore()
  const { financialRecordListLoading } = { ...assetsStore }
  /**
   * 获取币币资产详情
   * @returns
   */
  const getAssetsDetailData = async () => {
    try {
      setLoading(true)
      const params = { coinId: +coinId }
      const res = await getCoinAssetDetail(params)
      let results = res.data
      if (res.isOk && results) {
        // 计算货币金额
        setTotalData(results)
        assetsStore.updateAssetsDetailCoin(results)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  // 获取历史记录
  const getRecordListData = async () => {
    setLoading(true)
    try {
      const paramsObj = {
        /** 资产 */
        coinId,
        pageNum: page.pageNum,
        pageSize: page.pageSize,
      }
      const res = await getRecordsList(paramsObj)
      const { isOk, data: { list = [], total = 0 } = {} } = res || {}
      if (!isOk) {
        setLoading(false)
        return
      }

      setTotalCount(total)
      setRecordTableData(list)
      const { pageNum, pageSize } = paramsObj
      list.length > pageSize && setPage({ pageNum, pageSize })
    } catch (error) {
      Message.error(t`features_assets_main_assets_detail_trade_pair_index_2562`)
    } finally {
      setLoading(false)
    }
  }

  /** 翻页事件 */
  const setPageFn = async pageObj => {
    setPage(pageObj)
  }

  useEffect(() => {
    if (!coinId) return
    getAssetsDetailData()
    getRecordListData()
  }, [])

  useUpdateEffect(() => {
    getRecordListData()
  }, [page])

  return (
    <div className={styles.scoped}>
      <Spin loading={loading || financialRecordListLoading}>
        <TotalAssets assetsData={totalData} />
        {coinId && <TradePair coinId={coinId} />}
        <hr className="border-line_color_02"></hr>
        <div className="title">{t`assets.coin.trade-records.title`}</div>
        <RecordList
          totalCount={totalCount}
          tableData={recordTableData}
          page={page}
          setPage={setPageFn}
          columns={{ businessCoin: false }}
          loading={loading || financialRecordListLoading}
          fromPage={FinancialRecordListFromPage.other}
        />
      </Spin>
    </div>
  )
}
