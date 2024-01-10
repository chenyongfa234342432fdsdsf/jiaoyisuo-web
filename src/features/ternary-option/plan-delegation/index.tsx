import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { Message } from '@nbit/arco'
import classNames from 'classnames'
import { useState, useRef } from 'react'
import { useSize, useRequest, useMount, useUpdateEffect, useUnmount, useCreation } from 'ahooks'
import { useTernaryOptionStore } from '@/store/ternary-option'
import DelModal from '@/features/ternary-option/plan-delegation/component/del-modal'
import { getPlanOrdersCurrent, getPlanOrdersOperate, getAllDeletePlanOrdersOperate } from '@/apis/ternary-option'
import {
  TernaryTabTypeEnum,
  PlanDelegationHeaderEnum,
  getPlanDelegationHeaderList,
  HistoricalPageinationType,
} from '@/constants/ternary-option'
import { getIsLogin } from '@/helper/auth'
import { YapiGetV1OptionPlanOrdersCurrentListData } from '@/typings/yapi/OptionPlanOrdersCurrentV1GetApi.d'
import PlanDelegationTables from '@/features/ternary-option/plan-delegation/component/plan-delegation-table'
import styleAsstes from '@/features/ternary-option/position/index.module.css'
import styles from './index.module.css'

type PlanDelegationTableProps = {
  type: string
}

enum PlanTableEnum {
  none,
  start,
}

export default function PlanDelegationTable({ type }: PlanDelegationTableProps) {
  const pagination = useRef<HistoricalPageinationType>({
    total: PlanTableEnum.none,
    pageSize: 500,
    current: PlanTableEnum.start,
  })
  const tableRef = useRef<HTMLDivElement>(null)
  const tableSize = useSize(tableRef)

  const isLogn = getIsLogin()
  const [delLoading, setDelLoading] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [visible, setVisible] = useState<boolean>(false)
  const [tableHight, setTableHight] = useState<number>(PlanTableEnum.none)
  const [active, setActive] = useState<number>(PlanDelegationHeaderEnum.senior)
  const [tableData, setTableData] = useState<YapiGetV1OptionPlanOrdersCurrentListData[]>([])

  const { planWsNum, setPlanTableNum, wsPlanEntrustedDepthSubscribe, wsPlanEntrustedDepthUnSubscribe } =
    useTernaryOptionStore()

  const onTagChange = (v: PlanDelegationHeaderEnum) => {
    setActive(v)
  }

  const onDelModal = () => {
    setVisible(true)
  }

  /** 获取计划委托列表* */
  const getPlanOrdersList = async (flag?: boolean) => {
    if (!isLogn) return
    const params = {
      isSmart: active,
      pageNum: pagination.current?.current,
      pageSize: pagination.current?.pageSize,
    }
    setLoading(!flag)
    const { isOk, data } = await getPlanOrdersCurrent(params)
    setLoading(false)
    isOk && data && setTableData(data?.list || [])
  }
  const getPlanOrdersNum = async () => {
    if (!isLogn) return
    const params = {
      pageNum: pagination.current?.current,
      pageSize: pagination.current?.pageSize,
    }
    const { isOk, data } = await getPlanOrdersCurrent(params)
    isOk && data && setPlanTableNum(data?.total)
  }

  const { run } = useRequest(getPlanOrdersList, {
    debounceWait: 300,
    manual: true,
  })

  /** 全部删除* */
  const onDelChange = async () => {
    setDelLoading(true)
    const { isOk, data } = await getAllDeletePlanOrdersOperate({})
    if (isOk && data) {
      // getPlanOrdersList()
      setVisible(false)
      Message.success(t`features_c2c_advertise_advertise_history_record_list_index_b4ukisitxcslwpvpybfmm`)
    }
    setDelLoading(false)
  }

  /** 删除* */
  const onPlanDelChange = async record => {
    setLoading(true)
    const params = { id: record.id, action: 'cancel' }
    const { isOk, data: delData } = await getPlanOrdersOperate(params)
    if (!isOk && !delData) {
      return setLoading(false)
    }
    // getPlanOrdersList()
    Message.success(t`features_c2c_advertise_advertise_history_record_list_index_b4ukisitxcslwpvpybfmm`)
  }

  /** 订单启用和关闭* */
  const onPlanSwitchChange = async (checked, record) => {
    setLoading(true)
    const params = { id: record.id, action: checked ? 'start' : 'close' }
    const { isOk, data: switchData } = await getPlanOrdersOperate(params)
    if (!isOk && !switchData) {
      return setLoading(false)
    }
    // getPlanOrdersList()
    Message.success(
      checked
        ? t`features_ternary_option_plan_delegation_index_kypf36qgkx`
        : t`features_ternary_option_plan_delegation_index_qcocatziz7`
    )
  }

  useMount(() => {
    wsPlanEntrustedDepthSubscribe()
    getPlanOrdersNum()
    getPlanOrdersList()
  })

  useCreation(() => {
    planWsNum && run(true)
    planWsNum && getPlanOrdersNum()
  }, [planWsNum])

  useUpdateEffect(() => {
    getPlanOrdersList()
  }, [active])

  useUnmount(() => {
    wsPlanEntrustedDepthUnSubscribe()
  })

  useCreation(() => {
    const currentHeight = tableSize?.height || PlanTableEnum.none
    const current = currentHeight - 32
    setTableHight(current > PlanTableEnum.none ? current : PlanTableEnum.none)
  }, [tableSize])

  if (type !== TernaryTabTypeEnum.plan) return null

  return (
    <div className={styles['plan-delegation-table']} ref={tableRef}>
      <div className="plan-delegation-header">
        <div className="table-header-button">
          {getPlanDelegationHeaderList().map(item => {
            return (
              <div
                key={item.value}
                onClick={() => onTagChange(item.value)}
                className={`item ${active === item.value ? 'item-active' : ''}`}
              >
                {item.name}
              </div>
            )
          })}
        </div>
        <div className="table-text-deleted" onClick={onDelModal}>
          <Icon hasTheme name="delete_icon" className="table-text-deleted-icon" />
          <div className="table-text-deleted-item">{t`features_ternary_option_plan_delegation_index_dcymca1vgy`}</div>
        </div>
      </div>
      <div
        className={classNames(styleAsstes['ternary-option-position-root'], {
          'arco-table-body-full': true,
          'auto-width': true,
          'no-data': tableData?.length === 0,
        })}
        style={{ height: tableHight }}
      >
        <PlanDelegationTables
          data={tableData}
          loading={loading}
          tableActive={active}
          height={tableHight}
          onDelChange={onPlanDelChange}
          onSwitchChange={onPlanSwitchChange}
        />
      </div>
      <DelModal visible={visible} setVisible={setVisible} onChange={onDelChange} loading={delLoading} />
    </div>
  )
}
