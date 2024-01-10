import Tabs from '@/components/tabs'
import { useState } from 'react'
import Table from '@/components/table'
import MarketTradePairCommonTable from '@/features/market/market-list/common/market-trade-pair-common-table'
import { getHomeHotCurrencyTableColumns } from '@/features/market/market-list/common/market-list-trade-pair-table-schema'
import { useWsSpotMarketTradePairSlow } from '@/hooks/features/market/common/market-ws/use-ws-market-trade-pair'
import useApiAllCoinSymbolInfo from '@/hooks/features/market/common/use-api-all-coin-symbol-info'
import { HomeModuleTabsEnum, getHomeModuleTabApi } from '@/constants/market/market-list'
import { mergeTradePairWithSymbolInfo } from '@/helper/market/market-list'
import useReqeustMarketHelper from '@/hooks/features/market/common/use-request-market'
import RedirectButton from '@/components/redirect-button'
import Link from '@/components/link'
import { t } from '@lingui/macro'
import styles from './index.module.css'

const tabList = () => {
  return [
    { id: HomeModuleTabsEnum.hot, title: t`features_home_home_table_index_3cxdkaotjg` },
    { id: HomeModuleTabsEnum.topRising, title: t`features_home_home_table_index_sob6vmoltf` },
    { id: HomeModuleTabsEnum.topFalling, title: t`features_home_home_table_index_ututlhpr6s` },
    { id: HomeModuleTabsEnum.topVolume, title: t`features_order_book_common_table_header_index_7bx3s5i3n9` },
  ]
}

function HomeTable() {
  const [tab, settab] = useState(tabList()[0])

  return (
    <div className={styles.scoped}>
      <Tabs classNames="table-tab" mode="text" tabList={tabList()} onChange={settab} value={tab.id} />

      <FrontPagePopularCoin tab={tab.id} />

      <RedirectButton>
        <Link href={`/markets/spot`} className="opt-button-gray">
          {t`features/message-center/messages-3`}
        </Link>
      </RedirectButton>
    </div>
  )
}

function FrontPagePopularCoin({ tab }: { tab: HomeModuleTabsEnum }) {
  const columns = getHomeHotCurrencyTableColumns()

  const [tableData, settableData] = useState([])
  const resolvedData = useWsSpotMarketTradePairSlow({ apiData: tableData })
  const symbolInfo = useApiAllCoinSymbolInfo()
  const apiRequest = (resolve, reject) => {
    getHomeModuleTabApi(tab)({}).then(res => {
      if (res.isOk) {
        let data = res.data.list || []
        return resolve(mergeTradePairWithSymbolInfo(data, symbolInfo))
      }

      return reject()
    })
  }

  // add apiStatus to handle tab change
  const { apiStatus } = useReqeustMarketHelper({
    apiRequest,
    setApiData: settableData,
    deps: [symbolInfo.length, tab],
  })

  return <MarketTradePairCommonTable data={resolvedData.slice(0, 5)} columns={columns} apiStatus={apiStatus} />
}

export default HomeTable
