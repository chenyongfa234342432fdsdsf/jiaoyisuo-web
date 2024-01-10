import ButtonRadios from '@/components/button-radios'
import Icon from '@/components/icon'
import { getPeriodDayTime, getDayMs } from '@/helper/date'
import { t } from '@lingui/macro'
import { DatePicker, Select } from '@nbit/arco'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { createPortal } from 'react-dom'
import MiniSelect from '@/components/mini-select'
import { TRADE_ORDER_TAB_RIGHT_ID } from '@/constants/dom'
import styles from './base.module.css'

const { RangePicker } = DatePicker

export type IFiltersProps<T> = {
  onChange: (params: Partial<T>) => any
  params: T
  filterOptions: IOrderFilterOption[]
}

export type IOrderFilterSelectProps = {
  value: any
  label?: string
  options: {
    label: string
    value: any
  }[]
  placeholder?: string
  paramsKey: any
  setParams: (params: any) => void
}
export type IOrderFilterOption = Omit<IOrderFilterSelectProps, 'setParams' | 'value'>
export function OrderFilterSelect({
  label,
  value,
  options,
  placeholder,
  paramsKey,
  setParams,
}: IOrderFilterSelectProps) {
  const onChange = (newValue: any) => {
    setParams({
      [paramsKey]: newValue,
    })
  }

  return (
    <div className={classNames(styles['base-select-wrapper'], 'mb-filter-block')}>
      {label && <span className="mr-2.5 font-medium">{label}</span>}
      <Select
        className="newbit-select-custom-style"
        dropdownMenuClassName={styles['base-select-options-wrapper']}
        style={{ width: 150 }}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        arrowIcon={<Icon name="arrow_open" hasTheme className="text-xs scale-75" />}
      >
        {options.map(option => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}
enum DateTypeEnum {
  day = 2,
  week = 7,
  month = 30,
  threeMonth = 90,
  custom = '',
}
type IPrams = {
  dateType?: string | number
  beginDateNumber?: number
  endDateNumber?: number
}
export function OrderDateFiltersInTable({
  params,
  onChange,
  inTrade,
  invisible,
}: IFiltersProps<IPrams> & {
  inTrade?: boolean
  invisible?: boolean
}) {
  const dateTypeList = [
    {
      label: t`features_orders_filters_spot_5101182`,
      value: DateTypeEnum.day,
    },
    {
      label: t`features_orders_filters_spot_5101183`,
      value: DateTypeEnum.week,
    },
    {
      label: t`features_orders_filters_spot_5101184`,
      value: DateTypeEnum.month,
    },
    {
      label: t`features_orders_filters_spot_5101185`,
      value: DateTypeEnum.threeMonth,
    },
  ]
  if (inTrade && !invisible) {
    dateTypeList.push({
      label: t`features_orders_filters_base_uzzjfkyftb`,
      value: DateTypeEnum.custom,
    })
  }
  const onDateTypeChange = (type: any) => {
    if (type === params.dateType) {
      return
    }
    onChange({
      beginDateNumber: getPeriodDayTime(type || params.dateType).start,
      endDateNumber: getPeriodDayTime(type || params.dateType).end,
      dateType: type,
    })
  }
  const onSelectDate = (v: string[]) => {
    onChange({
      beginDateNumber: v[0] ? dayjs(v[0]).toDate().getTime() : undefined,
      endDateNumber: v[1] ? dayjs(v[1]).toDate().getTime() + getDayMs(1) - 1000 : undefined,
      dateType: '',
    })
  }
  const buttonRadiosClassName = classNames('px-2', {
    'py-1 text-xs': inTrade,
    'h-10 text-sm': !inTrade,
  })
  const datePickerNode = (
    <RangePicker
      showTime={{
        format: 'YYYY-MM-DD',
      }}
      className={classNames(styles['date-select-wrapper'], 'newbit-picker-custom-style', {
        'in-trade': inTrade,
      })}
      onClear={() => onSelectDate([])}
      format="YYYY-MM-DD"
      value={[params.beginDateNumber!, params.endDateNumber!]}
      disabledDate={current => current.isBefore(Date.now() - getDayMs(90)) || current.isAfter(Date.now())}
      onOk={onSelectDate}
      triggerProps={{
        className: classNames(styles['date-select-modal-wrapper'], {
          'in-trade': inTrade,
        }),
      }}
    />
  )

  const app = (
    <>
      <div className="mb-filter-block mr-4 -ml-2">
        <ButtonRadios
          hasGap
          bothClassName={buttonRadiosClassName}
          inactiveClassName="text-text_color_02"
          activeClassName="text-brand_color"
          options={dateTypeList}
          onChange={onDateTypeChange}
          value={params.dateType || ''}
        />
      </div>
      <div className="flex items-center mb-filter-block mr-4">
        <span
          className={classNames('mr-3', {
            'text-xs': inTrade,
            'text-sm font-medium': !inTrade,
          })}
        >{t`order.columns.date`}</span>
        {datePickerNode}
      </div>
    </>
  )
  const dom = document.querySelector(`#${TRADE_ORDER_TAB_RIGHT_ID}`)

  if (!inTrade) {
    return app
  }
  if (dom && !invisible) {
    const appInTrade = (
      <div className="flex items-center mr-4">
        {!params.dateType && <div>{datePickerNode}</div>}
        <MiniSelect
          inThead
          triggerProps={{
            autoAlignPopupWidth: false,
            trigger: !params.dateType ? 'hover' : 'click',
            autoAlignPopupMinWidth: true,
            position: !params.dateType ? 'br' : 'bl',
          }}
          className={classNames({
            'text-xs': inTrade,
          })}
          label={!params.dateType ? ' ' : t`order.columns.date`}
          value={params.dateType || ''}
          onChange={onDateTypeChange}
          options={dateTypeList}
        />
      </div>
    )
    return createPortal(appInTrade, dom)
  }

  return null
}
