import { useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import { Tabs, Spin } from '@nbit/arco'
import classNames from 'classnames'
import { CardCouponCenterEnum } from '@/constants/welfare-center'
import { getV1CouponTypesCountApiRequest } from '@/apis/welfare-center'
import { YapiGetV1CouponTypesCountData } from '@/typings/yapi/CouponTypesCountV1GetApi'
import { useUserStore } from '@/store/user'
import { useWelfareCenterStore } from '@/store/welfare-center'
import AllCardCoupon from './all-card-coupon'
import CardRedemptionCenter from './card-redemption-center'
import styles from './index.module.css'

const TabPane = Tabs.TabPane

type CardCouponCenter = {
  allCoupons: number | undefined
  redemptionCenter: number | undefined
}

const cardCouponCenterTipStyle = 'absolute w-2 h-2 right-0 top-1 bg-sell_down_color rounded-full'

function CardCouponCenter() {
  const { isLogin } = useUserStore()
  const { couponItemType, updateCouponItemType } = {
    ...useWelfareCenterStore(),
  }

  const [cardCouponCenterItem, setCardCouponCenterItem] = useState<string>(CardCouponCenterEnum.AllCoupons)
  /** 是否显示全部卡券 Tab 的上的红点 */
  const [showAllCouponTip, setShowAllCouponTip] = useState<boolean>(false)
  /** 是否显示兑换中心 Tab 的上的红点 */
  const [showRedemptionCenterTip, setShowRedemptionCenterTip] = useState<boolean>(false)
  /** 是否显示 loading */
  const [showLoading, setShowLoading] = useState<boolean>(false)
  /** 各类券的数量集合 */
  const [couponTypesNumberObj, setCouponTypesNumberObj] = useState<Partial<YapiGetV1CouponTypesCountData>>()
  /** 全部卡券的数量 兑换中心卡券的数量 */
  const [cardCouponCenterTypeNum, setCardCouponCenterTypeNum] = useState<CardCouponCenter>({
    allCoupons: 0,
    redemptionCenter: 0,
  })

  const welfareCenterDisplayList = [
    {
      title: (
        <div className="relative">
          {t`features_welfare_center_card_coupon_center_index_pqq09fvzux`} ({cardCouponCenterTypeNum.allCoupons})
          {showAllCouponTip && <span className={cardCouponCenterTipStyle} />}
        </div>
      ),
      key: CardCouponCenterEnum.AllCoupons,
    },
    {
      title: (
        <div className="relative">
          {t`features_welfare_center_card_coupon_center_index_8ypprhcuqw`} ({cardCouponCenterTypeNum.redemptionCenter})
          {showRedemptionCenterTip && <span className={cardCouponCenterTipStyle} />}
        </div>
      ),
      key: CardCouponCenterEnum.RedemptionCenter,
    },
  ]

  const getCouponTypesCountApiRequest = async () => {
    if (isLogin) {
      const { isOk, data } = await getV1CouponTypesCountApiRequest({})
      if (isOk) {
        setCardCouponCenterTypeNum({
          allCoupons: data?.validNum,
          redemptionCenter: data?.activityCouponNum,
        })
        setCouponTypesNumberObj(data)
        setShowRedemptionCenterTip(!!data?.activityCouponNew)
        setShowAllCouponTip(!!data?.couponNew)
      }
    }
  }

  const setSelectedCardCouponCenter = e => {
    getCouponTypesCountApiRequest()
    setCardCouponCenterItem(e)
  }

  const setShowAllCouponTipChange = () => {
    getCouponTypesCountApiRequest()
  }

  const setShowLoadingOpenChange = () => {
    setShowLoading(true)
  }

  const setShowLoadingCloseChange = () => {
    setShowLoading(false)
  }

  const getDisplayWelfareCenterModule = () => {
    const pageHandleObj = {
      setShowLoadingOpenChange,
      setShowLoadingCloseChange,
    }

    return {
      [CardCouponCenterEnum.AllCoupons]: (
        <AllCardCoupon
          couponTypesNumberObj={couponTypesNumberObj}
          getCouponTypesCountApiRequest={getCouponTypesCountApiRequest}
          {...pageHandleObj}
        />
      ),
      [CardCouponCenterEnum.RedemptionCenter]: (
        <CardRedemptionCenter setShowAllCouponTipChange={setShowAllCouponTipChange} {...pageHandleObj} />
      ),
    }[cardCouponCenterItem]
  }

  useEffect(() => {
    getCouponTypesCountApiRequest()
  }, [cardCouponCenterItem])

  useEffect(() => {
    if (couponItemType) {
      setCardCouponCenterItem(couponItemType)
    }

    return () => {
      updateCouponItemType('')
    }
  }, [])

  return (
    <div className={classNames(styles.scoped)}>
      <Spin className="w-full" loading={showLoading}>
        <div className="card-coupon-center-header">
          <Tabs activeTab={cardCouponCenterItem} onChange={setSelectedCardCouponCenter}>
            {welfareCenterDisplayList?.map(item => {
              return <TabPane key={item.key} title={item.title} />
            })}
          </Tabs>
        </div>
        {getDisplayWelfareCenterModule()}
      </Spin>
    </div>
  )
}

export default CardCouponCenter
