/**
 * 合约持仓 - 历史仓位 - 合约交易页用
 */
import { t } from '@lingui/macro'
import { decimalUtils } from '@nbit/utils'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { IncreaseTag } from '@nbit/react'
import { link } from '@/helper/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFuturesStore } from '@/store/futures'
import {
  checkPositionExistEntrustOrder,
  formatNumberByOffset,
  formatRatioNumber,
  calculatorUnrealizedProfit,
  calculatorProfit,
  calculatorProfitRatio,
} from '@/helper/assets/futures'
import { FuturesGuideIdEnum } from '@/constants/future/trade'
import { TradeMarketAmountTypesEnum } from '@/constants/trade'
import {
  AssetsTransferTypeEnum,
  EntrustOrderTypeInd,
  EntrustPlaceUnit,
  EntrustTypeEnum,
  FuturePositionDirectionEnum,
  FuturesAccountTypeEnum,
  FuturesAutoAddMarginTypeEnum,
  FuturesMarketUnitTypeEnum,
  FuturesOrderSideTypeEnum,
  FuturesPositionStatusTypeEnum,
  MoreOperateEnum,
  StopLimitStrategyTypeEnum,
  StopLimitTabEnum,
  getEntrustTypeEnumName,
} from '@/constants/assets/futures'
import Icon from '@/components/icon'
import { NoDataElement } from '@/features/orders/order-table-layout'
import { useUserStore } from '@/store/user'
import classNames from 'classnames'
import { Button, Message, Tooltip, Radio } from '@nbit/arco'
import { IPositionListData } from '@/typings/api/assets/futures/position'
import { AssetWsSubscribePageEnum, ErrorTypeEnum } from '@/constants/assets'
import { useContractPreferencesStore } from '@/store/user/contract-preferences'
import { useLockFn } from 'ahooks'
import {
  getPerpetualPositionMaxSizeLimit,
  getPerpetualPositionReverseInfo,
  getPerpetualPositionSymbolSize,
  postPerpetualOrdersPlace,
} from '@/apis/assets/futures/position'
import { UserContractVersionEnum } from '@/constants/user'
import AssetsPopupTips from '@/features/assets/common/assets-popup/assets-popup-tips'
import { getFuturesDetailPageRoutePath } from '@/helper/route/assets'
import AssetsFuturesTransfer from '@/features/assets/common/transfer/assets-futures-transfer'
import Decimal from 'decimal.js'
import { I18nsEnum } from '@/constants/i18n'
import { useCommonStore } from '@/store/common'
import { useFutureQuoteDisplayDigit } from '@/hooks/features/assets'
import styles from './index.module.css'
import AdjustPositionLeverModal from '../../adjust-position-lever-modal'
import ExitPositionEntrustModal from '../../exist-position-entrust-modal'
import { LockModal } from '../../lock-modal'
import { ClosePositionModal } from '../../close-position-modal'
import { MigrateModal } from '../../migrate-modal'
import { StopLimitModal } from '../../stop-limit-modal'
import FuturesBaseTag from '../../futures-info-tag/futures-base-tag'

const RadioGroup = Radio.Group

const SafeCalcUtil = decimalUtils.SafeCalcUtil
const formatCurrency = decimalUtils.formatCurrency
const formatNumberDecimal = decimalUtils.formatNumberDecimal
const removeDecimalZero = decimalUtils.removeDecimalZero
interface IFuturesListProps {
  loading?: boolean
  assetsListData: IPositionListData[] | undefined
  height?: number | string
  /** 组件使用页面：trade、other */
  fromPage?: string
  onSuccess?: (val?: any) => void
  accountType?: string
  onCloseAccount?: (val?: any) => void
}

enum PriceType {
  /** 最新价 */
  latestPrice = 'latestPrice',
  /** 标记价 */
  markPrice = 'markPrice',
}

export function FuturesPositionListView(props: IFuturesListProps) {
  const { locale, isMergeMode } = useCommonStore()
  const userStore = useUserStore()
  const rootRef = useRef<HTMLDivElement>(null)
  /** 持仓屏幕宽度适配，宽度 1100 以上展示 5 列，1100 和 860 之间 3 列，小于 720 展示 3 列 */
  const rootWidthData = [1100, 860]

  const {
    isLogin,
    userInfo: { isOpenContractStatus },
  } = userStore

  const { onSuccess, fromPage = AssetWsSubscribePageEnum.trade, accountType, onCloseAccount, assetsListData } = props
  const positionListFutures = assetsListData
  /** 合约偏好设置 */
  const { contractPreference } = useContractPreferencesStore()
  /** 专业版判断，合约版本：1，专业版，2，普通版 */
  const isProfessionalVersion = contractPreference?.perpetualVersion !== UserContractVersionEnum.base
  /** 开仓保证金来源设置，tradePanel 下单面板数据 */
  const { currentGroupOrderAssetsTypes, tradePanel } = useFuturesStore()
  /** 下单页输入框下拉计价单位 - 金额还是数量 eg usd / btc */
  const tradePairType = useMemo(() => {
    return tradePanel.tradeUnit
  }, [tradePanel.tradeUnit])
  const [maxWidth, setMaxWidth] = useState<number>()

  const assetsFuturesStore = useAssetsFuturesStore()
  const offset = useFutureQuoteDisplayDigit()
  /** 商户设置的计价币的法币精度和法币符号，USD 或 CNY 等 */
  const {
    futuresCurrencySettings: { currencySymbol },
    positionListLoading,
    updatePositionListLoading,
    updateFuturesTransferModal,
    futuresTransferModal,
  } = { ...assetsFuturesStore }
  /** 仓位保证金率 - 弹框 */
  const [visibleMarginRatioPrompt, setVisibleMarginRatioPrompt] = useState(false)
  /** 仓位保证金 - 弹框 */
  const [visiblePositionMarginPrompt, setVisiblePositionMarginPrompt] = useState(false)
  /** 未实现盈亏 - 弹框 */
  const [visibleNoProfitPrompt, setVisibleNoProfitPrompt] = useState(false)
  /** 开仓均价 - 弹框 */
  const [visibleOpenAveragePrompt, setVisibleOpenAveragePrompt] = useState(false)
  /** 调整杠杆 - 弹框 */
  const [visibleAdjustLeverModal, setVisibleAdjustLeverModal] = useState(false)
  /** 更多功能操作 - 弹框 */
  const [visibleMoreOperateModal, setVisibleMoreOperateModal] = useState(false)
  /** 更多功能选中/激活项 */
  const [activeMoreOperate, setActiveMoreOperate] = useState<MoreOperateEnum | undefined>()
  /** 仓位是否存在当前委托订单 */
  const [visibleExitEntrustOrderPrompt, setVisibleExitEntrustOrderPrompt] = useState(false)
  /** 调整杠杆 - 仓位是否存在当前委托订单 */
  const [errorMsgExitEntrustOrder, setErrorMsgExitEntrustOrder] = useState('')
  /** 一键反向 - 弹框确认 */
  const [visibleReverseConfirmPrompt, setVisibleReverseConfirmPrompt] = useState(false)
  /** 一键反向 - 开仓保证金余额不足 */
  const [visibleReverseMarginPrompt, setVisibleReverseMarginPrompt] = useState(false)
  /** 一键反向 - 超过最大持仓数量 */
  const [visibleReverseMaxAmountPrompt, setVisibleReverseMaxAmountPrompt] = useState(false)
  /** 一键反向 - loading */
  // const [reverseLoading, setReverseLoading] = useState(false)
  /** 一键反向 - 最大持仓限制 */
  const [maxPositionSizeData, setPositionSizeData] = useState<any>()
  /** 选中的仓位信息 */
  const [selectedPosition, setSelectedPosition] = useState<IPositionListData>()
  /** 保证金划转 */
  const [visibleTransfer, setVisibleTransfer] = useState(false)
  /** 止盈止损 tab 类型 */
  const [activeTabStopPL, setActiveTabStopPL] = useState(StopLimitTabEnum.stopLimit)
  /** 关闭更多功能事件 */
  const onSetVisibleActiveMoreOperate = val => {
    setVisibleMoreOperateModal(val)
    setActiveMoreOperate(undefined)
    setSelectedPosition(undefined)
    // onSuccess && onSuccess(val)
  }

  /** 保证金划转 */
  const [priceSelectType, setPriceTypeSelect] = useState<string>(PriceType.markPrice)

  /**
   * 计算当前持仓最新价下收益与收益率和仓位盈亏
   *
   */
  const getLatestPriceYielProfitAndLoss = assetsListDataItem => {
    const unrealizedProfit = `${calculatorUnrealizedProfit({
      ...assetsListDataItem,
      markPrice: assetsListDataItem?.latestPrice,
    })}`
    const profit = `${calculatorProfit({ ...assetsListDataItem, unrealizedProfit })}`
    const profitRatio = `${calculatorProfitRatio({ ...assetsListDataItem, profit })}`
    return { unrealizedProfit, profit, profitRatio }
  }

  const isNotMarkPrice = () => {
    return priceSelectType === PriceType.markPrice
  }

  /**
   * 一键反向 - 获取订单方向类型
   */
  const onGetSideInd = sideInd => {
    return (
      {
        [FuturePositionDirectionEnum.openSell]: FuturesOrderSideTypeEnum.openLong,
        [FuturePositionDirectionEnum.openBuy]: FuturesOrderSideTypeEnum.openShort,
      }[sideInd] || ''
    )
  }

  /**
   * 一键反向
   */
  const onReverse = useLockFn(async (record: IPositionListData) => {
    try {
      updatePositionListLoading(true)
      const { groupId = '', positionId = '', tradeId, lever, size, sideInd } = record || {}
      /** 开仓保证金来源，wallet 使用资产账户的资金开仓 group 使用当前合约组的额外保证金开仓 */
      const marginType = currentGroupOrderAssetsTypes
      setSelectedPosition(record)
      /** 获取币对详情，可迁移仓位数量 */
      const [reverseInfo, maxSizeLimit, positionSizeData] = await Promise.all([
        /** 获取反向开仓信息 */
        getPerpetualPositionReverseInfo({ groupId, positionId, marginType }),
        /** 获取币对最大可开仓数量 */
        getPerpetualPositionMaxSizeLimit({ tradeId, lever }),
        /** 获取币对持仓数量 */
        getPerpetualPositionSymbolSize({ tradeId, sideInd, lever }),
      ])

      // 接口异常时停止流程
      if (!reverseInfo.isOk || !maxSizeLimit.isOk || !positionSizeData.isOk) {
        updatePositionListLoading(false)
        Message.error({
          content: t`features_assets_futures_common_position_list_index_lvbcplbiwpirlz_zo1evb`,
          id: ErrorTypeEnum.uncategorizedError,
        })
        return
      }

      // 根据合约价格精度计算数量
      const newSize = removeDecimalZero(formatNumberDecimal(size, Number(record?.amountOffset)))

      /**
       * 检测保证金是否充足 - 反向开仓相同标的币、同杠杆倍数，保证金是否足够
       * 保证金足够的判断条件：标的币数量*（1+taker 手续费）*对手价 > 可用开仓保证金*杠杆倍数
       */
      /** 需要的保证金：标的币数量*（1+taker 手续费）*对手价 */
      const needMargin = Number(
        SafeCalcUtil.mul(
          SafeCalcUtil.mul(size, SafeCalcUtil.add(1, reverseInfo.data?.takerFeeRate)),
          reverseInfo.data?.opponentPrice
        )
      )
      /** 可用保证金：可用开仓保证金*杠杆倍数 */
      const availableMargin = Number(SafeCalcUtil.mul(reverseInfo.data?.availableOpenMargin, lever))

      if (needMargin > availableMargin) {
        setVisibleReverseMarginPrompt(true)
        onSetVisibleActiveMoreOperate(false)
        updatePositionListLoading(false)
        return
      }

      /**
       * 检测是否最大持仓数量判断，不可以反向：目标方向的持仓数量>最大持仓数量限制
       * 可反向条件：用户目标方向的持仓数量 <= 最大持仓数量限制
       */
      if (Number(positionSizeData.data?.size) > Number(maxSizeLimit.data?.maxSize)) {
        setVisibleReverseMaxAmountPrompt(true)
        onSetVisibleActiveMoreOperate(false)
        updatePositionListLoading(false)
        return
      }
      // 获取币对持仓数量
      setPositionSizeData(positionSizeData.data)

      const params = {
        groupId,
        tradeId: Number(tradeId),
        lever,
        size: String(newSize),
        additionalMargin: 0,
        // additionalMarginType: getFuturesAdditionalMarginType(contractPreference.marginSource),
        typeInd: EntrustOrderTypeInd.marketOrder,
        entrustTypeInd: EntrustTypeEnum.market,
        sideInd: onGetSideInd(sideInd),
        marketUnit: FuturesMarketUnitTypeEnum.quantity,
        placeUnit: EntrustPlaceUnit.base,
        marginType,
        autoAddMargin: FuturesAutoAddMarginTypeEnum.no,
        initMargin: +formatNumberDecimal(
          Number(SafeCalcUtil.div(SafeCalcUtil.mul(reverseInfo.data?.opponentPrice, newSize), lever)),
          Number(offset)
        ),
      }

      const res = await postPerpetualOrdersPlace(params)

      const { isOk, data, message = '' } = res || {}
      if (!isOk || !data) {
        // Message.info(message || t`features_assets_futures_common_position_list_index_5101539`)
        updatePositionListLoading(false)
        return
      }

      if (!data) {
        Message.error(message || t`features_assets_futures_common_position_list_index_5101539`)
        updatePositionListLoading(false)
        return
      }

      Message.success(t`features_assets_futures_common_position_list_index_5101540`)
      updatePositionListLoading(false)
      onSetVisibleActiveMoreOperate(false)
      onSuccess && onSuccess()
    } catch (error) {
      Message.error(t`features_assets_futures_common_position_list_index_5101539`)
      updatePositionListLoading(false)
    }
  })

  /** 撤销全部委托回调 */
  const onCancelEntrustCallBackFn = () => {
    setVisibleExitEntrustOrderPrompt(false)
    setErrorMsgExitEntrustOrder('')
    onSetVisibleActiveMoreOperate(false)
    onSuccess && onSuccess()
  }

  /** 点击调整杠杆 Icon */
  const onClickLeverIcon = useLockFn(async record => {
    const { groupId = '', positionId = '' } = (record as IPositionListData) || {}
    setSelectedPosition(record)
    //  锁仓中和存在委托订单时不能调整杠杆
    const isExist = await checkPositionExistEntrustOrder(groupId, positionId)
    // 仓位存在委托订单
    if (isExist) {
      setVisibleExitEntrustOrderPrompt(isExist)
      setErrorMsgExitEntrustOrder(t`features_assets_futures_common_position_list_index_wslnpf9bqfkvzy-jw9a0y`)
      updatePositionListLoading(false)
      return false
    }
    if (Number(record?.voucherAmount) > 0) {
      Message.error(t`features_assets_futures_common_position_cell_index_24kec67teh`)
      return
    }
    setVisibleAdjustLeverModal(true)
  })

  const handleTransferClick = (groupId: string, type: AssetsTransferTypeEnum) => {
    setVisibleTransfer(true)
    updateFuturesTransferModal({
      groupId,
      type,
    })
  }

  /** 划转回调 */
  const onTransferCallBackFn = async () => {
    setVisibleTransfer(false)
    onSuccess && onSuccess(true)
  }

  /** 更多功能菜单点击事件 */
  const onClickMenu = useLockFn(async (val, record) => {
    updatePositionListLoading(true)
    const { groupId = '', positionId = '', tradeId } = (record as IPositionListData) || {}
    setSelectedPosition(record)

    /** 是否锁仓状态 */
    if (val !== MoreOperateEnum.lock && record.statusCd === FuturesPositionStatusTypeEnum.locked) {
      Message.warning(t`features_assets_futures_common_position_list_index_5101572`)
      updatePositionListLoading(false)
      return false
    }

    /** 锁仓、迁移前 - 检测仓位是否存在委托订单 */
    if (val === MoreOperateEnum.migrate) {
      const isExist = await checkPositionExistEntrustOrder(groupId, positionId)
      // 仓位存在委托订单
      if (isExist) {
        setVisibleExitEntrustOrderPrompt(isExist)
        updatePositionListLoading(false)
        return false
      }
    }

    if (val === MoreOperateEnum.reverse) {
      setVisibleReverseConfirmPrompt(true)
    }
    updatePositionListLoading(false)
    // 重置止盈止损 tab
    setActiveTabStopPL(StopLimitTabEnum.stopLimit)
    setActiveMoreOperate(val)
    setVisibleMoreOperateModal(true)
  })

  /** 仓位止盈止损详情 */
  const getPositionProfitLossEntrustInfo = data => {
    let result = { stopLosTriggerPrice: '--', stopProfitTriggerPrice: '--' }
    if (!data || data.length === 0) return '--'
    if (data && data.length > 0) {
      const stopLessData = data.filter(item => {
        return item.strategyTypeInd === StopLimitStrategyTypeEnum.stopLoss
      })[0]

      const stopProfitData = data.filter(item => {
        return item.strategyTypeInd === StopLimitStrategyTypeEnum.stopProfit
      })[0]

      result.stopLosTriggerPrice = stopLessData?.triggerPrice
        ? formatNumberByOffset(stopLessData?.triggerPrice, Number(data.priceOffset))
        : '--'
      result.stopProfitTriggerPrice = stopProfitData?.triggerPrice
        ? formatNumberByOffset(stopProfitData?.triggerPrice, Number(data.priceOffset))
        : '--'
      return `${result.stopProfitTriggerPrice} / ${result.stopLosTriggerPrice}`
    }
  }

  /** 根据屏幕宽度适配，不同宽度列数不一样 */
  const getListClassNameByWidth = (index: number) => {
    let cssName = 'info-cell'
    if (!maxWidth) return cssName
    if (maxWidth < rootWidthData[0] && maxWidth >= rootWidthData[1]) {
      cssName += ' info-cell-forth'
      if ((index + 1) % 4 === 0) {
        cssName += ' line-last-info-cell'
      }
      return cssName
    }
    if (maxWidth < rootWidthData[1]) {
      cssName += ' info-cell-third'
      if ((index + 1) % 3 === 0) {
        cssName += ' line-last-info-cell'
      }
      return cssName
    }
    if ((index + 1) % 5 === 0) {
      cssName += ' line-last-info-cell'
      return cssName
    }
    return cssName
  }

  const isShowCoinUnit = () => {
    return !isMergeMode || fromPage === AssetWsSubscribePageEnum.trade
  }

  /** 根据下单页计价单位处理持仓数量 */
  const getPositionSize = (record: IPositionListData) => {
    const { size, latestPrice, amountOffset, baseSymbolName, quoteSymbolName } = record || {}
    // 计价单位为金额时持仓数量转化为法币展示，计价币数量=标的币数量*最新价
    if (tradePairType === TradeMarketAmountTypesEnum.funds) {
      const fundVal = SafeCalcUtil.mul(latestPrice, size)
      if (!isShowCoinUnit()) {
        return `${formatNumberByOffset(fundVal, Number(offset))}`
      }
      return `${formatNumberByOffset(fundVal, Number(offset))} ${quoteSymbolName}`
    }
    if (!isShowCoinUnit()) {
      return `${formatNumberByOffset(size, Number(amountOffset), false)}`
    }
    return `${formatNumberByOffset(size, Number(amountOffset), false)} ${baseSymbolName}`
  }

  useEffect(() => {
    const handleResize = () => {
      setMaxWidth(rootRef?.current?.offsetWidth)
    }

    const domWidth = rootRef?.current?.offsetWidth
    domWidth && setMaxWidth(domWidth)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [rootRef?.current?.clientWidth, positionListFutures?.length])

  if (!isLogin || !isOpenContractStatus || !positionListFutures || positionListFutures.length === 0)
    return (
      <div
        className={classNames(
          'flex justify-center flex-col items-center',
          {
            'h-full': fromPage === AssetWsSubscribePageEnum.trade,
          },
          {
            'mt-8': fromPage !== AssetWsSubscribePageEnum.trade,
          }
        )}
      >
        <NoDataElement
          isFuture
          loading={positionListLoading}
          noDataText={t`features_assets_futures_common_position_list_position_list_view_index_7nsq4knjmt`}
        />
        {accountType === FuturesAccountTypeEnum.immobilization && (
          <Button
            type="primary"
            className="close-account-btn"
            onClick={() => {
              onCloseAccount && onCloseAccount()
            }}
          >
            {t`features_assets_futures_common_position_list_position_list_view_index_hok4zjx4nd`}
          </Button>
        )}
      </div>
    )
  return (
    <div
      className={classNames(styles['futures-position-table'], {
        'arco-table-body-full': true,
        'auto-width': true,
        'no-data': positionListFutures?.length === 0,
      })}
      ref={rootRef}
    >
      <div className={styles['history-history-wrapper']}>
        {positionListFutures &&
          positionListFutures.map((item, index) => {
            const {
              symbol,
              typeInd,
              unrealizedProfit,
              profitLossEntrust,
              groupMargin,
              markPrice,
              lockRecord,
              realizedProfit,
              marginRatio,
              quoteSymbolName,
              openPrice,
              profitRatio,
              profit,
              lever,
              sideInd,
              tradeId,
              priceOffset,
              statusCd,
              groupName,
              groupId,
              liquidatePrice,
              webLogo,
              positionOccupyMargin,
            } = item || {}

            let positionInfo = [
              {
                label: isShowCoinUnit() ? (
                  <Tooltip
                    content={
                      <div className="tips-wrap">
                        {/* 当前持仓数量单位根据当前... */}
                        {t({
                          id: 'features_assets_futures_common_lock_modal_index_5101440',
                          values: { 0: currencySymbol },
                        })}
                      </div>
                    }
                  >
                    <span className="tips-text">{t`features_assets_futures_futures_detail_position_list_index_5101362`}</span>
                  </Tooltip>
                ) : (
                  <span>{t`features_assets_futures_futures_detail_position_list_index_5101362`}</span>
                ),
                value:
                  sideInd === FuturePositionDirectionEnum.openSell
                    ? `-${getPositionSize(item)}`
                    : getPositionSize(item),
              },
              {
                label: t`features/orders/order-columns/future-2`,
                value: (
                  <IncreaseTag
                    value={isNotMarkPrice() ? profit : getLatestPriceYielProfitAndLoss(item)?.profit}
                    delZero={false}
                    digits={offset}
                    isRound={false}
                    hasPrefix
                    kSign
                    right={isShowCoinUnit() ? <span className="ml-1">{quoteSymbolName}</span> : null}
                  />
                ),
              },
              {
                label: (
                  <Tooltip
                    className={styles['tips-wrap-losses-container']}
                    onVisibleChange={() => {
                      setSelectedPosition(item)
                      // setVisibleNoProfitPrompt(true)
                    }}
                    content={
                      <div className="tips-wrap-losses">
                        <div>
                          <div className="text-text_color_01 text-sm mb-1">{t`features_assets_futures_common_position_list_position_list_view_index_orscbu82jx`}</div>
                          <div className="text-xs text-text_color_01 mb-4">
                            {t`features_assets_futures_common_position_list_position_list_view_index_kwm3pyxhyb`}
                            <span className="text-brand_color">
                              {priceSelectType === PriceType.markPrice
                                ? t`future.funding-history.index-price.column.mark-price`
                                : t`constants_order_5101075`}
                            </span>
                            {t`features_trade_trade_futures_calculator_trade_futures_calculator_modal_index_lendhde0xvaf-keq4xlpt`}
                          </div>
                          <div className="pb-1 border-b border-b-line_color_02 border-dotted">
                            <RadioGroup
                              className="w-full"
                              value={priceSelectType}
                              onChange={e => {
                                setPriceTypeSelect(e)
                              }}
                            >
                              {[
                                { label: t`constants_order_5101075`, value: 'latestPrice' },
                                { label: t`future.funding-history.index-price.column.mark-price`, value: 'markPrice' },
                              ].map((radioitem, i) => (
                                <div key={i} className="mb-2">
                                  <div>
                                    <Radio value={radioitem.value}>
                                      {({ checked }) => {
                                        return (
                                          <div className="flex items-center">
                                            <Icon
                                              name={checked ? 'agreement_select' : 'agreement_unselect'}
                                              fontSize={16}
                                            />
                                            <div className="text-text_color_01 text-sm ml-2 mb-0.5">
                                              {radioitem.label}
                                            </div>
                                          </div>
                                        )
                                      }}
                                    </Radio>
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                          <div className="flex justify-between my-2">
                            <span>{t`features_assets_futures_common_position_list_index_5101463`}</span>
                            <span>
                              <IncreaseTag
                                value={
                                  isNotMarkPrice()
                                    ? SafeCalcUtil.add(unrealizedProfit, selectedPosition?.lockFees)
                                    : SafeCalcUtil.add(
                                        getLatestPriceYielProfitAndLoss(item)?.unrealizedProfit,
                                        selectedPosition?.lockFees
                                      )
                                }
                                digits={Number(offset)}
                                isRound={false}
                                kSign
                              />{' '}
                              {isShowCoinUnit() && currencySymbol}
                            </span>
                          </div>
                          {Number(selectedPosition?.lockFees) !== 0 && (
                            <div className="flex justify-between mb-1">
                              <span> {t`features_assets_futures_common_position_list_index_5101464`}</span>
                              <span>
                                <IncreaseTag
                                  value={
                                    Number(formatNumberDecimal(selectedPosition?.lockFees, offset)) > 0
                                      ? -Number(selectedPosition?.lockFees)
                                      : 0
                                  }
                                  digits={Number(offset)}
                                  isRound
                                  kSign
                                />{' '}
                                {isShowCoinUnit() && currencySymbol}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    }
                  >
                    <span className="tips-text">{t`features/orders/order-columns/holding-6`}</span>
                  </Tooltip>
                ),
                value: (
                  <>
                    <IncreaseTag
                      value={
                        isNotMarkPrice() ? unrealizedProfit : getLatestPriceYielProfitAndLoss(item)?.unrealizedProfit
                      }
                      digits={offset}
                      isRound={false}
                      hasPrefix
                      kSign
                      right={isShowCoinUnit() ? <span className="ml-1">{quoteSymbolName}</span> : null}
                    />
                    {/* <Icon
                      name="msg"
                      hasTheme
                      className="icon"
                      onClick={() => {
                        setSelectedPosition(item)
                        setVisibleNoProfitPrompt(true)
                      }}
                    /> */}
                  </>
                ),
              },
              {
                label: (
                  <span
                    className="tips-text"
                    onClick={() => {
                      setSelectedPosition(item)
                      setVisiblePositionMarginPrompt(true)
                    }}
                  >{t`features_assets_futures_common_position_list_position_list_view_index_q82wtnzavj`}</span>
                ),
                value: (
                  <div>
                    {formatNumberByOffset(positionOccupyMargin, Number(offset))} {isShowCoinUnit() && currencySymbol}
                    <Icon
                      name="position_transfer"
                      hasTheme
                      className="icon"
                      onClick={() => {
                        handleTransferClick(groupId, AssetsTransferTypeEnum.to)
                      }}
                    />
                  </div>
                ),
              },
              {
                label: t`future.funding-history.index-price.column.mark-price`,
                value: (
                  <div>
                    {formatNumberByOffset(markPrice, Number(priceOffset))} {isShowCoinUnit() && quoteSymbolName}
                  </div>
                ),
              },
              {
                label: t`features_assets_futures_futures_details_position_details_list_5101351`,
                value: (
                  <div>
                    {formatNumberByOffset(openPrice, Number(priceOffset))} {isShowCoinUnit() && quoteSymbolName}
                    {!!lockRecord && (
                      <Icon
                        name="msg"
                        hasTheme
                        className="icon"
                        onClick={() => {
                          setSelectedPosition(item)
                          setVisibleOpenAveragePrompt(true)
                        }}
                      />
                    )}
                  </div>
                ),
              },
              {
                label: (
                  <Tooltip
                    content={
                      <div className="tips-wrap">
                        <div>
                          {t`features/orders/order-columns/future-2`} = {t`features/orders/order-columns/holding-6`} +{' '}
                          {t`features_assets_futures_futures_details_position_details_list_5101358`}
                        </div>
                        <div>
                          {t`features/orders/order-columns/holding-5`} ={' '}
                          {t`features_assets_futures_common_position_list_index_5101460`} * 100%
                        </div>
                      </div>
                    }
                  >
                    {/* 收益率 */}
                    <span className="tips-text">{t`features/orders/order-columns/holding-5`}</span>
                  </Tooltip>
                ),
                value: (
                  <IncreaseTag
                    value={isNotMarkPrice() ? profitRatio : getLatestPriceYielProfitAndLoss(item)?.profitRatio}
                    digits={offset}
                    isRound={false}
                    needPercentCalc
                    hasPostfix
                  />
                ),
              },
              {
                label: t`features_assets_futures_futures_details_position_details_list_5101358`,
                value: (
                  <div>
                    {formatNumberByOffset(realizedProfit, Number(offset))} {isShowCoinUnit() && currencySymbol}
                  </div>
                ),
              },
              {
                label: t`features_assets_futures_futures_detail_position_list_index_5101365`,
                value: (
                  <div>
                    {`${formatRatioNumber(marginRatio)}%`}
                    <Icon
                      name="msg"
                      hasTheme
                      className="icon"
                      onClick={() => {
                        setSelectedPosition(item)
                        setVisibleMarginRatioPrompt(true)
                      }}
                    />
                  </div>
                ),
              },
              {
                label: (
                  <Tooltip
                    content={
                      <div className="tips-wrap">{t`features_assets_futures_common_position_list_index_5101462`}</div>
                    }
                  >
                    <span className="tips-text">
                      {t`features_assets_futures_futures_details_position_details_list_5101352`}
                    </span>
                  </Tooltip>
                ),
                value: (
                  <div>
                    {Number(liquidatePrice) > 0 ? (
                      <>
                        {formatNumberByOffset(
                          +formatNumberDecimal(
                            liquidatePrice,
                            +priceOffset,
                            sideInd === FuturePositionDirectionEnum.openSell
                              ? Decimal.ROUND_HALF_UP
                              : Decimal.ROUND_DOWN
                          ),
                          +priceOffset
                        )}{' '}
                        {isShowCoinUnit() && currencySymbol}
                      </>
                    ) : (
                      '--'
                    )}
                  </div>
                ),
              },
            ]

            if (maxWidth) {
              if (maxWidth < rootWidthData[0] && maxWidth >= rootWidthData[1]) {
                const newData = positionInfo.splice(4, 1)
                positionInfo.splice(8, 0, newData[0])
              }
              if (maxWidth < rootWidthData[1]) {
                const newData = positionInfo.splice(3, 2)
                positionInfo.splice(7, 0, newData[0], newData[1])
              }
            }
            return (
              <div key={`${tradeId}_${index}`} className="position-cell">
                <div
                  className="header-wrap"
                  // style={maxWidth ? { width: maxWidth } : undefined}
                >
                  <div className="position-info">
                    <FuturesBaseTag positionData={item} showLever={false} />
                    <div className="lever-tag-wrap">
                      <span>{lever}X</span>
                      {statusCd !== FuturesPositionStatusTypeEnum.locked && (
                        <Icon
                          className="edit-lever ml-1"
                          name="modify_icon"
                          fontSize={12}
                          onClick={e => {
                            onClickLeverIcon(item)
                            e.stopPropagation()
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {fromPage === AssetWsSubscribePageEnum.trade && (
                    <div
                      onClick={() => {
                        link(getFuturesDetailPageRoutePath(groupId))
                      }}
                    >
                      <span className="group-name">
                        {groupName} <Icon name="transaction_arrow_hover" />
                      </span>
                    </div>
                  )}
                </div>
                <div className="content-wrap">
                  {positionInfo.map((info, i) => {
                    return (
                      <div className={getListClassNameByWidth(i)} key={i}>
                        <div className={classNames('info-label', { 'info-label-en': locale === I18nsEnum['en-US'] })}>
                          {info.label}
                        </div>
                        <div className="info-content">{info.value}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="opt-wrap">
                  <div className="stop-pl">
                    {t`features_assets_futures_futures_detail_position_list_index_5101369`}
                    <span className="stop-pl-value">{getPositionProfitLossEntrustInfo(profitLossEntrust)}</span>
                    <Icon
                      name="contract_edit"
                      hasTheme
                      className="icon"
                      onClick={() => {
                        onClickMenu(MoreOperateEnum.stopLimit, item)
                        setActiveTabStopPL(StopLimitTabEnum.positionStopLimit)
                      }}
                    />
                  </div>
                  <div className="opt-item">
                    {isProfessionalVersion && (
                      <Button
                        type="secondary"
                        onClick={() => {
                          onClickMenu(MoreOperateEnum.migrate, item)
                        }}
                        className={classNames({
                          'is-disabled': statusCd === FuturesPositionStatusTypeEnum.locked,
                        })}
                      >{t`constants/assets/common-9`}</Button>
                    )}
                    <Button
                      type="secondary"
                      onClick={() => {
                        onClickMenu(MoreOperateEnum.stopLimit, item)
                      }}
                      className={classNames({
                        'is-disabled': statusCd === FuturesPositionStatusTypeEnum.locked,
                      })}
                    >{t`order.tabs.profitLoss`}</Button>
                    <Button
                      type="secondary"
                      onClick={() => {
                        onClickMenu(MoreOperateEnum.lock, item)
                      }}
                    >
                      {statusCd === FuturesPositionStatusTypeEnum.opened
                        ? t`constants_assets_futures_5101431`
                        : t`constants_assets_futures_5101530`}
                    </Button>
                    <Button
                      type="secondary"
                      onClick={() => {
                        onClickMenu(MoreOperateEnum.reverse, item)
                      }}
                      className={classNames({
                        'is-disabled': statusCd === FuturesPositionStatusTypeEnum.locked,
                      })}
                    >{t`features_assets_futures_futures_details_position_details_list_5101360`}</Button>
                    <Button
                      type={statusCd === FuturesPositionStatusTypeEnum.locked ? 'secondary' : 'primary'}
                      onClick={() => {
                        onClickMenu(MoreOperateEnum.close, item)
                      }}
                      id={FuturesGuideIdEnum.closingPosition}
                      className={classNames({
                        'is-disabled': statusCd === FuturesPositionStatusTypeEnum.locked,
                      })}
                    >{t`constants/assets/common-1`}</Button>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
      {/* 仓位保证金率详情 - 当前仓位保证金率、最低维持保证金率 */}
      {visibleMarginRatioPrompt && (
        <AssetsPopupTips
          visible={visibleMarginRatioPrompt}
          setVisible={setVisibleMarginRatioPrompt}
          popupTitle={t`features_assets_futures_futures_detail_position_list_index_5101365`}
          footer={null}
          slotContent={
            <div>
              <div>
                <div>
                  {t`features_assets_futures_futures_details_position_details_list_5101353`}
                  {formatRatioNumber(selectedPosition?.marginRatio)}%
                </div>
                <div>
                  {t`features_assets_futures_futures_details_position_details_list_5101354`}
                  {formatRatioNumber(selectedPosition?.maintMarginRatio)}%
                </div>
              </div>
              <div className="footer">
                <Button
                  type="primary"
                  onClick={() => {
                    setVisibleMarginRatioPrompt(false)
                  }}
                >
                  {t`features_trade_spot_index_2510`}
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* 仓位保证金 - 账户和仓位保证金 */}
      {visiblePositionMarginPrompt && (
        <AssetsPopupTips
          visible={visiblePositionMarginPrompt}
          setVisible={setVisiblePositionMarginPrompt}
          popupTitle={t`features/orders/order-columns/holding-3`}
          footer={null}
          slotContent={
            <div>
              <div>
                <div>
                  <span className="mr-4">{t`features_future_create_new_account_index_dlos4ynubu`}</span>
                  {formatNumberByOffset(selectedPosition?.groupMargin, Number(offset))}{' '}
                  {isShowCoinUnit() && currencySymbol}
                </div>
                <div>
                  <span className="mr-4">{t`features_assets_futures_common_position_list_position_list_view_index_q82wtnzavj`}</span>
                  {formatNumberByOffset(selectedPosition?.positionOccupyMargin, Number(offset))}{' '}
                  {isShowCoinUnit() && currencySymbol}
                  {Number(selectedPosition?.voucherAmount) > 0 &&
                    t({
                      id: 'features_assets_futures_common_position_cell_index_p0onx1r3zy',
                      values: {
                        0: `${formatNumberByOffset(selectedPosition?.voucherAmount, Number(offset))} ${
                          isShowCoinUnit() && currencySymbol
                        }`,
                      },
                    })}
                </div>
              </div>
              <div className="footer">
                <Button
                  type="primary"
                  onClick={() => {
                    setVisiblePositionMarginPrompt(false)
                  }}
                >
                  {t`features_trade_spot_index_2510`}
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* 未实现盈亏详情 - 仓位盈亏、锁仓利息 */}
      {visibleNoProfitPrompt && (
        <AssetsPopupTips
          visible={visibleNoProfitPrompt}
          setVisible={setVisibleNoProfitPrompt}
          popupTitle={t`features/orders/order-columns/holding-6`}
          footer={null}
          slotContent={
            <div>
              <div>
                <div>
                  {t`features_assets_futures_common_position_list_index_5101463`}
                  <IncreaseTag
                    value={selectedPosition?.unrealizedProfit}
                    digits={Number(offset)}
                    isRound={false}
                    kSign
                  />{' '}
                  {isShowCoinUnit() && currencySymbol}
                </div>
                <div>
                  {t`features_assets_futures_common_position_list_index_5101464`}
                  <IncreaseTag
                    value={
                      Number(formatNumberDecimal(selectedPosition?.lockFees, offset)) > 0
                        ? -Number(selectedPosition?.lockFees)
                        : 0
                    }
                    digits={Number(offset)}
                    isRound
                    kSign
                  />{' '}
                  {isShowCoinUnit() && currencySymbol}
                </div>
              </div>
              <div className="footer">
                <Button
                  type="primary"
                  onClick={() => {
                    setVisibleNoProfitPrompt(false)
                  }}
                >
                  {t`features_trade_spot_index_2510`}
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* 开仓均价详情 - 锁仓时价格、锁仓利息 */}
      {visibleOpenAveragePrompt && (
        <AssetsPopupTips
          visible={visibleOpenAveragePrompt}
          setVisible={setVisibleOpenAveragePrompt}
          popupTitle={t`features_assets_futures_futures_details_position_details_list_5101351`}
          footer={null}
          slotContent={
            <div>
              <div>
                <div>{t`features_assets_futures_common_position_list_index_5101465`}</div>
                <div>
                  {t`features_assets_futures_futures_details_position_details_list_5101356`}{' '}
                  <span className="text-brand_color">
                    {formatCurrency(
                      selectedPosition?.lockRecord?.lockPrice,
                      Number(selectedPosition?.priceOffset || 2)
                    )}{' '}
                    {isShowCoinUnit() && selectedPosition?.quoteSymbolName}
                  </span>
                </div>
                <div>
                  {t`features_assets_futures_common_position_list_index_5101464`}{' '}
                  <span className="text-brand_color">
                    {formatCurrency(selectedPosition?.lockRecord?.fees, offset, true)}{' '}
                    {isShowCoinUnit() && currencySymbol}
                  </span>
                </div>
              </div>
              <div className="footer">
                <Button
                  type="primary"
                  onClick={() => {
                    setVisibleOpenAveragePrompt(false)
                  }}
                >
                  {t`features_trade_spot_index_2510`}
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* 存在委托订单 */}
      {visibleExitEntrustOrderPrompt && selectedPosition && (
        <ExitPositionEntrustModal
          groupId={selectedPosition?.groupId}
          positionId={selectedPosition?.positionId}
          visible={visibleExitEntrustOrderPrompt}
          slotContent={errorMsgExitEntrustOrder}
          setVisible={() => {
            onCancelEntrustCallBackFn()
          }}
        />
      )}

      {/* 调整杠杆 */}
      {visibleAdjustLeverModal && selectedPosition && (
        <AdjustPositionLeverModal
          positionData={selectedPosition}
          visible={visibleAdjustLeverModal}
          setVisible={val => {
            setVisibleAdjustLeverModal(val)
            onSetVisibleActiveMoreOperate(val)
          }}
          onSuccess={() => {
            onSuccess && onSuccess()
          }}
        />
      )}

      {/* 锁仓 */}
      {activeMoreOperate === MoreOperateEnum.lock && selectedPosition && (
        <LockModal
          positionData={selectedPosition}
          visible={visibleMoreOperateModal}
          setVisible={onSetVisibleActiveMoreOperate}
          onSuccess={() => {
            onSuccess && onSuccess()
          }}
        />
      )}

      {/* 平仓 */}
      {activeMoreOperate === MoreOperateEnum.close && selectedPosition && (
        <ClosePositionModal
          positionData={selectedPosition}
          visible={visibleMoreOperateModal}
          setVisible={onSetVisibleActiveMoreOperate}
          onSuccess={() => {
            onSuccess && onSuccess()
          }}
        />
      )}

      {/* 迁移 */}
      {activeMoreOperate === MoreOperateEnum.migrate && selectedPosition && (
        <MigrateModal
          positionData={selectedPosition}
          visible={visibleMoreOperateModal}
          setVisible={onSetVisibleActiveMoreOperate}
          onSuccess={() => {
            onSuccess && onSuccess()
          }}
        />
      )}

      {/* 止盈止损 */}
      {activeMoreOperate === MoreOperateEnum.stopLimit && selectedPosition && (
        <StopLimitModal
          positionData={selectedPosition}
          type={activeTabStopPL}
          visible={activeMoreOperate === MoreOperateEnum.stopLimit}
          setVisible={onSetVisibleActiveMoreOperate}
          onSuccess={() => {
            onSuccess && onSuccess()
          }}
        />
      )}

      {/* 一键反向 - 弹框确认 */}
      {visibleReverseConfirmPrompt && (
        <AssetsPopupTips
          popupTitle={t`features_assets_futures_futures_details_position_details_list_5101360`}
          visible={visibleReverseConfirmPrompt}
          setVisible={setVisibleReverseConfirmPrompt}
          slotContent={
            <div>
              {t`features_assets_futures_common_position_list_index_89epzxl_zb86z2imwevna`}
              <span className="text-brand_color">{t`features_assets_futures_common_position_list_index_pjmgt0sw7618w0fmuhqm1`}</span>
              <div className="mt-2">
                <span>{t`features_assets_futures_common_position_list_index_l2nsh8rpp9`}</span>
                <span className="text-brand_color">{selectedPosition && getPositionSize(selectedPosition)}</span>
              </div>
              <div>
                <span>{t`features_assets_futures_common_position_list_index_lig_lfte8y`}</span>
                <span className="text-brand_color">{getEntrustTypeEnumName(EntrustTypeEnum.market)}</span>
              </div>
            </div>
          }
          onOk={() => {
            if (selectedPosition) {
              onReverse(selectedPosition)
            }
            setVisibleReverseConfirmPrompt(false)
          }}
          okText={t`features_user_login_index_5101198`}
        />
      )}

      {/* 一键反向 - 开仓保证金不足提示 */}
      {visibleReverseMarginPrompt && (
        <AssetsPopupTips
          visible={visibleReverseMarginPrompt}
          setVisible={setVisibleReverseMarginPrompt}
          slotContent={
            <>
              <div>{t`features_assets_futures_common_position_list_index_5101468`}</div>
              <div className="text-brand_color">{t`features_assets_futures_common_position_list_index_5101541`}</div>
            </>
          }
          onOk={() => {
            setVisibleReverseMarginPrompt(false)
          }}
          okText={t`features_trade_spot_index_2510`}
        />
      )}
      {/* 一键反向 - 超过最大持仓数量提示 */}
      {visibleReverseMaxAmountPrompt && (
        <AssetsPopupTips
          visible={visibleReverseMaxAmountPrompt}
          setVisible={setVisibleReverseMaxAmountPrompt}
          slotContent={
            <div>
              {/* 超过最大持仓数量 */}
              {t({
                id: 'features_assets_futures_common_position_list_index_5101542',
                values: { 0: maxPositionSizeData?.size, 1: selectedPosition?.baseSymbolName },
              })}
            </div>
          }
          onOk={() => {
            setVisibleReverseMaxAmountPrompt(false)
          }}
          okText={t`features_trade_spot_index_2510`}
        />
      )}
      {visibleTransfer && (
        <AssetsFuturesTransfer
          type={futuresTransferModal?.type}
          coinId={futuresTransferModal?.coinId}
          groupId={futuresTransferModal?.groupId}
          currencySymbol={currencySymbol}
          visible={visibleTransfer}
          setVisible={setVisibleTransfer}
          onSubmitFn={onTransferCallBackFn}
        />
      )}
    </div>
  )
}
