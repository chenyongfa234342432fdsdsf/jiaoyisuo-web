import { t } from '@lingui/macro'
import { useState } from 'react'
import { Button, DatePicker, Select, Message } from '@nbit/arco'
import {
  // getFinancialRecordTypeEnumName,
  // getFinancialRecordStateEnumName,
  // FinancialRecordTypeEnum,
  FinancialRecordTypeMainList,
  FinancialRecordTypeCommissionList,
  FinancialRecordStateList,
  FinancialRecordStateEnum,
  FinancialRecordLogTypeEnum,
} from '@/constants/assets'
import dayjs from 'dayjs'
import { getStoreEnumsToOptions } from '@/helper/assets'
import { useAssetsStore } from '@/store/assets'
import { ISearchParamsProps } from '@/typings/assets'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { usePageContext } from '@/hooks/use-page-context'
import styles from './index.module.css'
import { AssetSelect } from '../../common/assets-select'

interface SearchItemProps {
  onSearchFn(val): void
  logType: string | number
  searchParams: any
  coinList: any
}

/** 修改筛选条件 */
export function updateActiveSearchParams(logType, params, searchParams: ISearchParamsProps) {
  switch (+logType) {
    case FinancialRecordLogTypeEnum.main:
      searchParams.main = params
      break
    case FinancialRecordLogTypeEnum.futures:
      searchParams.futures = params
      break
    case FinancialRecordLogTypeEnum.derivative:
      searchParams.derivative = params
      break
    case FinancialRecordLogTypeEnum.commission:
      searchParams.commission = params
      break
    case FinancialRecordLogTypeEnum.other:
      searchParams.other = params
      break
    case FinancialRecordLogTypeEnum.rebate:
      searchParams.rebate = params
      break
    case FinancialRecordLogTypeEnum.c2c:
      searchParams.c2c = params
      break
    default:
  }
  return searchParams
}

/** 获取当前类型财务记录 */
const getCurrentTypeData = (logType, assetsEnums, searchParams) => {
  let paramsObj = searchParams.main
  let recordTypeList
  let stateList = getStoreEnumsToOptions(assetsEnums.financialRecordStateEnum.enums) || FinancialRecordStateList
  const isMergeMode = getMergeModeStatus()
  if (+logType === +FinancialRecordLogTypeEnum.main) {
    /** 现货交易账户 */
    paramsObj = searchParams.main
    // 融合模式下，财务记录类型枚举不同
    const recordTypeEnums = isMergeMode
      ? assetsEnums.financialRecordTypeFusionMainList.enums
      : assetsEnums.financialRecordTypeMainList.enums

    recordTypeList = getStoreEnumsToOptions(recordTypeEnums) || FinancialRecordTypeMainList
  } else if (+logType === +FinancialRecordLogTypeEnum.futures) {
    /** 合约 */
    paramsObj = searchParams.futures
    recordTypeList = getStoreEnumsToOptions(assetsEnums.financialRecordTypePerpetualList.enums)
    stateList = stateList.filter(item => {
      return item.id !== FinancialRecordStateEnum.processing
    })
  } else if (+logType === +FinancialRecordLogTypeEnum.commission) {
    /** 手续费 */
    paramsObj = searchParams.commission
    recordTypeList =
      getStoreEnumsToOptions(assetsEnums.financialRecordTypeFeeList.enums) || FinancialRecordTypeCommissionList
    stateList = stateList.filter(item => {
      return item.id !== FinancialRecordStateEnum.processing
    })
    // } else if (+logType === +FinancialRecordLogTypeEnum.rebate) {
    //   /** 返佣 */
    //   paramsObj = searchParams.rebate
    //   recordTypeList = getStoreEnumsToOptions(assetsEnums.financialRecordTypeCommissionList.enums)
  } else if (+logType === +FinancialRecordLogTypeEnum.rebate) {
    /** 返佣 */
    paramsObj = searchParams.rebate
    recordTypeList = getStoreEnumsToOptions(assetsEnums.financialRecordTypeCommissionList.enums)
  } else if (+logType === +FinancialRecordLogTypeEnum.c2c) {
    /** c2c */
    paramsObj = searchParams.c2c
    recordTypeList = getStoreEnumsToOptions(assetsEnums.financialRecordTypeC2CList.enums)
  } else if (+logType === +FinancialRecordLogTypeEnum.derivative) {
    /** 衍生品 */
    paramsObj = searchParams.derivative
    recordTypeList = getStoreEnumsToOptions(assetsEnums.financialRecordTypeDerivativeList.enums)
  }

  return { paramsObj, stateList, recordTypeList }
}

/** 财务记录搜索 */
export function SearchItem({ onSearchFn, logType, searchParams, coinList }: SearchItemProps) {
  // 获取数据字典的财务记录状态，数据字典不存在时用本地枚举
  const { assetsEnums } = useAssetsStore()
  const pageContext = usePageContext()
  const coinName = pageContext?.urlParsed?.search?.coinName
  // const rebateTypeList = getStoreEnumsToOptions(assetsEnums.financialRecordRebateType.enums)
  // const agentModeList = getStoreEnumsToOptions(assetsEnums.financialRecordAgentTypeCode.enums)
  const currentTypeData = getCurrentTypeData(logType, assetsEnums, searchParams)
  const { stateList, paramsObj, recordTypeList } = { ...currentTypeData }

  const { coinId, status, type, rebateType, startDate, endDate, pageNum, pageSize } = paramsObj
  const Option = Select.Option
  // 默认查最近三个月数据
  // const defaultDate = [dayjs().subtract(3, 'month').format('YYYY-MM-DD'), dayjs()]
  // 默认查最近一周数据
  const defaultDate = [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
  const [dateTimeArr, setDateTimeArr] = useState<any>([dayjs(startDate), dayjs(endDate)])

  const [selectCoinId, setSelectCoinId] = useState(coinId || '')
  const [recordType, setRecordType] = useState<any>(Number(type) || '')
  const [state, setState] = useState(status || '')
  const [rebateTypeCd, setRebateTypeCd] = useState(rebateType || '')

  const { RangePicker } = DatePicker

  // 后面要调接口拿搜索结果，模拟假数据
  const onSearch = () => {
    const params = {
      type: recordType as any,
      coinId: selectCoinId,
      status: [state] as any,
      logType,
      pageNum: 1, // 每次搜索，显示第一页数据
      pageSize,
      startDate: new Date(dateTimeArr[0]).getTime(),
      endDate: new Date(dateTimeArr[1]).getTime(),
      rebateType: [rebateTypeCd] as any,
    }

    if (!state) {
      delete params.status
    }

    if (!recordType) {
      delete params.type
    } else {
      params.type = [recordType]
    }

    if (!rebateTypeCd) {
      delete params.rebateType
    }

    // 修改当前选中 tab 的接口入参信息
    searchParams = updateActiveSearchParams(logType, params, searchParams)

    onSearchFn(searchParams)
  }

  const onChangeCoin = val => {
    setSelectCoinId(val)
  }

  const onChangeType = val => {
    setRecordType(val)
  }

  const onChangeState = val => {
    setState(val)
  }

  const onChangeRebateType = val => {
    setRebateTypeCd(val)
  }

  /** 重置 */
  const onReset = () => {
    setSelectCoinId('')
    setRecordType('')
    setState('')
    setRebateTypeCd('')
    setDateTimeArr(defaultDate)

    Message.success(t`assets.financial-record.search.resetRemind`)
  }
  /** Select 自定义 render */
  const getDefaultCoinId = () => {
    if (!selectCoinId) return ''
    const item = coinList.filter(v => v.id === selectCoinId)

    return coinName && item.length === 0 ? coinName : selectCoinId
  }
  return (
    <div className={styles.scoped}>
      <div className="search-item">
        <div className="mb-filter-block">
          <span className="mr-2.5">{t`assets.financial-record.search.time`}</span>
          <RangePicker
            style={{ width: 240, height: 40 }}
            showTime
            defaultValue={defaultDate}
            value={dateTimeArr}
            format="YYYY-MM-DD"
            onOk={(valueString, value) => {
              setDateTimeArr(value)
            }}
            onSelect={(valueString, value) => {
              setDateTimeArr(value)
            }}
            disabledDate={current =>
              current.isAfter(dayjs()) || current.isBefore(dayjs().subtract(90, 'day').format('YYYY-MM-DD'))
            }
            clearRangeOnReselect
            allowClear={false}
          />
        </div>
        <div className="mb-filter-block">
          <span className="label-name">{t`features/user/personal-center/menu-navigation/index-1`}</span>
          <AssetSelect
            placeholder={t`features_assets_financial_record_search_form_index_2746`}
            value={getDefaultCoinId()}
            onChange={onChangeCoin}
            showSearch
            filterOption={(inputValue, option) =>
              option.props.coinName?.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0 ||
              option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
            }
          >
            <Option key="all" value="">
              {t`common.all`}
            </Option>
            {coinList &&
              coinList.map(
                option =>
                  option && (
                    <Option key={`coin_${option.id}`} value={option.id}>
                      {option.coinName}
                    </Option>
                  )
              )}
          </AssetSelect>
        </div>
        <div className="mb-filter-block">
          <span className="label-name">
            {+logType === +FinancialRecordLogTypeEnum.rebate
              ? t`features_assets_financial_record_search_form_index_taxmtgyk8i`
              : t`order.columns.type`}
          </span>
          <AssetSelect value={recordType} onChange={onChangeType}>
            <Option key="all" value="">
              {t`common.all`}
            </Option>
            {recordTypeList &&
              recordTypeList.map(
                option =>
                  option && (
                    <Option key={`type_${option.id}`} value={option.id}>
                      {option.value}
                    </Option>
                  )
              )}
          </AssetSelect>
        </div>
        {/* {+logType === +FinancialRecordLogTypeEnum.rebate && (
          <div className="mb-filter-block">
            <span className="label-name">代理模式</span>
            <AssetSelect value={rebateTypeCd} onChange={onChangeRebateType}>
              <Option key="all" value="">
                {t`common.all`}
              </Option>
              {agentModeList &&
                agentModeList.map(
                  option =>
                    option && (
                      <Option key={`state_${option.id}`} value={option.id}>
                        {option.value}
                      </Option>
                    )
                )}
            </AssetSelect>
          </div>
        )} */}
        {+logType !== +FinancialRecordLogTypeEnum.rebate && +logType !== +FinancialRecordLogTypeEnum.derivative && (
          <div className="mb-filter-block">
            <span className="label-name">{t`order.columns.status`}</span>
            <AssetSelect value={state} onChange={onChangeState}>
              <Option key="all" value="">
                {t`common.all`}
              </Option>
              {stateList &&
                stateList.map(
                  option =>
                    option && (
                      <Option key={`state_${option.id}`} value={option.id}>
                        {option.value}
                      </Option>
                    )
                )}
            </AssetSelect>
          </div>
        )}
        <div className="mb-filter-block">
          <Button
            className={'mr-4'}
            type="primary"
            onClick={() => onSearch()}
          >{t`assets.financial-record.search.search`}</Button>
          <Button onClick={() => onReset()}>{t`assets.financial-record.search.reset`}</Button>
        </div>
      </div>
    </div>
  )
}
