/**
 * 合约 - 开通合约账户
 */
import { useState } from 'react'
import { t } from '@lingui/macro'
import FuturesMarginCurrencyPopUp from '@/features/trade/trade-setting/futures/margin-currency/popup'
import FuturesSettlementCurrencyPopUp from '@/features/trade/trade-setting/futures/settlement-currency/popup'
import { getMemberBaseSettingsInfo } from '@/apis/user'
import { baseUserStore, useUserStore } from '@/store/user'

interface OpenFuturesPopupProps {
  visible: boolean
  setVisible: (boolean) => void
  onSuccess?: () => void
  onError?: () => void
}
export default function OpenFuturesPopup(props: OpenFuturesPopupProps) {
  const { visible, setVisible, onSuccess } = props || {}
  const [futuresSettlementCurrencyVisible, setFuturesSettlementCurrencyVisible] = useState<boolean>(false)
  const userStore = useUserStore()

  const { setUserInfo, setUserClassificationPopUpStatus } = userStore
  const { userInfo: _userInfo } = baseUserStore.getState()

  function onOpenSuccess() {
    onSuccess && onSuccess()
    getMemberBaseSettingsInfo({}).then(res => {
      if (res.isOk) {
        setUserInfo({ ..._userInfo, ...res?.data })
        setUserClassificationPopUpStatus(true)
      }
    })
  }

  return (
    <>
      <FuturesMarginCurrencyPopUp
        visible={visible}
        setVisible={setVisible}
        hasCloseIcon
        isOpenContract
        buttonText={t`user.field.reuse_23`}
        onSuccess={() => setFuturesSettlementCurrencyVisible(true)}
      />
      <FuturesSettlementCurrencyPopUp
        visible={futuresSettlementCurrencyVisible}
        setVisible={setFuturesSettlementCurrencyVisible}
        isOpenContract
        hasCloseIcon
        leftButtonText={t`features_kyc_kyc_company_statement_index_5101162`}
        onLeftButton={() => {
          setFuturesSettlementCurrencyVisible(false)
          setVisible(true)
        }}
        onSuccess={onOpenSuccess}
      />
    </>
  )
}
