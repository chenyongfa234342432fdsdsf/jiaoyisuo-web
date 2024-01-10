/**
 * 合约组详情 - 资产数据占比图表
 */
import { useState, useEffect, useRef } from 'react'
import { Button, Message, Trigger } from '@nbit/arco'
import Icon from '@/components/icon'
import classNames from 'classnames'
import { t } from '@lingui/macro'
import {
  FuturesChartDataTypeEnum,
  getFuturesChartDataTypeEnumName,
  FuturesChartDataTypeEnumList,
  FuturePositionDirectionEnum,
  getFuturePositionDirectionEnumName,
  getFuturesAccountTypeColor,
  FuturesAccountTypeEnum,
} from '@/constants/assets/futures'
import { link } from '@/helper/link'
import { useDefaultFuturesUrl } from '@/helper/market'
import { useFuturesStore } from '@/store/futures'
import { getTradeFuturesRoutePathWithGroupId } from '@/helper/route/trade'
import { FuturesIntro } from '@/features/trade/futures/futures-intro'
import { FuturesGuideIdStepsEnum, fixedNodeGuideIdIntroList } from '@/constants/future/trade'
import { GroupDetailMarginCoin, GroupDetailPositionAsset } from '@/typings/api/assets/futures'
import { decimalUtils } from '@nbit/utils'
import { formatNumberDecimal, formatCurrency } from '@/helper/decimal'
import ListEmpty from '@/components/list-empty'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { useContractPreferencesStore } from '@/store/user/contract-preferences'
import { UserContractVersionEnum, UserEnableEnum } from '@/constants/user'
import AssetsPopupTips from '@/features/assets/common/assets-popup/assets-popup-tips'
import { getTextFromStoreEnums } from '@/helper/store'
import { postPerpetualModifyAccountType } from '@/apis/assets/futures/common'
import { AssetsDictionaryTypeEnum } from '@/constants/assets'
import { usePageContext } from '@/hooks/use-page-context'
import { useCommonStore } from '@/store/common'
import { useFutureQuoteDisplayDigit } from '@/hooks/features/assets'
import { PieChart } from './pie-chart'
import styles from './index.module.css'
import AutoAddMarginSetting from '../auto-add-margin'
import AccountTypeSelect from '../accout-type-select'

const SafeCalcUtil = decimalUtils.SafeCalcUtil

type IDropdownCellsProps = {
  onClickMenu?: (v) => void
  activeTypeId: number
}
function DropdownCells({ onClickMenu, activeTypeId }: IDropdownCellsProps) {
  const onClick = values => {
    onClickMenu && onClickMenu(values)
  }
  return (
    <div className={styles['menu-cells']}>
      {FuturesChartDataTypeEnumList.map(v => (
        <div className="cell" key={v.id} onClick={() => onClick(v.id)}>
          <div className="cell-wrap">
            <span
              className={classNames({
                'is-selected': Number(activeTypeId) === Number(v.id),
              })}
            >
              {getFuturesChartDataTypeEnumName(v.id)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AccountTypeDropdownCells({
  onClickAccountType,
  accountType,
}: {
  onClickAccountType?: (v) => void
  accountType: FuturesAccountTypeEnum
}) {
  const { futuresEnums } = useAssetsFuturesStore()
  const accountTypeList = futuresEnums.perpetualAccountTypeEnum.enums
  const onClick = values => {
    onClickAccountType && onClickAccountType(values)
  }
  return (
    <div className={styles['menu-cells']}>
      {accountTypeList.map(v => (
        <div className="cell" key={v.value} onClick={() => onClick(v.value)}>
          <div className="cell-wrap">
            <span
              className={classNames({
                'is-selected': Number(accountType) === Number(v.value),
              })}
            >
              {v.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 饼图图例
 * @param data 图表数据
 * @param type 图表数据类型 - 不同类型展示不同
 * @param direction 做多或做空
 * @returns
 */
function LegendRender({ data, type, baseCoin, offset = 2 }) {
  const { isMergeMode } = useCommonStore()
  const showTag = type === FuturesChartDataTypeEnum.positionRiskScale
  return (
    <div className="pie-legend">
      {data &&
        data.map((pieItem, index: number) => {
          return (
            <div key={index} className="legend">
              <div className="legend-header">
                <div className="legend-icon" style={{ background: pieItem.color }} />
                <span className="legend-title">
                  {pieItem.label && pieItem.label === 'other' ? t`constants_assets_index_2560` : pieItem.label}
                </span>
                {formatCurrency(pieItem.value, offset)} {!isMergeMode && baseCoin}
                {showTag && (
                  <div
                    className={classNames('direction-tag', {
                      'bg-sell_down_color_special_02': pieItem.sideInd === FuturePositionDirectionEnum.openSell,
                      'text-sell_down_color': pieItem.sideInd === FuturePositionDirectionEnum.openSell,
                      'bg-buy_up_color_special_02': pieItem.sideInd === FuturePositionDirectionEnum.openBuy,
                      'text-buy_up_color': pieItem.sideInd === FuturePositionDirectionEnum.openBuy,
                    })}
                  >
                    {getFuturePositionDirectionEnumName(pieItem.sideInd)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}

interface ITotalAssetsProps {
  // assetsData: FuturesGroupDetailResp | undefined
  baseCoin: string
  /** 可用保证金 */
  marginAvailable: string // 合约组可用保证金
  /** 仓位保证金 */
  positionMargin: string
  /** 开仓冻结保证金 */
  openLockAsset: string
  /** 保证金币种信息 */
  marginCoin: GroupDetailMarginCoin[]
  /** 持仓风险占比 */
  positionAsset: GroupDetailPositionAsset[]
}
export function AssetsChart({ onAutoAddMargin }: { onAutoAddMargin: () => void }) {
  const pageContext = usePageContext()
  const { groupId } = pageContext.routeParams
  const futuresLink = useDefaultFuturesUrl()
  const assetsFuturesStore = useAssetsFuturesStore()
  const { contractPreference } = useContractPreferencesStore()
  const offset = useFutureQuoteDisplayDigit()
  const {
    futuresDetailsChartData,
    // futuresCurrencySettings: { offset },
  } = { ...assetsFuturesStore }
  const { currentIntroId, futureEnabled, setFutureEnabled, setCurrentIntroId } = useFuturesStore()
  const introRef = useRef<any>(null)
  const [pieChartData, setPieChartData] = useState<any>()
  const {
    baseCoin = '',
    groupAsset = '',
    /** 可用保证金 */
    marginAvailable = '',
    /** 仓位保证金 */
    positionMargin = '',
    /** 开仓冻结保证金 */
    openLockAsset = '',
    marginCoin = [],
    positionAsset = [],
    accountType = FuturesAccountTypeEnum.temporary,
  } = {
    ...futuresDetailsChartData,
  }

  /** 触发弹框展示状态 */
  const [popupVisible, setPopupVisible] = useState(false)
  const [visibleAccountTypeList, setVisibleAccountTypeList] = useState(false)
  const [visibleAccountTypeIntro, setVisibleAccountTypeIntro] = useState(false)
  const defaultType = FuturesChartDataTypeEnum.assetScale
  const [activeType, setActiveType] = useState(defaultType)
  const [totalValue, setTotalValue] = useState(0)
  const [totalPercent, setTotalPercent] = useState(0)

  const colorList = ['#6195F6', '#61C1F6', '#61DEF6', '#7B61F6', '#4E65E4']

  const onChangeAccountType = async type => {
    if (type === accountType) return
    const res = await postPerpetualModifyAccountType({
      groupId,
      accountType: type,
    })

    const { isOk, data } = res || {}
    if (!isOk || !data || !data?.isSuccess) return
    Message.info(t`features/user/personal-center/settings/converted-currency/index-0`)
  }

  /** 图表总计数据 */
  const onTotalStatistics = data => {
    let newTotal = 0
    if (!data) return newTotal
    for (let index = 0; index < data.length; index += 1) {
      newTotal = +SafeCalcUtil.add(newTotal, Number(data[index]?.value))
    }
    return newTotal
  }

  /** 计算资产占比图表数据 */
  const calcPercent = (num: string | number, _total: number, pieData) => {
    if (!Number(num) || !Number(_total)) {
      return 0
    }
    // 兼容占比区间为（0%-1%）则展示为 1% ，占比区间为（99-100%）则展示为 99%
    let percent = Math.round(+SafeCalcUtil.mul(SafeCalcUtil.div(num, _total), 100))
    if (pieData.length > 1) {
      percent = Math.max(1, Math.min(99, +percent))
    }
    return percent
  }

  /** 设置饼图数据源 */
  const onSetPieData = data => {
    const totalVal = onTotalStatistics(data)
    if (!data.length) {
      setTotalValue(0)
      setPieChartData([])
      setTotalPercent(0)
      return
    }

    let totalPercentVal = 0
    for (let index = 0; index < data.length; index += 1) {
      const percent = calcPercent(data[index].value, totalVal, data)
      data[index].percent = percent
      totalPercentVal = +SafeCalcUtil.add(totalPercentVal, percent)
      if (index === data.length - 1) {
        setTotalValue(totalVal)
        setPieChartData(data)
        setTotalPercent(totalPercentVal)
      }
    }
  }
  /** 资金占比 */
  let assetChartData = [] as any
  const marginAvailableVal = formatNumberDecimal(marginAvailable, offset)
  if (Number(marginAvailableVal) !== 0) {
    assetChartData.push({
      id: t`features_assets_futures_common_migrate_modal_index_5101344`,
      label: t`features_assets_futures_common_migrate_modal_index_5101344`,
      value: marginAvailableVal,
      color: '#6195F6',
    })
  }

  const positionMarginVal = formatNumberDecimal(positionMargin, offset)
  if (Number(positionMarginVal) !== 0) {
    assetChartData.push({
      id: t`features/assets/futures/futuresList/index-3`,
      label: t`features/assets/futures/futuresList/index-3`,
      value: positionMarginVal,
      color: '#61C1F6',
    })
  }

  const openLockAssetVal = formatNumberDecimal(openLockAsset, offset)
  if (Number(openLockAssetVal) !== 0) {
    assetChartData.push({
      id: t`features_assets_futures_index_total_assets_index_g5e9brvddw9m8lxs1szf8`,
      label: t`features_assets_futures_index_total_assets_index_g5e9brvddw9m8lxs1szf8`,
      value: formatNumberDecimal(openLockAsset, offset),
      color: '#61DEF6',
    })
  }

  /** 保证金占比 */
  const depositChartData =
    marginCoin &&
    marginCoin.map((item: GroupDetailMarginCoin, index: number) => {
      return {
        ...item,
        id: item.coinName,
        label: item.coinName,
        value: formatNumberDecimal(item.coinConvert, offset),
        color: colorList[index],
      }
    })

  /** 持仓资产风险占比 */
  const assetRiskChartData =
    positionAsset &&
    positionAsset.map((item: GroupDetailPositionAsset, index: number) => {
      return {
        ...item,
        id: item.coinName,
        label: item.coinName,
        value: formatNumberDecimal(item.nominalValue, offset),
        color: colorList[index],
      }
    })

  const onClickMenu = values => {
    setActiveType(values)
    setPopupVisible(false)
    switch (values) {
      case FuturesChartDataTypeEnum.assetScale:
        onSetPieData(assetChartData)
        break
      case FuturesChartDataTypeEnum.depositScale:
        onSetPieData(depositChartData)
        break
      case FuturesChartDataTypeEnum.positionRiskScale:
        onSetPieData(assetRiskChartData)
        break
      default:
        break
    }
  }

  /** 新手教程* */
  const onCloseFuturesIntro = () => {
    if (currentIntroId < FuturesGuideIdStepsEnum.profit) {
      link(futuresLink)
      setCurrentIntroId(FuturesGuideIdStepsEnum.none)
    }
    setFutureEnabled(false)
  }

  const onFuturesIntroRef = refs => {
    introRef.current = refs
  }

  const onFuturesIntroBeforeChange = (num: number) => {
    setCurrentIntroId(num)
    if (num === FuturesGuideIdStepsEnum.profit) {
      setFutureEnabled(false)
      return false
    }
    if (fixedNodeGuideIdIntroList?.includes(num)) {
      introRef?.current?.updateStepElement?.(num)
    }
  }

  useEffect(() => {
    currentIntroId === FuturesGuideIdStepsEnum.show && setFutureEnabled(true)
  }, [])

  useEffect(() => {
    introRef?.current?.updateStepElement?.(FuturesGuideIdStepsEnum.show)
  }, [introRef])

  useEffect(() => {
    activeType && onClickMenu(activeType)
  }, [marginAvailable, positionMargin, openLockAsset, activeType])

  return (
    <div className={styles.scoped}>
      <div className="chart-title">
        <div className="trigger-wrapper">
          {Number(groupAsset) !== 0 && (
            <Trigger
              popup={() => <DropdownCells activeTypeId={activeType} onClickMenu={v => onClickMenu(v)} />}
              onVisibleChange={setPopupVisible}
              popupVisible={popupVisible}
            >
              {getFuturesChartDataTypeEnumName(activeType)}
              <Icon className="icon" name="arrow_open" hasTheme onClick={() => setPopupVisible(true)} />
            </Trigger>
          )}
        </div>
        <div className="flex items-end">
          <div className="flex">
            <AccountTypeSelect isSearch={false} accountType={accountType} onCallback={v => onChangeAccountType(v)} />
            <Icon name="msg" className="ml-2" hasTheme onClick={() => setVisibleAccountTypeIntro(true)} />
          </div>
          {/* 自动追加保证金 */}
          {contractPreference.perpetualVersion === UserContractVersionEnum.professional &&
            contractPreference.isAutoAdd === UserEnableEnum.yes && (
              <div className="items-end ml-6">
                <AutoAddMarginSetting onAutoAddMargin={onAutoAddMargin} />
              </div>
            )}
        </div>
      </div>
      {Number(groupAsset) !== 0 && (
        <div className="chart-wrap">
          {Number(totalValue) > 0 && (
            <>
              <div className="pie-wrap">
                <PieChart data={pieChartData} totalPercent={totalPercent} />
              </div>
              <LegendRender data={pieChartData} baseCoin={baseCoin} type={activeType} offset={offset} />
            </>
          )}
          {Number(totalValue) === 0 && (
            <div className="h-full">
              <div className="pie-wrap">
                <div className="no-data-wrap">
                  <svg width="100%" height="160px">
                    <circle cx="90" cy="90" r="40" fill="none" stroke="var(--bg_button_disabled)" strokeWidth="30" />
                    <circle cx="90" cy="90" r="24" fill="none" stroke="var(--card_bg_color_02)" strokeWidth="3" />
                  </svg>
                  <p className="no-data">{t`trade.c2c.noData`}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 账户类型说明 */}
      {visibleAccountTypeIntro && (
        <AssetsPopupTips
          popupTitle={t`features_assets_futures_index_futures_list_index_057lv_wqnq`}
          visible={visibleAccountTypeIntro}
          setVisible={setVisibleAccountTypeIntro}
          footer={null}
          slotContent={
            <div>
              <p className="text-text_color_01 font-medium">{t`constants_assets_futures_saocyqoip_`}</p>
              <p className="text-text_color_02">{t`features_assets_futures_futures_detail_assets_chart_index_0ohqpnm__m`}</p>
              <p className="mt-2 text-text_color_01 font-medium">{t`constants_assets_futures_fzwxymch87`}</p>
              <p className="text-text_color_02">
                {t`features_assets_futures_futures_detail_assets_chart_index_zgh3bjw0xa`}{' '}
                {t`features_assets_futures_futures_detail_assets_chart_index_idgqx6imm2`}
              </p>
              <div className="footer">
                <Button
                  type="primary"
                  onClick={() => {
                    setVisibleAccountTypeIntro(false)
                  }}
                >
                  {t`features_trade_spot_index_2510`}
                </Button>
              </div>
            </div>
          }
        />
      )}
      {currentIntroId >= FuturesGuideIdStepsEnum.show && futureEnabled && (
        <FuturesIntro
          visible={futureEnabled}
          onExit={onCloseFuturesIntro}
          onIntroRef={onFuturesIntroRef}
          onIntroBeforeChange={onFuturesIntroBeforeChange}
        />
      )}
    </div>
  )
}
