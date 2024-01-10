import dayjs from 'dayjs'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { getTextFromStoreEnums } from '@/helper/store'
import { formatCurrency } from '@/helper/decimal'
import { Switch, TableColumnProps } from '@nbit/arco'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { getFuturesGroupTypeName } from '@/constants/assets/futures'
import AssetsTable from '@/features/assets/common/assets-table'
import {
  PlanDelegationHeaderEnum,
  OptionSideIndCallEnum,
  OptionsSideIndPutEnum,
  getOptionProductPeriodUnit,
} from '@/constants/ternary-option'
import styles from './index.module.css'

type PlanDelegationTableProps = {
  data: any[]
  loading?: boolean
  height?: number
  tableActive: PlanDelegationHeaderEnum
  onDelChange?: (v) => void
  onSwitchChange?: (v, record) => void
}

type PlanDirectionType = {
  value: string
  name: string
}

export default function PlanDelegationTable(props: PlanDelegationTableProps) {
  const { data, height, tableActive, loading, onDelChange, onSwitchChange } = props
  const { coinType, optionDictionaryEnums } = useTernaryOptionStore()

  const cellStyle: any = {
    headerCellStyle: {
      textAlign: 'right',
    },
    bodyCellStyle: {
      textAlign: 'right',
    },
  }

  // /** 格式化方向* */
  // const handleDirection = (v: string) => {
  //   let keyClass = ''
  //   if (v === DirectionType.call || v === DirectionType.overCall) {
  //     keyClass = 'call'
  //   } else {
  //     keyClass = 'put'
  //   }
  //   const newDirectionList = directionList as PlanDirectionType[]
  //   const direction = newDirectionList.find(item => item.value === v)
  //   return { name: direction?.name || '', key: keyClass }
  // }

  /** 删除* */
  const onDelOperateChange = async record => {
    onDelChange && onDelChange(record)
  }

  /** 订单状态切换* */
  const onSwitchOperateChange = async (checked, record) => {
    onSwitchChange && onSwitchChange(checked, record)
  }

  const ternaryName = {
    title: t`features_ternary_option_ternary_option_tab_index_wvt1kpsamd`,
    render: (_, record) => (
      <span className={styles['plan-table-text']}>{`${record?.symbol || ''} ${getFuturesGroupTypeName(
        record?.typeInd
      )}`}</span>
    ),
  }
  const direction = {
    title: t`order.columns.direction`,
    ...cellStyle,
    render: (_, record) => {
      return (
        <div
          className={classNames({
            'text-buy_up_color': OptionSideIndCallEnum.includes(record.sideInd),
            'text-sell_down_color': OptionsSideIndPutEnum.includes(record.sideInd),
          })}
        >
          <span>{getTextFromStoreEnums(record.sideInd, optionDictionaryEnums.optionsSideIndEnum.enums)}</span>
          <span className="pl-1">{record.amplitude || ''}</span>
        </div>
      )
    },
  }
  const settlementCycle = {
    title: t`features_ternary_option_historical_component_historical_table_index_lnqc6yahrn`,
    ...cellStyle,
    render: (_, record) => (
      <span className={styles['plan-table-text']}>{`${record?.periodDisplay || ''}${
        getOptionProductPeriodUnit(record?.periodUnit) || ''
      }`}</span>
    ),
  }
  const time = {
    title: t`assets.coin.trade-records.table.date`,
    ...cellStyle,
    render: (_, record) => (
      <span className={styles['plan-table-text']}>
        {record?.createdByTime ? dayjs(record?.createdByTime).format('YYYY-MM-DD HH:mm:ss') : ''}
      </span>
    ),
  }
  const setAmount = {
    title: `${t`features_ternary_option_plan_delegation_component_plan_delegation_table_index_xtwppcbpj3`} (${
      coinType || ''
    })`,
    ...cellStyle,
    dataIndex: 'amount',
    render: (col, record) => <div>{formatCurrency(record.amount) || '--'}</div>,
  }
  const maxTriggerNum = {
    title: t`features_ternary_option_plan_delegation_component_plan_delegation_table_index_gqep7qgqjr`,
    ...cellStyle,
    dataIndex: 'cycles',
  }
  const triggerNum = {
    title: t`features_ternary_option_plan_delegation_component_plan_delegation_table_index_gjzeto4hw4`,
    dataIndex: 'triggeredCount',
    ...cellStyle,
    render: (col, record) => <div className="pl-1">{record.triggeredCount || '--'}</div>,
  }
  const maxAmount = {
    title: `${t`features_ternary_option_plan_delegation_component_plan_delegation_table_index_jkiu7iz19f`} (${
      coinType || ''
    })`,
    dataIndex: 'maxAmount',
    ...cellStyle,
    render: (col, record) => <div>{formatCurrency(record.maxAmount) || '--'}</div>,
  }
  const triggerTime = {
    title: t`features_ternary_option_plan_delegation_component_plan_delegation_table_index_6oyraa5qco`,
    render: (col, record) => (
      <span className={styles['plan-table-text']}>
        {record?.lastTriggerTime ? dayjs(record?.lastTriggerTime).format('YYYY-MM-DD HH:mm:ss') : ''}
      </span>
    ),
    ...cellStyle,
  }
  const operate = {
    title: t`order.columns.action`,
    fixed: 'right',
    ...cellStyle,
    render: (col, record) => (
      <div className={styles['plan-delegation-table']}>
        <Switch checked={record?.statusCd === 'activated'} onChange={v => onSwitchOperateChange(v, record)} />
        <div className="operate-right-tag" onClick={() => onDelOperateChange(record)}>
          {t`assets.common.delete`}
        </div>
      </div>
    ),
    ...cellStyle,
  }
  const initialAmount = {
    title: `${t`features_ternary_option_plan_delegation_component_plan_delegation_table_index_8gii4xmv8i`} (${
      coinType || ''
    })`,
    dataIndex: 'amount',
    render: (col, record) => <div>{formatCurrency(record.amount) || '--'}</div>,
    ...cellStyle,
  }
  const lastAmount = {
    title: `${t`features_ternary_option_plan_delegation_component_plan_delegation_table_index_5q4oslknd7`} (${
      coinType || ''
    })`,
    dataIndex: 'lastPlaceAmount',
    render: (col, record) => <div>{formatCurrency(record.lastPlaceAmount) || '--'}</div>,
    ...cellStyle,
  }
  let columns: TableColumnProps[] =
    tableActive === PlanDelegationHeaderEnum.senior
      ? [
          ternaryName,
          settlementCycle,
          direction,
          time,
          setAmount,
          maxTriggerNum,
          triggerNum,
          maxAmount,
          triggerTime,
          operate,
        ]
      : [
          ternaryName,
          settlementCycle,
          direction,
          time,
          initialAmount,
          lastAmount,
          maxTriggerNum,
          triggerNum,
          maxAmount,
          triggerTime,
          operate,
        ]

  const getTableScrollVal = () => {
    if (data && data?.length > 0) {
      return {
        x: 800,
        y: height,
      }
    }

    return {
      y: height,
    }
  }

  return (
    <AssetsTable
      autoWidth
      className="list"
      fitByContent
      minWidthWithColumn={false}
      data={data}
      border={false}
      columns={columns}
      pagination={false}
      loading={loading}
      scroll={getTableScrollVal()}
      rowKey={record => `${record.id}`}
    />
  )
}
