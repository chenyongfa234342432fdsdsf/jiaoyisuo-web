import { Trigger, Message } from '@nbit/arco'
import Icon from '@/components/icon'
import Link from '@/components/link'
import { t } from '@lingui/macro'
import { link } from '@/helper/link'
import { useDefaultFuturesUrl, useDefaultTernaryUrl } from '@/helper/market'
import { getRecreationPageRoutePath } from '@/helper/route'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { AuthModuleAdapterNavi, getModuleStatusByKey } from '@/helper/module-config'
import { ModuleEnum } from '@/constants/module-config'
import LazyImage from '@/components/lazy-image'
import useApiHeaderMenu from '@/hooks/features/layout'
import { getAuthMainMenu, getHomeMenu } from '@/helper/layout'
import { getIsLogin } from '@/helper/auth'
import { useCommonStore } from '@/store/common'
import { ThemeEnum } from '@/constants/base'

/** 需要登录态才能跳转的路由 */
const verifyList = ['/recreation']

function SubMenu(route) {
  const isMergeMode = getMergeModeStatus()
  const { theme } = useCommonStore()
  const handleVerifyClick = () => {
    if (!getIsLogin()) {
      Message.info(t`features_layout_components_header_menu_vdieghywsd`)
      link('/login')
      return
    }

    link(route.url)
  }
  let iconPath = theme === ThemeEnum.dark ? route?.whiteIcon : route?.blackIcon
  if (!iconPath) iconPath = route?.icon

  return (
    <div className="submenu-wrap">
      {verifyList.includes(route.url) ? (
        <div className="hasVerify cursor-pointer" onClick={handleVerifyClick}>
          {route.name}
          {/* <div className="subtitle-wrap">{route.describe}</div> */}
          {/* <Icon className="arrow-icon absolute-top-center" name="next_arrow_two" /> */}
          {isMergeMode ? (
            <Icon className="main-icon absolute-top-center" name={route.icon} />
          ) : (
            <LazyImage className="main-icon absolute-top-center" src={iconPath} />
          )}
        </div>
      ) : (
        <Link href={route.url}>
          {route.name}
          {/* <div className="subtitle-wrap">{route.describe}</div> */}
          {/* <Icon className="arrow-icon absolute-top-center" name="next_arrow_two" /> */}
          {isMergeMode ? (
            <Icon className="main-icon absolute-top-center" name={route.icon} />
          ) : (
            <LazyImage className="main-icon absolute-top-center" src={iconPath} />
          )}
        </Link>
      )}
    </div>
  )
}

function HeaderMenu() {
  const isMergeMode = getMergeModeStatus()
  const futuresLink = useDefaultFuturesUrl()
  const isShowSpot = getModuleStatusByKey(ModuleEnum.spot)

  const navigationMenu = useApiHeaderMenu()
  const mainMenu = getHomeMenu(navigationMenu)
  // format navigation list data
  const { authModules, otherRoutes } = AuthModuleAdapterNavi(mainMenu)
  const authModuleRoutes = getAuthMainMenu({ authModules, otherRoutes })

  const ternaryLink = useDefaultTernaryUrl()
  // const c2c = {
  //   href: '/c2c',
  //   text: t`features_layout_components_header_menu_prlscastgac3bk5dbodin`,
  //   children: [
  //     {
  //       href: getC2cOrderShortPageRoutePath(),
  //       text: t`features_c2c_new_common_c2c_new_nav_index_5101352`,
  //       subtitle: t`features_layout_components_header_menu_6ua1g5txg5r1h8ctarfbv`,
  //       icon: 'c2c_quick_transaction',
  //     },
  //     {
  //       href: getC2cOrderC2CPageRoutePath(),
  //       text: t`features_c2c_new_common_c2c_new_nav_index_5101353`,
  //       subtitle: t`features_layout_components_header_menu_60rm3qs3b0ubuxe88upmg`,
  //       icon: 'nav_order_c2c',
  //     },
  //   ],
  // }

  const markets = {
    url: isMergeMode || !isShowSpot ? '/markets/futures' : '/markets/spot',
    name: t`market`,
    describe: t`features_trade_trade_header_pop_menu_index_5101299`,
    icon: 'trading_markets',
  }

  if (!isShowSpot && authModules?.[ModuleEnum.markets]?.url) authModules[ModuleEnum.markets].url = '/markets/futures'

  // if (isMergeMode) {
  //   const markets = moduleRoutes[ModuleEnum.markets]
  //   if (markets?.url) markets.url = isMergeMode || !isShowSpot ? '/markets/futures' : '/markets/spot'
  //   if (markets?.icon) markets.icon = 'trading_markets'
  // }

  // const trade = {
  //   href: '/trade',
  //   text: t`trade.c2c.trade`,
  //   children: [
  //     {
  //       href: getDefaultTradeUrl(),
  //       text: t`trade.type.coin`,
  //       subtitle: t`features/layout/components/header-menu-0`,
  //       icon: 'icon_equity_buy_sell',
  //     },
  //     // {
  //     //   href: `${getDefaultTradePageLink()}?type=${TradeMarginEnum.margin}`,
  //     //   text: t`constants/trade-1`,
  //     //   subtitle: t`features/layout/components/header-menu-1`,
  //     // },
  //   ],
  // }

  const derivatives = {
    url: '/futures',
    name: t`constants_assets_index_2559`,
    submenu: [
      {
        url: futuresLink,
        name: t`constants/trade-0`,
        describe: t`features_layout_components_header_menu_5101425`,
        icon: 'u_standard_contract',
      },
      {
        url: ternaryLink,
        name: t`features_trade_trade_header_pop_menu_index_pweylulaexiyla3oov_3y`,
        describe: t`features_layout_components_header_menu_yvtyywa_qy`,
        icon: 'options',
      },
      {
        url: getRecreationPageRoutePath(),
        name: t`features_recreation_index_oqhxipaffm`,
        describe: t`features_layout_components_header_menu_gksylorgw5`,
        icon: 'icon_games',
      },
    ],
  }

  const defaultRoutes = [markets, derivatives]
  const headerRoutes = isMergeMode ? defaultRoutes : authModuleRoutes

  return (
    <div className="menu-wrap">
      {headerRoutes
        .sort((a, b) => a.sortCode - b.sortCode)
        .map((route, idx) => {
          if (route.submenu?.length) {
            return (
              <div className="menu-item-wrap" key={idx}>
                <Trigger
                  popupAlign={{
                    bottom: 16,
                  }}
                  popup={() => {
                    return (
                      <div className="popup-wrap header-menu-wrap">
                        {route.submenu
                          .sort((a, b) => a.sortCode - b.sortCode)
                          .map((subRoute, index) => {
                            return <SubMenu key={index} {...subRoute} />
                          })}
                      </div>
                    )
                  }}
                >
                  <div className="cursor-pointer">
                    {route.name}
                    <Icon className="ml-1 multiple-menu-icon" name="arrow_open" hasTheme />
                  </div>
                </Trigger>
              </div>
            )
          }
          return (
            <div key={idx} className="menu-item-wrap">
              <Link href={route.url}>{route.name}</Link>
            </div>
          )
        })}
    </div>
  )
}

export default HeaderMenu
