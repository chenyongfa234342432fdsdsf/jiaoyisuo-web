import dayjs from 'dayjs'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { IncreaseTag } from '@nbit/react'
import { TableColumnProps } from '@nbit/arco'
import { formatCurrency } from '@/helper/decimal'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { getFuturesGroupTypeName } from '@/constants/assets/futures'
import {
  getOrderStatus,
  HistoricalPageinationType,
  getOptionProductPeriodUnit,
  OptionSideIndCallEnum,
  OptionsSideIndPutEnum,
} from '@/constants/ternary-option'
import { getTextFromStoreEnums } from '@/helper/store'
import AssetsTable from '@/features/assets/common/assets-table'
import { useCommonStore } from '@/store/common'
import { useState } from 'react'
import Icon from '@/components/icon'
import { OpenAmountModal } from '@/features/ternary-option/position/position-list-view/open-amount-modal'
import styles from './index.module.css'

type HistoricalTableProps = {
  data: any[]
  height?: number
  loading?: boolean
  paginationType: HistoricalPageinationType
  onChange: (v: HistoricalPageinationType) => void
}

// type PlanDirectionType = {
//   value: string
//   name: string
// }

export default function HistoricalTable(props: HistoricalTableProps) {
  const { data, height, loading, paginationType, onChange } = props
  const { coinType, optionDictionaryEnums } = useTernaryOptionStore()
  const { isMergeMode } = useCommonStore()
  const [visibleOpenAmountPrompt, setVisibleOpenAmountPrompt] = useState(false)
  /** 选中的仓位信息 */
  const [selectedPosition, setSelectedPosition] = useState<any>()

  const cellStyle: any = {
    headerCellStyle: {
      textAlign: 'right',
    },
    bodyCellStyle: {
      textAlign: 'right',
    },
  }

  const ternaryName = {
    title: t`features_ternary_option_ternary_option_tab_index_wvt1kpsamd`,
    render: (_, record) => (
      <span className={styles['historical-table-text']}>{`${record?.symbol || ''} ${getFuturesGroupTypeName(
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
  const openPrice = {
    title: t`features_trade_trade_futures_calculator_trade_futures_calculator_modal_index_jmb2ti2bfkmozbyyzwaix`,
    ...cellStyle,
    dataIndex: 'openPrice',
    render: (col, record) => <div>{formatCurrency(record.openPrice)}</div>,
  }
  const openPositionTime = {
    title: t`features_ternary_option_historical_component_historical_table_index_t19mtxmtn9`,
    ...cellStyle,
    render: (_, record) => (
      <span className={styles['historical-table-text']}>
        {record?.createdByTime ? dayjs(record?.createdByTime).format('YYYY-MM-DD HH:mm:ss') : ''}
      </span>
    ),
  }
  const openPositionAmount = {
    title: `${t`features_ternary_option_historical_component_historical_table_index_zpakonnjw8`} (${coinType || ''})`,
    dataIndex: 'amount',
    ...cellStyle,
    render: (col, record) => (
      <div>
        {formatCurrency(record.amount) || '--'}
        {Number(record?.voucherAmount) > 0 && (
          <Icon
            name="msg"
            hasTheme
            className="icon ml-1"
            onClick={() => {
              setSelectedPosition(record)
              setVisibleOpenAmountPrompt(true)
            }}
          />
        )}
      </div>
    ),
  }
  const settlementPrice = {
    title: t`features_ternary_option_historical_component_historical_table_index_o80v__spjh`,
    ...cellStyle,
    dataIndex: 'settlementPrice',
    render: (col, record) => <div>{formatCurrency(record.settlementPrice) || '--'}</div>,
  }
  const settlementTime = {
    title: t`features_agent_agency_center_revenue_details_index_5101520`,
    ...cellStyle,
    render: (_, record) => (
      <span className={styles['historical-table-text']}>
        {record?.settlementTime ? dayjs(record?.settlementTime).format('YYYY-MM-DD HH:mm:ss') : ''}
      </span>
    ),
  }
  const settlementCycle = {
    title: t`features_ternary_option_historical_component_historical_table_index_lnqc6yahrn`,
    ...cellStyle,
    render: (_, record) => (
      <span className={styles['historical-table-text']}>{`${record?.periodDisplay || ''}${
        getOptionProductPeriodUnit(record?.periodUnit) || ''
      }`}</span>
    ),
  }
  const rate = {
    title: isMergeMode
      ? t`features_ternary_option_trade_form_index_ws9rgn5jlq`
      : t`features/orders/order-columns/holding-5`,
    ...cellStyle,
    render: (_, record) => <IncreaseTag needPercentCalc hasPostfix value={record?.realYield || '--'} />,
  }
  const profitLoss = {
    title: `${t`features_ternary_option_historical_component_historical_table_index_oop5lshpfi`}  (${coinType || ''})`,
    ...cellStyle,
    render: (_, record) => <IncreaseTag value={record?.realizedProfit || '--'} />,
  }
  const openingPrice = {
    title: t`features_ternary_option_position_index_rwn0haj0ei`,
    dataIndex: 'targetPrice',
    ...cellStyle,
    render: (col, record) => (
      <div>
        {OptionSideIndCallEnum.includes(record.sideInd) ? '>' : '<'}
        <span className="pl-0.5">{formatCurrency(record.targetPrice)}</span>
      </div>
    ),
  }
  // const status = {
  //   title: t`order.filters.status.label`,
  //   ...cellStyle,
  //   render: (_, record) => {
  //     return <div className={styles['historical-table-text']}>{getOrderStatus(record.statusCd) || ''}</div>
  //   },
  // }
  let columns: TableColumnProps[] = [
    ternaryName,
    direction,
    openingPrice,
    openPrice,
    settlementPrice,
    openPositionAmount,
    rate,
    profitLoss,
    settlementCycle,
    openPositionTime,
    settlementTime,
    // status,
  ]

  const onChangeTable = pagination => {
    const { current, pageSize } = pagination
    onChange && onChange({ ...pagination, current, pageSize })
  }

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
    <>
      <AssetsTable
        autoWidth
        fitByContent
        border={false}
        columns={columns}
        data={data}
        scroll={getTableScrollVal()}
        loading={loading}
        onChange={onChangeTable}
        pagination={paginationType}
        minWidthWithColumn={false}
        rowKey={record => `${record.id}`}
        className="list"
      />
      {/* 开层金额详情 */}
      {visibleOpenAmountPrompt && selectedPosition && (
        <OpenAmountModal
          visible={visibleOpenAmountPrompt}
          setVisible={setVisibleOpenAmountPrompt}
          data={selectedPosition}
        />
      )}
    </>
  )
}
