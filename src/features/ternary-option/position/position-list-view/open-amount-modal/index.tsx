/**
 * 开仓金额详情弹框
 */
import { t } from '@lingui/macro'
import { Button } from '@nbit/arco'
import AssetsPopupTips from '@/features/assets/common/assets-popup/assets-popup-tips'
import { formatCurrency } from '@/helper/decimal'
import { IOptionCurrentPositionList } from '@/typings/api/ternary-option/position'
import { formatAssetInfo } from '@/helper/assets/futures'

interface IProfitDetailModalProps {
  visible: boolean
  setVisible: (val: boolean) => void
  /** 收益信息 */
  data: IOptionCurrentPositionList
  onSuccess?: (val?: any) => void
}

export function OpenAmountModal(props: IProfitDetailModalProps) {
  const { visible, setVisible, data } = props || {}
  const { amount, voucherAmount, coinSymbol } = data

  return (
    <AssetsPopupTips
      visible={visible}
      setVisible={setVisible}
      popupTitle={t`features_ternary_option_historical_component_historical_table_index_zpakonnjw8`}
      footer={null}
      slotContent={
        <div>
          <div>
            <div>
              <span className="mr-4">{t`features_ternary_option_historical_component_historical_table_index_zpakonnjw8`}</span>
              {formatCurrency(amount)} {coinSymbol}
              {Number(voucherAmount) > 0 &&
                t({
                  id: 'features_assets_futures_common_position_cell_index_p0onx1r3zy',
                  values: { 0: formatAssetInfo(voucherAmount, coinSymbol) },
                })}
            </div>
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
