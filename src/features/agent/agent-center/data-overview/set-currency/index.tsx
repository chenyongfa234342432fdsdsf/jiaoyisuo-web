import { useState, useEffect } from 'react'
import { Trigger } from '@nbit/arco'
import Icon from '@/components/icon'
import { usePersonalCenterStore } from '@/store/user/personal-center'
import { t } from '@lingui/macro'
import Link from '@/components/link'
import { useAssetsStore } from '@/store/assets'
import classNames from 'classnames'
import { useAgentCenterStore } from '@/store/agent/agent-center/center'
import styles from './index.module.css'
import { CoinList } from '../coin-list'

type IMenuCellsProps = {
  onClickMenu?: (v) => void
}
function MenuCells({ onClickMenu }: IMenuCellsProps) {
  const { agentCurrencyList, updateVisibleCurrencyListModal } = { ...useAgentCenterStore() } || {}

  const onClick = values => {
    onClickMenu && onClickMenu(values)
  }

  return (
    <div className={styles.scoped}>
      {agentCurrencyList?.map(v => (
        <div className="cell" key={v.currencyEnName} onClick={() => onClick(v)}>
          <div className="cell-wrap">{v.currencyEnName}</div>
        </div>
      ))}
      {agentCurrencyList?.length > 3 && (
        <div
          className="cell-wrap"
          onClick={() => {
            updateVisibleCurrencyListModal(true)
          }}
        >
          <div className="label-text">{t`More`}</div>
          <Icon className="icon" name="assets_more" hasTheme />
        </div>
      )}
    </div>
  )
}

export function SetCurrency() {
  const {
    overviewData,
    visibleCurrencyListModal,
    currentCurrency: { currencyEnName },
    updateCurrentCurrency,
    updateVisibleCurrencyListModal,
    encryption: encryptState,
  } = { ...useAgentCenterStore() } || {}
  const [popupVisible, setPopupVisible] = useState(false)

  const onSetCurrency = values => {
    updateCurrentCurrency({ ...values })
    setPopupVisible(false)
  }

  useEffect(() => {
    if (!overviewData?.currencySymbol || currencyEnName) return
    updateCurrentCurrency({
      currencyEnName: overviewData?.currencySymbol || '',
      offset: 2,
      logo: overviewData?.appLogo || '',
    })
  }, [overviewData?.currencySymbol, encryptState])

  return (
    <div
      className={classNames(styles['trigger-wrapper'], {
        hidden: encryptState,
      })}
    >
      <Trigger
        popup={() => <MenuCells onClickMenu={onSetCurrency} />}
        onVisibleChange={setPopupVisible}
        popupVisible={popupVisible}
      >
        {currencyEnName}
        <Icon
          className="icon"
          name="arrow_open"
          hasTheme
          onClick={() => {
            setPopupVisible(true)
          }}
        />
      </Trigger>

      {visibleCurrencyListModal && (
        <CoinList
          visible={visibleCurrencyListModal}
          setVisible={val => {
            updateVisibleCurrencyListModal(val)
          }}
        />
      )}
    </div>
  )
}

/** 资产法币符号，监听资产显示隐藏状态 */
export function CurrencySymbolLabel({ symbol }: { symbol: string }) {
  const { currencyEnName } = usePersonalCenterStore().fiatCurrencyData
  const assetsStore = useAssetsStore()
  const {
    assetSetting: { encryptState },
  } = assetsStore

  return (
    <div
      className={classNames(styles['trigger-wrapper'], {
        hidden: encryptState,
      })}
    >
      {symbol || currencyEnName}
    </div>
  )
}
