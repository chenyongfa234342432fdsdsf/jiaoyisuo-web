import {
  getOrderDirectionEnumName,
  getOrderStatusEnumName,
  OrderDirectionEnum,
  EntrustTypeEnum,
  OrderStatusEnum,
} from '@/constants/order'
import { enumValuesToOptions } from '@/helper/order'
import { IQuerySpotOrderReqParams } from '@/typings/api/order'
import { DatePicker } from '@nbit/arco'
import { t } from '@lingui/macro'
import { useMount, useUpdateEffect } from 'ahooks'
import { getDayMs, getPeriodDayTime } from '@/helper/date'
import dayjs from 'dayjs'
import ButtonRadios from '@/components/button-radios'
import { baseSpotStore, useBaseOrderSpotStore } from '@/store/order/spot'
import PopupSearchSelect from '@/components/popup-search-select'
import classNames from 'classnames'
import { storeEnumsToOptions } from '@/helper/store'
import { IFiltersProps, IOrderFilterOption, OrderFilterSelect } from './base'
import styles from './base.module.css'

const { RangePicker } = DatePicker

type IPrams = Omit<IQuerySpotOrderReqParams, 'type'>

export enum OrderParamsKeyEnum {
  direction = 'direction',
  placeOrderType = 'orderType',
  tradeArea = 'tradeArea',
  status = 'entrustState',
  currency = 'tradeId',
  timeRange = 'timeRange',
}

function getBaseFilterOptions(params: IPrams) {
  const isNormalOrder = params.entrustType === EntrustTypeEnum.normal
  const orderEnums = baseSpotStore.getState().orderEnums
  const orderTypeOptions = [
    {
      label: t`common.all`,
      value: '',
    },
    ...(isNormalOrder
      ? storeEnumsToOptions(orderEnums.entrustTypeWithSuffix.enums)
      : storeEnumsToOptions(orderEnums.planEntrustTypeWithSuffix.enums)),
  ]
  const baseFilters: IOrderFilterOption[] = [
    {
      placeholder: '',
      paramsKey: OrderParamsKeyEnum.currency,
      options: [{ value: '', label: t`common.all` }],
    },
    {
      paramsKey: OrderParamsKeyEnum.direction,
      options: enumValuesToOptions(
        [OrderDirectionEnum.all, OrderDirectionEnum.buy, OrderDirectionEnum.sell],
        getOrderDirectionEnumName
      ),
    },
    {
      label: isNormalOrder ? t`features_trade_trade_order_confirm_index_5101516` : t`order.columns.entrustType`,
      paramsKey: OrderParamsKeyEnum.placeOrderType,
      options: orderTypeOptions as any[],
    },
    {
      paramsKey: OrderParamsKeyEnum.timeRange,
      label: t`order.filters.timeRange.label`,
      options: [
        {
          // 这里无需使用 enum
          value: 1,
          label: t`order.filters.timeRange.week`,
        },
        {
          value: 2,
          label: t`order.filters.timeRange.month`,
        },
        {
          value: 3,
          label: t`order.filters.timeRange.3m`,
        },
      ],
    },
  ]

  return baseFilters
}

/** 传入 id 数组 和可选映射函数返回筛选和重新排序后的列 */
export function getOrderFilterOptions(keys: OrderParamsKeyEnum[], params: IPrams) {
  return getBaseFilterOptions(params)
    .filter(filter => keys.includes(filter.paramsKey as any))
    .sort((a, b) => keys.indexOf(a.paramsKey) - keys.indexOf(b.paramsKey))
}

export function CurrentOrdersFilter({ params, onChange, filterOptions }: IFiltersProps<IPrams>) {
  // 委托类型改变时调整状态，因为状态不一致
  useUpdateEffect(() => {
    onChange({
      status: '',
    })
  }, [params.entrustType])
  const { pairList } = useBaseOrderSpotStore()
  const pairOptions = pairList.map(pair => ({
    label: pair.name,
    value: pair.id,
    name: pair.name,
  }))
  pairOptions.unshift({
    label: t`common.all`,
    value: '',
    name: t`common.all`,
  })

  return (
    <div className="flex flex-wrap">
      <div className="mr-6 mb-filter-block flex items-center">
        <span className="mr-3 font-medium">{t`order.columns.currency`}</span>
        <PopupSearchSelect
          className="w-[150px] h-10 !rounded-lg"
          popupClassName="w-[150px]"
          value={params.tradeId}
          options={pairOptions}
          searchPlaceHolder={t`features_orders_filters_spot_5101181`}
          onChange={id => {
            onChange({
              tradeId: id,
            })
          }}
        />
      </div>
      {filterOptions.map(({ paramsKey, options, ...filterOption }) => (
        <OrderFilterSelect
          key={paramsKey}
          paramsKey={paramsKey}
          value={params[paramsKey]}
          options={options}
          {...filterOption}
          setParams={onChange}
        />
      ))}
    </div>
  )
}
