import { Menu } from '@nbit/arco'
import { ReactNode } from 'react'
import Icon from '@/components/icon'
import { usePageContext } from '@/hooks/use-page-context'
import { link } from '@/helper/link'
import { flatten } from 'lodash'
import Link from '@/components/link'
import { OrderTabTypeEnum } from '@/constants/order'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { t } from '@lingui/macro'
import { getFutureOrderPagePath, getSpotOrderPagePath } from '@/helper/route'
import { getFuturesHistoryPositionPageRoutePath } from '@/helper/route/assets'
import classNames from 'classnames'
import ButtonRadios from '@/components/button-radios'
import { getAuthModuleRoutes } from '@/helper/module-config'
import styles from './order-menu.module.css'

const MenuItem = Menu.Item
const SubMenu = Menu.SubMenu

type IMenu = {
  name: string
  icon: ReactNode
  route?: string
  id?: string
  isLink?: boolean
  children?: IMenu[]
}
export function useMenus(): IMenu[] {
  const isMergeMode = getMergeModeStatus()

  const spotMenu = {
    id: 'spot',
    name: t`features_orders_order_menu_5101178`,
    icon: <Icon name="nav_order_sg" className="text-2xl" />,
    children: [
      {
        name: t`order.tabs.current`,
        icon: <Icon name="" />,
        route: getSpotOrderPagePath(OrderTabTypeEnum.current),
      },
      {
        name: t`order.tabs.history`,
        icon: <Icon name="" />,
        route: getSpotOrderPagePath(OrderTabTypeEnum.history),
      },
    ],
  }

  const futureMenu = {
    name: t`order.titles.future`,
    id: 'future',
    icon: <Icon name="nav_order_contract" className="text-2xl" />,
    children: [
      {
        name: t`order.tabs.current`,
        icon: <Icon name="" />,
        route: getFutureOrderPagePath(OrderTabTypeEnum.current),
      },
      {
        name: t`order.tabs.history`,
        icon: <Icon name="" />,
        route: getFutureOrderPagePath(OrderTabTypeEnum.history),
      },
      {
        name: t`features_orders_order_menu_jt39dmdgfi`,
        icon: <Icon name="" />,
        route: getFuturesHistoryPositionPageRoutePath(),
      },
      {
        name: t`constants/assets/common-8`,
        icon: <Icon name="" />,
        route: getFutureOrderPagePath(OrderTabTypeEnum.funding),
      },
    ],
  }

  return isMergeMode ? [futureMenu] : getAuthModuleRoutes({ spot: spotMenu, contract: futureMenu }) // [spotMenu, futureMenu]
}

export function OrderMenu({ children }) {
  const menus = useMenus()
  const pageContext = usePageContext()
  const routePath = pageContext.path.split('?')[0]
  const defaultOpenIndex = menus.map(menu => menu.id).indexOf(routePath.split('/')[2]) || 0

  const onClickMenuItem = (key: string) => {
    const menu = flatten(menus.map(item => item.children || [])).find(m => m.route === key)
    if (menu!.isLink) {
      window.open(menu!.route)
    } else {
      link(menu!.route)
    }
  }
  const selectedMenu = menus[defaultOpenIndex]
  const selectedSubMenu = selectedMenu.children!.find(subMenu => subMenu.route === routePath)!

  const subMenuOptions = selectedMenu.children!.map(subMenu => {
    return {
      label: subMenu.name,
      value: subMenu.route!,
    }
  })

  return (
    <div className={styles['order-menus']}>
      <div className="top-menus ">
        <div className="content-width-limit flex">
          {menus.map(menu => {
            return (
              <div
                className={classNames('order-menu-item', {
                  'is-selected': menu.name === selectedMenu.name,
                })}
                onClick={() => onClickMenuItem(menu.children?.[0]?.route || '')}
                key={menu.name}
              >
                {menu.name}
                <div className="status-bar"></div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="title-box">
        <div className="title content-width-limit">{selectedSubMenu.name}</div>
      </div>
      <div className="sub-menus">
        <div className="content-width-limit pt-6 pb-2 flex">
          <ButtonRadios
            hasGap
            bothClassName="px-5 py-2 text-sm font-medium"
            inactiveClassName="text-text_color_02"
            activeClassName="bg-bg_sr_color !rounded-lg"
            options={subMenuOptions}
            onChange={onClickMenuItem}
            value={selectedSubMenu.route!}
          />
        </div>
      </div>

      <div className="content-width-limit !px-0">{children}</div>
    </div>
  )
}
