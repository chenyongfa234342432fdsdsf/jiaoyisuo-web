/**
 * 卡券选择 - 我的卡券列表弹窗
 */

import { t } from '@lingui/macro'
import { useState } from 'react'
import { IVipCoupon } from '@/typings/api/welfare-center/coupons-select'
import { Message } from '@nbit/arco'
import AssetsPopUp from '@/features/assets/common/assets-popup'
import styles from '../index.module.css'
import { CouponCell } from '../coupon-cell'

interface ICouponModalProps {
  visible: boolean
  availableList: IVipCoupon[]
  unavailableList: IVipCoupon[]
  selectList: IVipCoupon[]
  onClose: () => void
  onChange: (e: IVipCoupon[]) => void
}

function CouponModal({
  visible,
  availableList,
  unavailableList,
  selectList: selected,
  onClose,
  onChange,
}: ICouponModalProps) {
  const [selectList, setSelectList] = useState<IVipCoupon[]>(selected || [])

  const onSelectCoupon = (e: IVipCoupon) => {
    const isContained = selectList.some(item => item.id === e?.id)
    // 是否包含同类型的卡券
    const isSameType = selectList.some(item => item.couponType === e?.couponType)
    if (!isContained && isSameType) {
      Message.error(t`features_welfare_center_compontents_coupon_select_index_h_54cizedl`)
      return
    }

    const newSelectList = isContained ? selectList.filter(item => item.id !== e?.id) : [...selectList, e]
    setSelectList(newSelectList)
  }

  return (
    <AssetsPopUp
      visible={visible}
      isResetCss
      title={t`features_welfare_center_compontents_coupon_select_index_u3rzlmkaqa`}
      // footer={null}
      onCancel={() => {
        onClose()
      }}
      onOk={() => {
        onClose()
        onChange(selectList)
      }}
    >
      <div className={styles['coupon-select-modal']}>
        <div className="coupon-content">
          {availableList?.length > 0 && (
            <>
              <div className="coupon-area-title">
                {t({
                  id: 'features_welfare_center_compontents_coupon_select_index_u5bvemjdk8',
                  values: { 0: availableList?.length },
                })}
              </div>
              {availableList?.map((availableCoupon, i: number) => {
                const isSelect = selectList.some(item => item?.id === availableCoupon?.id)
                return <CouponCell key={i} data={availableCoupon} isSelect={isSelect} onSelect={onSelectCoupon} />
              })}
            </>
          )}

          {unavailableList?.length > 0 && (
            <>
              <div className="coupon-area-title">
                {t({
                  id: 'features_welfare_center_compontents_coupon_select_index_mgrinjmrfk',
                  values: { 0: unavailableList?.length },
                })}
              </div>
              {unavailableList?.map((unavailableCoupon, i: number) => {
                return <CouponCell key={i} data={unavailableCoupon} isAvailable={false} />
              })}
            </>
          )}
        </div>
      </div>
    </AssetsPopUp>
  )
}

export { CouponModal }
