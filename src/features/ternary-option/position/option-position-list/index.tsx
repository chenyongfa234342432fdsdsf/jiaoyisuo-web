/**
 * 期权持仓 - 表格 - 老版 UI
 */
import Link from '@/components/link'
import { t } from '@lingui/macro'
import { getFuturesGroupTypeName } from '@/constants/assets/futures'
import { OptionSideIndCallEnum, OptionsSideIndPutEnum, getOptionProductPeriodUnit } from '@/constants/ternary-option'
import AssetsTable from '@/features/assets/common/assets-table'
import { getTextFromStoreEnums } from '@/helper/store'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { TableColumnProps } from '@nbit/arco'
import classNames from 'classnames'
import { formatDate } from '@/helper/date'
import { formatCurrency } from '@/helper/decimal'
import { IncreaseTag } from '@nbit/react'
import { NoDataElement } from '@/features/orders/order-table-layout'
import { decimalUtils } from '@nbit/utils'
import { useCommonStore } from '@/store/common'
import OptionCountDown from '../option-count-down'

interface IOptionPositionListProps {
  loading?: boolean
  height: number | string
}
export function OptionPositionList(props: IOptionPositionListProps) {
  const { loading = false, height } = props
  const { isMergeMode } = useCommonStore()
  const ternaryOptionStore = useTernaryOptionStore() || {}
  const { positionListOption, optionDictionaryEnums, optionCurrencySetting } = { ...ternaryOptionStore }
  const cellStyle: any = {
    headerCellStyle: {
      textAlign: 'right',
    },
    bodyCellStyle: {
      textAlign: 'right',
    },
  }

  const safeCalcUtil = decimalUtils.SafeCalcUtil

  const getTargetTime = (targetDateTime: number) => {
    const timestamp = Number(safeCalcUtil.sub(targetDateTime, new Date().getTime()))
    const targetTimeData = timestamp > 0 ? timestamp : 0
    return targetTimeData
  }

  const columns: TableColumnProps[] = [
    {
      title: t`features_ternary_option_position_index_ozpimwugyi`,
      dataIndex: 'symbol',
      width: 150,
      render: (col, record) => (
        <Link href={`/ternary-option/${record.symbol}`}>
          {record.symbol} {getFuturesGroupTypeName(record.typeInd)}
        </Link>
      ),
    },
    {
      // 结算周期
      title: t`features_ternary_option_position_index_grryygxxzd`,
      ...cellStyle,
      render: (col, record) => (
        <div>
          {record.periodDisplay}
          <span className="pl-1">{getOptionProductPeriodUnit(record.periodUnit)}</span>
        </div>
      ),
    },
    {
      title: t`order.columns.direction`,
      dataIndex: 'sideInd',
      ...cellStyle,
      render: (col, record) => (
        <div
          className={classNames({
            'text-buy_up_color': OptionSideIndCallEnum.includes(record.sideInd),
            'text-sell_down_color': OptionsSideIndPutEnum.includes(record.sideInd),
          })}
        >
          <span>{getTextFromStoreEnums(record.sideInd, optionDictionaryEnums.optionsSideIndEnum.enums)}</span>
          {record.amplitude && <span className="pl-1">{record.amplitude}</span>}
        </div>
      ),
    },
    {
      title: t`features_trade_trade_futures_calculator_trade_futures_calculator_modal_index_jmb2ti2bfkmozbyyzwaix`,
      dataIndex: 'openPrice',
      ...cellStyle,
      render: (col, record) => <div>{formatCurrency(record.openPrice)}</div>,
    },
    {
      // 标记价格
      title: t`future.funding-history.index-price.column.mark-price`,
      dataIndex: 'currentPrice',
      ...cellStyle,
      render: (col, record) => <IncreaseTag value={record.currentPrice || '--'} hasPrefix={false} delZero={false} />,
    },
    {
      // 目标价格
      title: t`features_ternary_option_position_index_rwn0haj0ei`,
      dataIndex: 'targetPrice',
      width: 200,
      ...cellStyle,
      render: (col, record) => (
        <div>
          {OptionSideIndCallEnum.includes(record.sideInd) ? '>' : '<'}
          <span className="pl-0.5">{formatCurrency(record.targetPrice)}</span>
        </div>
      ),
    },
    {
      // 开仓时间
      title: t`features_assets_futures_history_position_trade_history_position_history_position_list_index_52_ns_x8rw`,
      ...cellStyle,
      render: (col, record) => <div>{formatDate(record.createdByTime)}</div>,
    },
    {
      // 开仓金额 TODO 开仓金额需要从单独接口取，类似合约法币符号
      title: t({
        id: 'features_ternary_option_position_index_xemwpeqggu',
        values: { 0: optionCurrencySetting?.length > 0 ? optionCurrencySetting[0] : '' },
      }),
      ...cellStyle,
      width: 120,
      render: (col, record) => <div>{formatCurrency(record.amount)}</div>,
    },
    {
      title: isMergeMode
        ? t`features_ternary_option_trade_form_index_ws9rgn5jlq`
        : t`features/orders/order-columns/holding-5`,
      ...cellStyle,
      render: (col, record) => (
        <IncreaseTag
          value={isMergeMode ? decimalUtils.SafeCalcUtil.add(record.realYield, 1) : record.realYield}
          digits={isMergeMode ? 4 : 2}
          isRound={false}
          needPercentCalc
          hasPostfix={!isMergeMode}
        />
      ),
    },
    {
      title: t`features_agent_agency_center_revenue_details_index_5101520`,
      ...cellStyle,
      render: (col, record) => <div>{formatDate(record.settlementTime)}</div>,
    },

    {
      // 剩余时间
      title: t`features_ternary_option_position_index_gf8qrjaubw`,
      fixed: 'right',
      ...cellStyle,
      render: (col, record) => {
        const targetDateTime = getTargetTime(record.settlementTime)
        return (
          <div>
            {Number(targetDateTime) > 0 ? (
              <OptionCountDown targetDateTime={targetDateTime} />
            ) : (
              <span className="text-brand_color">{t`features_ternary_option_position_option_position_list_index_q8i4ga15hj`}</span>
            )}
          </div>
        )
      },
    },
  ]

  function getTableScrollVal() {
    if (positionListOption && positionListOption?.length > 0) {
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
      loading={loading}
      className="list"
      autoWidth
      fitByContent
      minWidthWithColumn={false}
      rowKey={record => `${record.id}`}
      columns={columns}
      data={positionListOption}
      border={false}
      pagination={false}
      noDataElement={
        <NoDataElement
          loading={loading}
          noDataText={t`features_assets_futures_common_position_list_position_list_view_index_7nsq4knjmt`}
        />
      }
      scroll={getTableScrollVal()}
    />
  )
}
