/**
 * 期权持仓 - 视图
 */
import { t } from '@lingui/macro'
import { decimalUtils } from '@nbit/utils'
import { IncreaseTag } from '@nbit/react'
import { NoDataElement } from '@/features/orders/order-table-layout'
import { useUserStore } from '@/store/user'
import classNames from 'classnames'
import { I18nsEnum } from '@/constants/i18n'
import { useCommonStore } from '@/store/common'
import {
  OptionProductPeriodUnitEnum,
  OptionSideIndCallEnum,
  OptionSideIndEnum,
  OptionsOrderProfitTypeEnum,
  getOptionProductPeriodUnit,
} from '@/constants/ternary-option'
import { formatCurrency } from '@/helper/decimal'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { formatDate } from '@/helper/date'
import { IOptionCurrentPositionList } from '@/typings/api/ternary-option/position'
import { onGetPositionProfit } from '@/helper/ternary-option/position'
import LazyImage from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { useRef, useState } from 'react'
import { OptionOrder_Body } from '@/plugins/ws/protobuf/ts/proto/OptionOrder'
import Icon from '@/components/icon'
import styles from './index.module.css'
import OptionBaseInfo from '../position-base-info'
import OptionCountDown from '../option-count-down'
import { OpenAmountModal } from './open-amount-modal'

interface IOptionPositionListProps {
  loading?: boolean
  result?: OptionOrder_Body
}
export function OptionPositionListView(props: IOptionPositionListProps) {
  const { loading, result } = props
  const { orderId, profitValue, profitable } = result || {}
  const { locale, isMergeMode } = useCommonStore()
  const userStore = useUserStore()
  const { isLogin } = userStore
  const ternaryOptionStore = useTernaryOptionStore() || {}
  const { positionListOption, optionCurrencySetting } = { ...ternaryOptionStore }
  const coinName = optionCurrencySetting?.[0]
  const safeCalcUtil = decimalUtils.SafeCalcUtil
  const rootRef = useRef<HTMLDivElement>(null)
  const minWidth = locale === I18nsEnum['en-US'] ? 960 : 880
  const [visibleOpenAmountPrompt, setVisibleOpenAmountPrompt] = useState(false)
  /** 选中的仓位信息 */
  const [selectedPosition, setSelectedPosition] = useState<IOptionCurrentPositionList>()

  const getTargetTime = (targetDateTime: number) => {
    const timestamp = Number(safeCalcUtil.sub(targetDateTime, new Date().getTime()))
    const targetTimeData = timestamp > 0 ? timestamp : 0
    return targetTimeData
  }

  /** 根据屏幕宽度适配，展示不一样 */
  const getListClassNameByWidth = (index: number) => {
    let cssName = ''

    if (locale === I18nsEnum['en-US']) {
      if (index === 2 || index === 7) {
        cssName += 'info-cell-third-cols'
        return cssName
      }

      if (index === 3 || index === 8) {
        cssName += 'info-cell-forth-cols'
        return cssName
      }
    }

    if ((index + 1) % 5 === 0) {
      cssName = 'info-cell-last-cols'
      return cssName
    }
    return cssName
  }

  const getPositionInfo = (data: IOptionCurrentPositionList) => {
    const {
      sideInd,
      targetPrice,
      amount,
      createdByTime,
      periodDisplay,
      periodUnit,
      currentPrice,
      openPrice,
      realYield,
      settlementTime,
      profit = 0,
    } = data || {}
    // 剩余时间
    const targetDateTime = getTargetTime(settlementTime)

    const positionInfo = [
      {
        label: t`features_ternary_option_position_index_rwn0haj0ei`,
        value: (
          <div>
            {OptionSideIndCallEnum.includes(sideInd as OptionSideIndEnum) ? '>' : '<'}
            <span className="pl-0.5">{formatCurrency(targetPrice)}</span>
          </div>
        ),
      },
      {
        // 开仓金额
        label: t`features_ternary_option_historical_component_historical_table_index_zpakonnjw8`,
        value: (
          <div>
            <span>
              {formatCurrency(amount)} {coinName}
            </span>
            {Number(data?.voucherAmount) > 0 && (
              <Icon
                name="msg"
                hasTheme
                className="icon ml-1"
                onClick={() => {
                  setSelectedPosition(data)
                  setVisibleOpenAmountPrompt(true)
                }}
              />
            )}
          </div>
        ),
      },
      {
        label: t`features_ternary_option_position_position_list_view_index_ezyp6qnw9w`,
        value: (
          <IncreaseTag
            value={profit || onGetPositionProfit(data)}
            digits={2}
            isRound={false}
            hasPrefix
            kSign
            right={<span className="ml-1">{coinName}</span>}
          />
        ),
      },
      {
        label: t`features_assets_futures_history_position_trade_history_position_history_position_list_index_52_ns_x8rw`,
        value: <>{formatDate(createdByTime)}</>,
      },
      {
        label: t`features_ternary_option_position_index_grryygxxzd`,
        value: (
          <div>
            {periodDisplay}
            <span className="pl-1">{getOptionProductPeriodUnit(periodUnit as OptionProductPeriodUnitEnum)}</span>
          </div>
        ),
      },
      {
        label: t`future.funding-history.index-price.column.mark-price`,
        value: (
          <div
            className={classNames({
              '!text-sell_down_color': currentPrice && +currentPrice < +targetPrice,
              '!text-buy_up_color': currentPrice && +currentPrice > +targetPrice,
              '!text-text_color_01': currentPrice && +currentPrice === +targetPrice,
            })}
          >
            {formatCurrency(currentPrice)}
          </div>
        ),
      },
      {
        label: t`features_trade_trade_futures_calculator_trade_futures_calculator_modal_index_jmb2ti2bfkmozbyyzwaix`,
        value: <div>{formatCurrency(openPrice)}</div>,
      },
      {
        label: isMergeMode
          ? t`features_ternary_option_trade_form_index_ws9rgn5jlq`
          : t`features/orders/order-columns/holding-5`,
        value: (
          <IncreaseTag
            value={isMergeMode ? decimalUtils.SafeCalcUtil.add(realYield, 1) : realYield}
            digits={isMergeMode ? 4 : 2}
            isRound={false}
            needPercentCalc
            hasPostfix={!isMergeMode}
          />
        ),
      },
      {
        label: t`features_agent_agency_center_revenue_details_index_5101520`,
        value: <>{formatDate(settlementTime)}</>,
      },
      {
        label: t`features_ternary_option_position_index_gf8qrjaubw`,
        value: (
          <div>
            {Number(targetDateTime) > 0 ? (
              <OptionCountDown targetDateTime={targetDateTime} />
            ) : (
              <span className="text-brand_color">{t`features_ternary_option_position_option_position_list_index_q8i4ga15hj`}</span>
            )}
          </div>
        ),
      },
    ]
    return positionInfo
  }

  if (!isLogin || !positionListOption?.length) {
    return (
      <div className={styles['option-position-no-data']}>
        <NoDataElement
          loading={loading}
          noDataText={t`features_assets_futures_common_position_list_position_list_view_index_7nsq4knjmt`}
        />
      </div>
    )
  }

  return (
    <div
      className={classNames(styles['option-position-list-wrap'], {
        'arco-table-body-full': true,
        'auto-width': true,
        'no-data': positionListOption?.length === 0,
      })}
      ref={rootRef}
    >
      <div
        className={styles['position-list-wrapper']}
        style={
          rootRef?.current?.offsetWidth && rootRef?.current?.offsetWidth < minWidth ? { width: minWidth } : undefined
        }
      >
        {positionListOption?.map(item => {
          const isProfit = Number(profitable) === OptionsOrderProfitTypeEnum.profit
          return (
            <div key={item?.id}>
              <div className="position-cell">
                <div
                  className={classNames('position-content-wrap', { 'hide-item': String(orderId) === String(item?.id) })}
                >
                  <div className="header-wrap">
                    <div className="position-info">
                      <OptionBaseInfo positionData={item} />
                    </div>
                  </div>
                  <div className="content-wrap">
                    {getPositionInfo(item)?.map((info, i) => {
                      return (
                        <div className={classNames('info-cell', getListClassNameByWidth(i))} key={`${item?.id}_${i}`}>
                          <div className={classNames('info-label', { 'info-label-en': locale === I18nsEnum['en-US'] })}>
                            {info?.label}
                          </div>
                          <div className="info-content">{info?.value}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* 盈亏动效 */}
                {String(orderId) === String(item?.id) && (
                  <div
                    className={classNames('result-wrap', {
                      profit: isProfit,
                      loss: !isProfit,
                    })}
                  >
                    <LazyImage
                      src={`${oss_svg_image_domain_address}option/${
                        isProfit ? 'icon_position_result_profit' : 'icon_position_result_loss'
                      }.png`}
                      className="result-img"
                    />
                    <div className="result-title">
                      {isProfit
                        ? t`features_ternary_option_position_position_list_view_index_drziyug1wq`
                        : t`features_ternary_option_position_position_list_view_index__fuge5_nip`}
                    </div>
                    <div className="result-text">
                      {`${
                        isProfit
                          ? t`features/orders/details/modify-stop-limit-2`
                          : t`features/orders/details/modify-stop-limit-3`
                      } ${formatCurrency(profitValue)} ${coinName} `}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {/* 开层金额详情 */}
      {visibleOpenAmountPrompt && selectedPosition && (
        <OpenAmountModal
          visible={visibleOpenAmountPrompt}
          setVisible={setVisibleOpenAmountPrompt}
          data={selectedPosition}
        />
      )}
    </div>
  )
}
