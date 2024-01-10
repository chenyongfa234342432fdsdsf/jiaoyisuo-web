import { useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import FuturesMarginCurrencySetting from '@/features/trade/trade-setting/futures/margin-currency'
import FuturesSpreadProtectionSetting from '@/features/trade/trade-setting/futures/spread-protection'
import FuturesAutomaticMarginCallSetting from '@/features/trade/trade-setting/futures/automatic-margin-call'
import FuturesSettlementCurrencySetting from '@/features/trade/trade-setting/futures/settlement-currency'
import FuturesVersionSetting from '@/features/trade/trade-setting/futures/version'
import FuturesBeginnerTutorial from '@/features/trade/trade-setting/futures/beginner-tutorial'
import FuturesOrderUnit from '@/features/trade/trade-setting/futures/order-unit'
import { useContractPreferencesStore } from '@/store/user/contract-preferences'
import { UserContractVersionEnum, UserHandleIntroEnum } from '@/constants/user'
import { usePageContext } from '@/hooks/use-page-context'
import Styles from '../index.module.css'

function TradeFuturesSetting({
  visible,
  isTutorial,
  onSuccess,
  onClose,
}: {
  visible: boolean
  isTutorial: boolean
  onSuccess?(isTrue: boolean): void
  onClose?(isTrue: boolean): void
}) {
  const [tutorialVisible, setTutorialVisible] = useState<boolean>(false)
  const { urlParsed } = usePageContext()
  const { contractPreference, getContractPreference } = useContractPreferencesStore()

  useEffect(() => {
    const routeName = urlParsed?.pathname
    const isFutures = routeName?.includes(UserHandleIntroEnum.futures)
    if (isTutorial || isFutures) {
      setTutorialVisible(true)
    }
    visible && getContractPreference()
  }, [visible])

  return visible ? (
    <div className={Styles['trade-setting-main-wrap']}>
      <div className="list-wrap">
        <div className="title line">{t`features_trade_trade_setting_index_5101419`}</div>

        <FuturesVersionSetting />

        {tutorialVisible && <FuturesBeginnerTutorial onFuturesClose={onClose} />}

        <FuturesMarginCurrencySetting />

        <FuturesSettlementCurrencySetting />

        <FuturesOrderUnit />

        <FuturesSpreadProtectionSetting />

        {contractPreference.perpetualVersion === UserContractVersionEnum.professional && (
          <FuturesAutomaticMarginCallSetting onSuccess={onSuccess} />
        )}
      </div>
    </div>
  ) : null
}

export default TradeFuturesSetting
