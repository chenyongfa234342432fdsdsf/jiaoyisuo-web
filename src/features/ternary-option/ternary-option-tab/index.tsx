import dayjs from 'dayjs'
import { t } from '@lingui/macro'
import { useMount } from 'ahooks'
import classNames from 'classnames'
import Tabs from '@/components/tabs'
import Icon from '@/components/icon'
import { DatePicker } from '@nbit/arco'
import { useState } from 'react'
import { getCodeDetailList } from '@/apis/common'
import { enumValuesToOptions } from '@/helper/order'
import { getPeriodDayTime, getDayMs } from '@/helper/date'
import { getProductCurrencies } from '@/apis/ternary-option'
import Historical from '@/features/ternary-option/historical'
import { IQueryFutureOrderListReq } from '@/typings/api/order'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { getFuturesGroupTypeName } from '@/constants/assets/futures'
import PlanDelegation from '@/features/ternary-option/plan-delegation'
import { getV1OptionTradePairListApiRequest } from '@/apis/ternary-option/market'
import ProfitLossModal from '@/features/ternary-option/ternary-option-tab/component/profit-loss-modal'
import PopupSelect, { DataType } from '@/features/ternary-option/ternary-option-tab/component/popup-select'
import {
  HistoricalEnum,
  TernaryTabTypeEnum,
  timeFilteringList,
  HistoricalTypeEnum,
  TimeFilteringListEnum,
  getTernaryOptionEnumName,
  TernaryOptionDictionaryEnum,
  OptionProductPeriodUnitEnum,
  getOptionProductPeriodUnit,
} from '@/constants/ternary-option'
import { useUserStore } from '@/store/user'
import { TernaryOptionPosition } from '../position'
import styles from './index.module.css'

const { RangePicker } = DatePicker
export function TernaryOptionTab() {
  const userStore = useUserStore()
  const { isLogin } = userStore

  const [visible, setVisible] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<IQueryFutureOrderListReq>({
    beginDateNumber: getPeriodDayTime(TimeFilteringListEnum.day).start,
    endDateNumber: getPeriodDayTime(TimeFilteringListEnum.day).end,
  })
  const [historicalList, setHistoricalList] = useState<HistoricalTypeEnum>({
    [HistoricalEnum.time]: '',
    [HistoricalEnum.name]: '',
    [HistoricalEnum.cycle]: '',
    [HistoricalEnum.direction]: '',
  })
  const [cdData, setCdData] = useState<Array<DataType>>([]) // 结算周期
  const [coinData, setCoinData] = useState<Array<DataType>>([]) // 币种

  const { optionTab, setOptionTab, planTableNum, directionList, setDirectionList, setCoinType, positionListOption } =
    useTernaryOptionStore()

  const getTradePairList = async () => {
    const { isOk, data } = await getV1OptionTradePairListApiRequest({})
    if (isOk && data) {
      const newCoinData =
        (data?.list?.map(item => ({
          value: item.id,
          name: item.symbol,
          label: `${item.symbol} ${getFuturesGroupTypeName(item?.typeInd || '')}`,
        })) as DataType[]) || []
      newCoinData?.unshift({ value: '', label: t`common.all` })
      setCoinData(newCoinData)
    }
  }
  const getCodeOptions = async () => {
    const { isOk, data } = await getCodeDetailList({ codeVal: TernaryOptionDictionaryEnum.optionsSideInd })
    if (isOk && data) {
      const newData = data?.map(item => ({ value: item.codeVal, name: item.codeKey })) || []
      newData?.unshift({ value: '', name: t`common.all` })
      setDirectionList(newData)
    }
    const { isOk: periodIsOk, data: periodData } = await getCodeDetailList({
      codeVal: TernaryOptionDictionaryEnum.productPeriodCd,
    })
    if (periodIsOk && periodData) {
      const periodList =
        periodData?.map(item => {
          if (Number(item.codeKey) < 60) {
            item.codeKey += getOptionProductPeriodUnit(OptionProductPeriodUnitEnum.seconds)
          } else {
            const minTime = Number(item.codeKey) / 60
            item.codeKey = `${minTime}${getOptionProductPeriodUnit(OptionProductPeriodUnitEnum.minutes)}`
          }
          return {
            value: item.codeVal,
            name: item.codeKey,
          }
        }) || []
      periodList?.unshift({ value: '', name: t`common.all` })
      setCdData(periodList)
    }
  }

  const getProductCoin = async () => {
    const { isOk, data } = await getProductCurrencies({})
    isOk && data && setCoinType(data?.[0] || '')
  }

  const tabs = enumValuesToOptions(
    [TernaryTabTypeEnum.position, TernaryTabTypeEnum.plan, TernaryTabTypeEnum.history],
    getTernaryOptionEnumName
  )
  if (isLogin) {
    tabs[0].label += `(${positionListOption?.length || 0})`
    tabs[1].label += `(${planTableNum || 0})`
  }

  const onTernaryTabChange = v => {
    setOptionTab(v.value)
  }

  /** 点击弹框折线图* */
  const onIconEchatChange = () => {
    setVisible(true)
  }

  /** 筛选* */
  const onSelectchange = (data: number | string, value: HistoricalEnum) => {
    if (value === HistoricalEnum.time && data === TimeFilteringListEnum.custom) {
      const time = (historicalList[HistoricalEnum.time] as number) || TimeFilteringListEnum.day
      setCurrentTime({
        beginDateNumber: getPeriodDayTime(time).start,
        endDateNumber: getPeriodDayTime(time).end,
      })
    }
    setHistoricalList({ ...historicalList, [value]: data })
  }

  const onSelectDate = (v: string[]) => {
    setCurrentTime({
      beginDateNumber: v[0] ? dayjs(v[0]).toDate().getTime() : undefined,
      endDateNumber: v[1] ? dayjs(v[1]).toDate().getTime() + getDayMs(1) - 1000 : undefined,
    })
  }

  let rightExtraNode
  if (optionTab === TernaryTabTypeEnum.history) {
    rightExtraNode = (
      <div className={styles['ternary-option-tab-select']}>
        {historicalList[HistoricalEnum.time] === TimeFilteringListEnum.custom && (
          <div className="flex items-center mb-filter-block">
            <RangePicker
              showTime={{
                format: 'YYYY-MM-DD',
              }}
              format="YYYY-MM-DD"
              onOk={onSelectDate}
              onClear={() => onSelectDate([])}
              value={[currentTime?.beginDateNumber || 0, currentTime?.endDateNumber || 0]}
              className={classNames(styles['date-select-wrapper'], 'newbit-picker-custom-style', 'in-trade')}
              disabledDate={current => current.isBefore(Date.now() - getDayMs(90)) || current.isAfter(Date.now())}
              triggerProps={{
                className: classNames(styles['date-select-modal-wrapper'], 'in-trade'),
              }}
            />
          </div>
        )}
        <PopupSelect
          className="tab-select-item"
          data={timeFilteringList()}
          popoverClassName="tab-select-popover-item"
          type={historicalList[HistoricalEnum.time] === TimeFilteringListEnum.custom}
          onChange={value => onSelectchange(value, HistoricalEnum.time)}
          arrowIcon={<Icon name="arrow_open" hasTheme className={styles['popup-select-icon']} />}
          defaultName={t`features_ternary_option_ternary_option_tab_index_wgazgjkp5y`}
        />
        <PopupSelect
          value="label"
          data={coinData}
          className="tab-select-item"
          popoverClassName="tab-select-popover-name"
          onChange={value => onSelectchange(value, HistoricalEnum.name)}
          arrowIcon={<Icon name="arrow_open" hasTheme className={styles['popup-select-icon']} />}
          defaultName={t`features_ternary_option_ternary_option_tab_index_wvt1kpsamd`}
        />
        <PopupSelect
          className="tab-select-item"
          data={directionList}
          popoverClassName="tab-select-popover-item"
          onChange={value => onSelectchange(value, HistoricalEnum.direction)}
          arrowIcon={<Icon name="arrow_open" hasTheme className={styles['popup-select-icon']} />}
          defaultName={t`order.columns.direction`}
        />
        <PopupSelect
          className="tab-select-item"
          data={cdData}
          popoverClassName="tab-select-popover-item"
          onChange={value => onSelectchange(value, HistoricalEnum.cycle)}
          arrowIcon={<Icon name="arrow_open" hasTheme className={styles['popup-select-icon']} />}
          defaultName={t`features/assets/futures/transferList/index-1`}
        />
        <div className="h-3.5 w-px bg-line_color_02 mr-4" />
      </div>
    )
  } else {
    rightExtraNode = null
  }

  useMount(() => {
    getCodeOptions()
    getProductCoin()
    getTradePairList()
  })

  return (
    <div className={styles['ternary-tab-wrapper']}>
      <div className="tabs-wrapper">
        <Tabs
          extra={null}
          mode="line"
          titleMap="label"
          idMap="value"
          tabList={tabs}
          value={optionTab}
          onChange={onTernaryTabChange}
          rightExtra={
            <div className="flex items-center">
              {rightExtraNode}
              <Icon name="form_icon" onClick={onIconEchatChange} hasTheme />
            </div>
          }
        />
      </div>
      <div className="content-wrapper">
        <TernaryOptionPosition isShow={optionTab === TernaryTabTypeEnum.position} />
        <PlanDelegation type={optionTab} />
        {optionTab === TernaryTabTypeEnum.history && (
          <Historical customizeTime={currentTime} historicalList={historicalList} />
        )}
      </div>
      <ProfitLossModal visible={visible} setVisible={setVisible} />
    </div>
  )
}
