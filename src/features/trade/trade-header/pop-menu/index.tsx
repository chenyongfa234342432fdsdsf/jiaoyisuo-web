import Icon from '@/components/icon'
import Link from '@/components/link'
import { t } from '@lingui/macro'
import { Trigger } from '@nbit/arco'
import { useState } from 'react'
import { getRecreationPageRoutePath } from '@/helper/route'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { AuthModuleAdapterNavi, getAuthModuleRoutes, getModuleStatusByKey } from '@/helper/module-config'
import { ModuleEnum } from '@/constants/module-config'
import { getTradeMenu } from '@/helper/layout'
import useApiHeaderMenu from '@/hooks/features/layout'
import LazyImage from '@/components/lazy-image'
import { useCommonStore } from '@/store/common'
import { ThemeEnum } from '@/constants/base'
import { useDefaultFuturesUrl, useDefaultTernaryUrl } from '../../../../helper/market'

function SubMenu(route) {
  const isMergeMode = getMergeModeStatus()
  const { theme } = useCommonStore()
  let iconPath = theme === ThemeEnum.dark ? route?.whiteIcon : route?.blackIcon
  if (!iconPath) iconPath = route?.icon
  return (
    <div className="submenu-wrap">
      <Link href={route.url}>
        {route.name}
        <div className="subtitle-wrap">{route.describe}</div>
        {/* <Icon className="arrow-icon absolute-top-center" name="next_arrow_two" /> */}
        {isMergeMode ? (
          <Icon className="main-icon absolute-top-center w-6 h-6" name={route.icon} />
        ) : (
          <LazyImage className="main-icon absolute-top-center w-6 h-6" src={iconPath} />
        )}
      </Link>
    </div>
  )
}
function PopMenu() {
  const isMergeMode = getMergeModeStatus()
  const futuresLink = useDefaultFuturesUrl()
  const ternaryLink = useDefaultTernaryUrl()

  const [isIconHover, setIsIconHover] = useState(false)
  const isShowSpot = getModuleStatusByKey(ModuleEnum.spot)

  const navigationMenu = useApiHeaderMenu()
  const tradeMenu = getTradeMenu(navigationMenu)
  const { authModules: moduleRoutes, otherRoutes } = AuthModuleAdapterNavi(tradeMenu)
  const authModuleRoutes = [...getAuthModuleRoutes(moduleRoutes), ...otherRoutes]

  // const c2c = {
  //   href: `${getC2cOrderShortPageRoutePath()}`,
  //   text: t`features_c2c_new_common_c2c_new_nav_index_5101352`,
  //   subtitle: t`features_trade_trade_header_pop_menu_index_ihr_ethtxrh_ccypjcyld`,
  //   icon: 'c2c_quick_transaction',
  // }

  const markets = {
    url: isMergeMode || !isShowSpot ? '/markets/futures' : '/markets/spot',
    name: t`market`,
    describe: t`features_trade_trade_header_pop_menu_index_5101299`,
    icon: 'trading_markets',
  }

  if (!isShowSpot && moduleRoutes?.[ModuleEnum.markets]?.url) moduleRoutes[ModuleEnum.markets].url = '/markets/futures'

  // if (isMergeMode) {
  //   const markets = moduleRoutes[ModuleEnum.markets]
  //   if (markets?.url) markets.url = isMergeMode || !isShowSpot ? '/markets/futures' : '/markets/spot'
  //   if (markets?.icon) markets.icon = 'trading_markets'
  // }

  // const spot = {
  //   href: getDefaultTradeUrl(),
  //   text: t`trade.type.coin`,
  //   subtitle: t`features/layout/components/header-menu-0`,
  //   icon: 'icon_equity_buy_sell',
  // }

  const contract = {
    url: futuresLink,
    name: t`constants/trade-0`,
    describe: t`features_layout_components_header_menu_5101425`,
    icon: 'u_standard_contract',
  }

  const ternaryOption = {
    url: ternaryLink,
    name: t`features_trade_trade_header_pop_menu_index_pweylulaexiyla3oov_3y`,
    describe: t`features_layout_components_header_menu_yvtyywa_qy`,
    icon: 'options',
  }

  const recreation = {
    url: getRecreationPageRoutePath(),
    name: t`features_recreation_index_oqhxipaffm`,
    describe: t`features_layout_components_header_menu_gksylorgw5`,
    icon: 'icon_games',
  }

  const defaultRoutes = [markets, contract, ternaryOption, recreation]

  const headerRoutes = isMergeMode ? defaultRoutes : authModuleRoutes

  return (
    <Trigger
      popupAlign={{
        bottom: [120, 8],
      }}
      popup={() => {
        return (
          <div className="popup-wrap pop-header-menu-wrap">
            {headerRoutes
              .sort((a, b) => a.sortCode - b.sortCode)
              .map(subRoute => {
                return <SubMenu key={subRoute.url} {...subRoute} />
              })}
          </div>
        )
      }}
    >
      <div
        className="header-pop-wrap"
        onMouseMove={() => setIsIconHover(true)}
        onMouseLeave={() => setIsIconHover(false)}
      >
        <Icon
          className="menu-icon mr-2 text-base"
          name={isIconHover ? `spot_menu_hover` : `spot_menu`}
          hasTheme={!isIconHover}
        />
        <Icon className="arrow-icon" name="arrow_open" hasTheme />
      </div>
    </Trigger>
  )
}

export default PopMenu
