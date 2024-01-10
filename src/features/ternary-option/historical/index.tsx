import {
  HistoricalTypeEnum,
  HistoricalPageinationType,
  timeFilteringType,
  TimeFilteringListEnum,
} from '@/constants/ternary-option'
import classNames from 'classnames'
import { getIsLogin } from '@/helper/auth'
import { useEffect, useState, useRef } from 'react'
import { useSize, useMount, useUnmount, useCreation, useUpdateEffect, useRequest } from 'ahooks'
import { IQueryFutureOrderListReq } from '@/typings/api/order'
import { useTernaryOptionStore } from '@/store/ternary-option'
import HistoricalTable from '@/features/ternary-option/historical/component/historical-table'
import { YapiGetV1OptionOrdersHistoryListData } from '@/typings/yapi/OptionOrdersHistoryV1GetApi.d'
import { getOrdersHistory } from '@/apis/ternary-option'
import styleAsstes from '@/features/ternary-option/position/index.module.css'

type HistoricalOptionTableProps = {
  customizeTime: IQueryFutureOrderListReq
  historicalList: HistoricalTypeEnum
}

type HistoricalParamsype = {
  pageNum: number
  pageSize: number
  sideInd?: string
  period?: number
  timeRange?: string
  startTime?: number
  endTime?: number
  optionId?: string
}

enum PlanDirectionType {
  total,
  current,
  size = 20,
}

export default function HistoricalOptionTable(props: HistoricalOptionTableProps) {
  const { historicalList, customizeTime } = props
  const [loading, setLoading] = useState<boolean>(false)
  const [tableHight, setTableHight] = useState<number>(PlanDirectionType.total)
  const [tableData, setTableData] = useState<YapiGetV1OptionOrdersHistoryListData[]>([])
  const [pagination, setPagination] = useState<HistoricalPageinationType>({
    total: PlanDirectionType.total,
    pageSize: PlanDirectionType.size,
    current: PlanDirectionType.current,
  })
  const isLogn = getIsLogin()

  const tableRef = useRef<HTMLDivElement>(null)
  const tableSize = useSize(tableRef)

  const { orderWsNum, wsOptionOrderSubscribe, wsOptionOrderUnSubscribe } = useTernaryOptionStore()

  const getHistoricalOptionList = async (flag?: boolean) => {
    if (!isLogn) return
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      optionId: historicalList?.name || '',
      sideInd: historicalList?.direction || '',
      period: Number(historicalList?.cycle) || '',
      timeRange: timeFilteringType(historicalList?.time as TimeFilteringListEnum) || '',
    } as HistoricalParamsype
    if (historicalList?.time === PlanDirectionType.current) {
      params.endTime = customizeTime.endDateNumber
      params.startTime = customizeTime.beginDateNumber
    }
    setLoading(!flag)
    const { isOk, data } = await getOrdersHistory(params)
    if (isOk && data) {
      setTableData(data?.list || [])
      setPagination({ ...pagination, total: data?.total || 0 })
    }
    setLoading(false)
  }

  const { run } = useRequest(getHistoricalOptionList, {
    debounceWait: 300,
    manual: true,
  })

  const onHistoricalChange = (data: HistoricalPageinationType) => {
    setPagination({ ...pagination, current: data.current })
  }

  useEffect(() => {
    if (pagination.current > PlanDirectionType.current) {
      setPagination({ ...pagination, current: PlanDirectionType.current })
      return
    }
    getHistoricalOptionList()
  }, [historicalList, customizeTime])

  useUpdateEffect(() => {
    getHistoricalOptionList()
  }, [pagination.current])

  useMount(() => {
    wsOptionOrderSubscribe()
  })

  useCreation(() => {
    orderWsNum && run(true)
  }, [orderWsNum])

  useUnmount(() => {
    wsOptionOrderUnSubscribe()
  })

  useCreation(() => {
    const currentHeight = tableSize?.height || PlanDirectionType.total
    setTableHight(currentHeight > PlanDirectionType.total ? currentHeight : PlanDirectionType.total)
  }, [tableSize])

  return (
    <div className={'h-full'} ref={tableRef}>
      <div
        className={classNames(styleAsstes['ternary-option-position-root'], {
          'arco-table-body-full': true,
          'auto-width': true,
          'no-data': tableData?.length === 0,
        })}
        style={{ height: tableHight }}
      >
        <HistoricalTable
          data={tableData}
          loading={loading}
          height={tableHight}
          paginationType={pagination}
          onChange={onHistoricalChange}
        />
      </div>
    </div>
  )
}
