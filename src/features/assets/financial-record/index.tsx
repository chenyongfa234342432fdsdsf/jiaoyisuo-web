import {
  FinancialRecordLogTypeEnum,
  getFinancialRecordLogTypeEnumName,
  FinancialRecordLogTypeEnumMap,
} from '@/constants/assets'
import { Message, Spin } from '@nbit/arco'
import AssetsTabs from '@/features/assets/common/assets-tabs'
import dayjs from 'dayjs'
import { t } from '@lingui/macro'
import { useState, useEffect } from 'react'
import { usePageContext } from '@/hooks/use-page-context'
import { RecordsListResp, AssetsRecordsListReq, RecordsCoinListResp } from '@/typings/api/assets/assets'
import { getRecordsList, getRecordsCoinList } from '@/apis/assets/financial-record'
import { link } from '@/helper/link'
import { formatDate } from '@/helper/date'
import { useAssetsStore } from '@/store/assets'
import { useMount } from 'ahooks'
import { getFuturesCurrencySettings } from '@/helper/assets/futures'
import { ISearchParamsProps } from '@/typings/assets'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { getAssetsHistoryPageRoutePath } from '@/helper/route/assets'
import { getAuthModuleRoutes, getDerivativeModuleStatus } from '@/helper/module-config'
import { SearchItem, updateActiveSearchParams } from './search-form'
import { RecordList } from './record-list'

export function FinancialRecord() {
  const pageContext = usePageContext()
  const { coinId, coinName } = pageContext?.urlParsed?.search || {}
  const logTypeId = Number(pageContext?.urlParsed?.search?.type)
  const type = Number(pageContext?.urlParsed?.search?.subtype)

  // 资产数据字典
  const assetsStore = useAssetsStore()
  const { fetchAssetEnums, financialRecordListLoading, updateFinancialRecordListLoading } = { ...assetsStore }
  useMount(fetchAssetEnums)

  const isMergeMode = getMergeModeStatus()

  // 没传 type 时，默认充提类型
  let defaultLogType = FinancialRecordLogTypeEnum.main
  if (Number(logTypeId) > 0) {
    defaultLogType = logTypeId
  }
  const [logType, setLogType] = useState(defaultLogType)
  const [coinList, setCoinList] = useState<RecordsCoinListResp[]>([])

  // 默认查最近一周数据
  const defaultDate = [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
  const [dateTimeArr, setDateTimeArr] = useState<any>([dayjs(defaultDate[0]), dayjs(defaultDate[1])])

  const [page, setPage] = useState({
    pageNum: 1,
    pageSize: 20,
  })

  /** 默认搜索条件 */
  const defaultData: AssetsRecordsListReq = {
    /** 资产 */
    coinId,
    /** 充提类型，1. 充币，2. 提币 ,3 pay , 4. 冲正 */
    type: type ? ([type] as number[]) : undefined,
    /** 开始时间 */
    startDate: new Date(dateTimeArr[0]).getTime(),
    /** 结束时间 */
    endDate: new Date(dateTimeArr[1]).getTime(),
    /** 状态 */
    status: undefined,
    /** 代理商返佣类型 */
    rebateType: undefined,
    /** 财务类型：总览时不传，1，现货，2、充提、3、借还款、4、合约、5、手续费、6、衍生品、7、其他 */
    logType: logTypeId,
    pageNum: page.pageNum,
    pageSize: page.pageSize,
  }

  /** 资产财务记录 */
  const assetsRecord = {
    /** 总览 */
    // overview: { ...defaultData },
    /** 充提 */
    main: { ...defaultData },
    /** 合约 */
    futures: { ...defaultData },
    /** 衍生品 */
    derivative: { ...defaultData },
    /** 其他 */
    other: { ...defaultData },
    /** 手续费 */
    commission: { ...defaultData },
    /** 代理商 - 返佣 */
    rebate: { ...defaultData },
    /** c2c */
    c2c: { ...defaultData },
  }
  const [searchParams, setSearchParams] = useState<ISearchParamsProps>(assetsRecord)
  const [tableData, setTableData] = useState<RecordsListResp[]>([])
  const [totalCount, setTotalCount] = useState<number>(0) // 总条数

  const getPageNumAndSize = data => {
    const { pageNum, pageSize } = data
    return { pageNum, pageSize }
  }

  const getActiveParamsObj = (data, isPageObj = false) => {
    if (isPageObj) return getPageNumAndSize(data)
    return data
  }

  // 得到当前选中的接口入参
  const getActiveParams = (val, isPageObj = false) => {
    const logTypeEnums = FinancialRecordLogTypeEnumMap()
    const logTypeKey = Object.keys(logTypeEnums).find(key => logTypeEnums[key] === val)
    return getActiveParamsObj(searchParams[logTypeKey || 'main'], isPageObj)
  }

  const getTimeParams = type => {
    const params = getActiveParams(type, false)
    return `${formatDate(
      params?.startDate,
      'YYYY-MM-DD'
    )} ${t`features/assets/saving/history-list/index-0`} ${formatDate(params?.endDate, 'YYYY-MM-DD')}`
  }

  let paramsActiveObj
  // 获取列表信息
  const getRecordListData = async (val?: number) => {
    updateFinancialRecordListLoading(true)
    try {
      paramsActiveObj = getActiveParams(val)
      const { pageNum, pageSize } = paramsActiveObj
      paramsActiveObj.pageNum = pageNum
      paramsActiveObj.pageSize = pageSize
      if (Number(val) === 0) {
        delete paramsActiveObj.logType
      } else {
        paramsActiveObj.logType = val || logType
      }

      paramsActiveObj.startDate = new Date(`${formatDate(paramsActiveObj.startDate, 'YYYY-MM-DD')} 00:00:00`).getTime()
      paramsActiveObj.endDate = new Date(`${formatDate(paramsActiveObj.endDate, 'YYYY-MM-DD')} 23:59:59`).getTime()
      const res = await getRecordsList(paramsActiveObj)
      const { isOk, data: { list = [], total = 0 } = {} } = res || {}
      if (!isOk) {
        updateFinancialRecordListLoading(false)
        return
      }

      setTotalCount(total)
      setTableData(list)
      total > pageSize && setPage({ pageNum, pageSize })
    } catch (error) {
      Message.error(t`features_assets_main_assets_detail_trade_pair_index_2562`)
    } finally {
      updateFinancialRecordListLoading(false)
    }
  }

  /** 获取所有币币交易对 */
  const getFinanceCoinTypeListRequest = async (val?: number) => {
    let params = {} // , type: [401, 402].toString()
    if (Number(val) > 0) params = { logType: val || logType }
    const res = await getRecordsCoinList(params)
    let results = res.data?.coinList
    if (res.isOk && results) {
      setCoinList(results)
    } else {
      setCoinList([])
    }
  }

  const loadRecordListAndCoinList = async (val?: number) => {
    getRecordListData(val)
    getFinanceCoinTypeListRequest(val)
  }

  /** 搜索按钮事件 */
  const setRecordData = async data => {
    setSearchParams(data)
    loadRecordListAndCoinList(logType)
  }

  /** tab 切换事件 */
  const onChangeLogsType = async val => {
    setLogType(val)
    // 切换 tab 更新时间默认值
    setDateTimeArr(defaultDate)
    loadRecordListAndCoinList(val)
    // 有 type 参数时，点击切换 tab 时修改 url 的 type 参数
    // if (!logTypeId) return
    link(getAssetsHistoryPageRoutePath(val, undefined, undefined, coinId, coinName), {
      overwriteLastHistoryEntry: true,
    })
  }

  /** 翻页事件 */
  const setPageFn = async pageObj => {
    setPage(pageObj)
    let paramsObj = getActiveParams(logType)
    if (paramsObj) {
      paramsObj.pageNum = pageObj.pageNum
      paramsObj.pageSize = pageObj.pageSize
    }

    setSearchParams(updateActiveSearchParams(logType, paramsObj, searchParams))
    loadRecordListAndCoinList(logType)
  }

  useEffect(() => {
    loadRecordListAndCoinList(logTypeId)
  }, [logTypeId])

  useEffect(() => {
    getFuturesCurrencySettings()
  }, [])

  // const overview = {
  //   title: t`assets.financial-record.tabs.overview`,
  //   id: FinancialRecordLogTypeEnum.overview,
  // }

  const main = {
    title: getFinancialRecordLogTypeEnumName(FinancialRecordLogTypeEnum.main),
    id: FinancialRecordLogTypeEnum.main,
  }

  const futures = {
    title: getFinancialRecordLogTypeEnumName(FinancialRecordLogTypeEnum.futures),
    id: FinancialRecordLogTypeEnum.futures,
  }

  const c2cTab = {
    title: getFinancialRecordLogTypeEnumName(FinancialRecordLogTypeEnum.c2c),
    id: FinancialRecordLogTypeEnum.c2c,
  }

  const derivative = {
    title: getFinancialRecordLogTypeEnumName(FinancialRecordLogTypeEnum.derivative),
    id: FinancialRecordLogTypeEnum.derivative,
  }

  const commission = {
    title: getFinancialRecordLogTypeEnumName(FinancialRecordLogTypeEnum.commission),
    id: FinancialRecordLogTypeEnum.commission,
  }

  const rebate = {
    title: getFinancialRecordLogTypeEnumName(FinancialRecordLogTypeEnum.rebate),
    id: FinancialRecordLogTypeEnum.rebate,
  }

  const other = {
    title: getFinancialRecordLogTypeEnumName(FinancialRecordLogTypeEnum.other),
    id: FinancialRecordLogTypeEnum.other,
  }

  interface IRoutesProps {
    main?: any
    contract?: any
    derivative?: any
    c2c?: any
  }
  const menuData: IRoutesProps = { main, contract: futures, derivative, c2c: c2cTab }
  if (!getDerivativeModuleStatus()) {
    delete menuData.derivative
  }

  const defaultTabList = getAuthModuleRoutes(menuData) || []
  const tabList = !isMergeMode ? [...defaultTabList, commission, rebate, other] : [main, futures, commission, other]

  return (
    <>
      <AssetsTabs tabList={tabList} value={logType} onChange={onChangeLogsType} />
      <Spin loading={financialRecordListLoading}>
        {tabList &&
          tabList.map(item => (
            <div key={`content_${item.id}`} className={+logType === +item.id ? 'block' : 'hidden'}>
              <SearchItem
                key={`search_${item.id}`}
                onSearchFn={setRecordData}
                logType={item.id}
                searchParams={searchParams}
                coinList={coinList}
              />
              <RecordList
                key={`recordlist_${item.id}`}
                tabType={item.id}
                totalCount={totalCount}
                tableData={tableData}
                page={getActiveParams(item.id, true)}
                setPage={setPageFn}
                isInitDetail
                timeParams={getTimeParams(item.id)}
              />
            </div>
          ))}
      </Spin>
    </>
  )
}
