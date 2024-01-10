import { t } from '@lingui/macro'
import { BusinessSceneEnum, CouponTypeEnum } from '@/constants/welfare-center/coupon-select'

export default function CouponUseConditions({ useThreshold, coinSymbol, businessScene, couponType }) {
  // 使用场景 合约 现货 三元期权
  // 合约保险金 手续费 体验金
  const getText = () => {
    // 手续费
    if (couponType === CouponTypeEnum.fee) {
      /** 合约 */
      return {
        [BusinessSceneEnum.perpetual]: t`features_welfare_center_welfare_center_vnblogrie1`,
        [BusinessSceneEnum.spot]: t`constants/trade-4`,
      }[businessScene]
    }
    /** 合约体验金 */
    if (couponType === CouponTypeEnum.voucher && businessScene === BusinessSceneEnum.perpetual) {
      return t`features_trade_trade_amount_input_index_d9hiiaadxfjrwqkxvqmv4`
    }
    /** 保险金 */
    if (couponType === CouponTypeEnum.insurance) {
      return t`features/orders/details/modify-stop-limit-3`
    }
    /** 三元期权 */
    if (businessScene === BusinessSceneEnum.option) {
      return t`features_welfare_center_welfare_center_buf9ygx02g`
    }
  }
  return (
    <div>
      {getText() || t`features_welfare_center_common_coupon_select_coupon_cell_index_v_icm0diu9`} ≥ {useThreshold}
      {coinSymbol}
    </div>
  )
}
