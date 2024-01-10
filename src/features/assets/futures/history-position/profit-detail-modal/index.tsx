/**
 * 合约 - 历史仓位收益明细
 */
import { t } from '@lingui/macro'
import { Button } from '@nbit/arco'
import AssetsPopupTips from '@/features/assets/common/assets-popup/assets-popup-tips'
import { IPositionProfitInfoData } from '@/typings/api/assets/futures/position'
import { formatCurrency } from '@/helper/decimal'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { decimalUtils } from '@nbit/utils'

interface IProfitDetailModalProps {
  visible: boolean
  setVisible: (val: boolean) => void
  /** 收益信息 */
  profitData: IPositionProfitInfoData
  onSuccess?: (val?: any) => void
}

export function ProfitDetailModal(props: IProfitDetailModalProps) {
  const { visible, setVisible, profitData } = props || {}
  const { profit, insuranceDeductionAmount, voucherDeductionAmount } = profitData
  const SafeCalcUtil = decimalUtils.SafeCalcUtil

  const {
    futuresCurrencySettings: { currencySymbol, offset },
  } = { ...useAssetsFuturesStore() }

  const calcProfitAll = () => {
    const profitAll = SafeCalcUtil.sub(profit, SafeCalcUtil.add(insuranceDeductionAmount, voucherDeductionAmount))
    return formatCurrency(profitAll, Number(offset || 2))
  }
  return (
    <AssetsPopupTips
      visible={visible}
      setVisible={setVisible}
      popupTitle={t`features_assets_futures_history_position_profit_detail_modal_index_wo5fik1pj_`}
      footer={null}
      slotContent={
        <div>
          <div>
            <div>
              {t`features_assets_futures_history_position_profit_detail_modal_index_n1nsnmr00s`}
              <span className="text-sell_down_color">
                {calcProfitAll()} {currencySymbol}
              </span>
            </div>
            {Number(voucherDeductionAmount) > 0 && (
              <div>
                {t`features_assets_futures_history_position_profit_detail_modal_index_gxpgtrogcw`}
                <span>
                  {formatCurrency(voucherDeductionAmount, offset)} {currencySymbol}
                </span>
              </div>
            )}
            {Number(insuranceDeductionAmount) > 0 && (
              <div>
                {t`features_assets_futures_history_position_profit_detail_modal_index_qd5c2bkbip`}
                <span>
                  {formatCurrency(insuranceDeductionAmount, offset)} {currencySymbol}
                </span>
              </div>
            )}
          </div>
          <div className="footer">
            <Button
              type="primary"
              onClick={() => {
                setVisible(false)
              }}
            >
              {t`features_trade_spot_index_2510`}
            </Button>
          </div>
        </div>
      }
    />
  )
}
