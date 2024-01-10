import { useEffect, useState } from 'react'
import { Dropdown, Menu } from '@nbit/arco'
import { useContractPreferencesStore } from '@/store/user/contract-preferences'
import { UserOrderUnit } from '@/constants/user'
import classNames from 'classnames'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { getOrderUnit, postSetOrderUnit } from '@/helper/user'
import styles from './index.module.css'

const MenuItem = Menu.Item

function FuturesOrderUnit() {
  const [dropdownShow, setDropdownShow] = useState(false)
  const { orderUnit } = useContractPreferencesStore()

  const coinList = {
    sell: t`features_trade_trade_setting_futures_order_unit_index_roc4rn4pdt`,
    buy: t`features_trade_trade_setting_futures_order_unit_index_aeyzejj_yj`,
  }

  useEffect(() => {
    getOrderUnit()
  }, [])

  return (
    <div className="list">
      <div className="label">{t`features_trade_trade_setting_futures_order_unit_index_ztny9yt5rq`}</div>
      <div className="value">
        <Dropdown
          unmountOnExit
          onVisibleChange={setDropdownShow}
          droplist={
            <Menu className={styles.scoped} onClickMenuItem={key => postSetOrderUnit(key as UserOrderUnit)}>
              <MenuItem
                key={UserOrderUnit.targetCurrency}
                className={classNames({
                  'text-brand_color': orderUnit === UserOrderUnit.targetCurrency,
                })}
              >
                {t`features_trade_trade_setting_futures_order_unit_index_roc4rn4pdt`}
              </MenuItem>
              <MenuItem
                key={UserOrderUnit.priceCurrency}
                className={classNames({
                  'text-brand_color': orderUnit === UserOrderUnit.priceCurrency,
                })}
              >{t`features_trade_trade_setting_futures_order_unit_index_aeyzejj_yj`}</MenuItem>
            </Menu>
          }
          trigger="click"
        >
          <label>{coinList[orderUnit]}</label>
        </Dropdown>
        <Icon name={dropdownShow ? `trade_expand` : 'next_arrow'} hasTheme />
      </div>
    </div>
  )
}

export default FuturesOrderUnit
