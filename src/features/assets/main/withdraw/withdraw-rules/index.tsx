/**
 * 提币规则
 */
import { t } from '@lingui/macro'
import { IWithdrawCoinInfoResp } from '@/typings/api/assets/assets'
import { WithDrawTypeEnum } from '@/constants/assets'
import { formatCurrency } from '@/helper/decimal'
import styles from './index.module.css'

interface IRulesData {
  /** 提币类型 */
  withdrawType: WithDrawTypeEnum | undefined
  /** 提币名称 */
  coinName: string
  /** 币种符号 */
  symbol: string
  /** 提币数量 */
  count: number | string
  /** 提币其他信息 */
  withdrawInfo: IWithdrawCoinInfoResp
}

export function WithdrawRules({ rulesData }: { rulesData: IRulesData }) {
  const { coinName = '--' } = rulesData
  const {
    minAmount = '--',
    dayMaxWithdrawAmount,
    remainingWithdrawalAmount,
    availableAmount = '--',
  } = rulesData.withdrawInfo || {}

  const confirmList = [
    {
      label: t`features_assets_main_withdraw_withdraw_rules_index_ttxl7pbnde`,
      value:
        +remainingWithdrawalAmount === -1 || !Number(dayMaxWithdrawAmount)
          ? '-- USD'
          : `${formatCurrency(remainingWithdrawalAmount, 2, false, true) || '--'} / ${
              formatCurrency(dayMaxWithdrawAmount, 2, false, true) || '--'
            } USD`,
    },
    {
      label: t`features_trade_trade_setting_futures_automatic_margin_call_index_5101364`,
      value: `${Number(dayMaxWithdrawAmount) ? formatCurrency(availableAmount) : '--'} ${coinName}`,
    },
  ]

  return (
    <div className={styles['withdraw-rule']}>
      <div className="confirm-wrap">
        {confirmList.map((item, i: number) => {
          return (
            <div key={i} className="confirm-item">
              <div className="label">{item.label}</div>
              <div className="value">{item.value}</div>
            </div>
          )
        })}
      </div>
      <p>
        - {t`assets.withdraw.minWithdrawCount`} {minAmount} {coinName}
      </p>
      <p>
        <span>- </span>
        {t`features/assets/main/withdraw/withdraw-rules/index-2`}
      </p>
      <p>- {t`features/assets/main/withdraw/withdraw-rules/index-3`}</p>
    </div>
  )
}
