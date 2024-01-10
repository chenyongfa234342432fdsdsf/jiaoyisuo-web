import { useRef, useState, ReactNode, useEffect } from 'react'
import { t } from '@lingui/macro'
import { link } from '@/helper/link'
import { useHelpCenterUrl } from '@/hooks/use-help-center-url'
import { usePageContext } from '@/hooks/use-page-context'
import {
  welfareCenterImgUrl,
  WelfareCenterEnum,
  ruleHomeColumnCd,
  welfareCenterPageType,
  couponItemType,
} from '@/constants/welfare-center'
import { useWelfareCenterStore } from '@/store/welfare-center'
import LazyImage, { Type } from '@/components/lazy-image'
import classNames from 'classnames'
import Icon from '@/components/icon'
import CardCouponCenter from './card-coupon-center'
import TaskCenter from './task-center'
import ActivitiesCenter from './activities-center'
import styles from './index.module.css'

type WelfareCenterDisplayList = {
  title: string
  key: string
  icon: ReactNode
  selectedIcon: ReactNode
}

function WelfareCenter() {
  const [welfareCenterDisplayModule, setWelfareCenterDisplayModule] = useState<string>(WelfareCenterEnum.MyTasks)
  const ruleUrl = useHelpCenterUrl(ruleHomeColumnCd.MyActivities) || ''
  const pageContext = usePageContext()
  const { updateCouponItemType } = {
    ...useWelfareCenterStore(),
  }

  const welfareCenterDisplayList = useRef<WelfareCenterDisplayList[]>([
    {
      title: t`features_welfare_center_index_ioularluhe`,
      key: WelfareCenterEnum.MyTasks,
      icon: <Icon name="icon_welfare_tab_task_grey" hasTheme />,
      selectedIcon: <Icon name="icon_welfare_tab_task" hasTheme />,
    },
    {
      title: t`features_welfare_center_index_qr1h9nmzt8`,
      key: WelfareCenterEnum.MyActivities,
      icon: <Icon name="icon_welfare_tab_gift_grey" hasTheme />,
      selectedIcon: <Icon name="icon_welfare_tab_gift" hasTheme />,
    },
    {
      title: t`features_welfare_center_index_vubaibo71l`,
      key: WelfareCenterEnum.CardVoucherCenter,
      icon: <Icon name="icon_welfare_tab_ticket_grey" hasTheme />,
      selectedIcon: <Icon name="icon_welfare_tab_ticket" hasTheme />,
    },
  ])

  const setSelectedwelfareCenterDisplayModule = key => {
    setWelfareCenterDisplayModule(key)
  }

  const getDisplayWelfareCenterModule = () => {
    return {
      [WelfareCenterEnum.MyTasks]: <TaskCenter changePage={setSelectedwelfareCenterDisplayModule} />,
      [WelfareCenterEnum.MyActivities]: <ActivitiesCenter />,
      [WelfareCenterEnum.CardVoucherCenter]: <CardCouponCenter />,
    }[welfareCenterDisplayModule]
  }

  const gotoRule = () => {
    link(ruleUrl)
  }

  useEffect(() => {
    const urlParsed = pageContext?.urlParsed
    const { type, couponItem } = urlParsed?.search || { type: '', couponItem: '' }
    const couponItemKey = couponItemType[couponItem] || null
    const pageKey = welfareCenterPageType[type] || null

    couponItemKey && updateCouponItemType(couponItemKey)
    pageKey && setSelectedwelfareCenterDisplayModule(pageKey)
  }, [pageContext.urlParsed])

  return (
    <div className={classNames(styles.scoped)}>
      <div className="welfare-center-header">
        <div className="welfare-center-header-text">
          <div className="welfare-center-left">
            <div className="welfare-center-left-title">{t`features_welfare_center_index_vg4pz_d6jn`}</div>
            <div className="welfare-center-left-subtitle">{t`features_welfare_center_index_ybrf8htzjy`}</div>
            <div className="welfare-center-rule" onClick={gotoRule}>
              {t`features_welfare_center_index_mherzmrnzt`}
              <Icon name="transaction_arrow" hasTheme className="welfare-center-rule-icon" />
            </div>
          </div>
          <div>
            <LazyImage src={`${welfareCenterImgUrl}/image_welfare_coupons_center`} hasTheme imageType={Type.png} />
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="welfare-center-select">
          {welfareCenterDisplayList.current?.map(item => {
            return (
              <div
                key={item.key}
                onClick={() => setSelectedwelfareCenterDisplayModule(item.key)}
                className={classNames('welfare-center-select-item', {
                  'welfare-center-select-item-checked': welfareCenterDisplayModule === item.key,
                })}
              >
                {welfareCenterDisplayModule === item.key ? item.selectedIcon : item.icon}
                {item.title}
              </div>
            )
          })}
        </div>
      </div>
      {getDisplayWelfareCenterModule()}
    </div>
  )
}

export default WelfareCenter
