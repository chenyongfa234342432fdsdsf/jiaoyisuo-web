/**
 * 卡券选择
 */
import { getCouponSelectApi } from '@/apis/welfare-center'
import { useUserStore } from '@/store/user'
import { useWelfareCenterStore } from '@/store/welfare-center'
import { VipCouponListResp } from '@/typings/api/welfare-center/coupons-select'
import { useMount, useRequest, useUpdateEffect } from 'ahooks'
import { useEffect, useState } from 'react'

/**
 * 获取我的卡券列表
 * @param businessScene 卡券场景 ScenesBeUsedEnum
 */
export function useGetCouponSelectList(businessScene: string) {
  const { isLogin } = useUserStore()
  const {
    couponSelectEnums,
    isRefreshCouponSelectApi,
    updateCouponSelectList,
    updateIsRefreshCouponSelectApi,
    fetchCouponSelectEnums,
  } = {
    ...useWelfareCenterStore(),
  }

  /** 获取卡券列表 */
  const { run: getCouponSelectList } = useRequest(
    async () => {
      const params = { businessScene }
      const res = await getCouponSelectApi(params)
      const { isOk, data } = res || {}
      if (!isOk || !data) {
        updateCouponSelectList({} as VipCouponListResp)
        return
      }
      updateCouponSelectList(data)
      updateIsRefreshCouponSelectApi(false)
    },
    { manual: true }
  )

  useMount(() => {
    !couponSelectEnums?.businessSceneEnum?.enums?.length && fetchCouponSelectEnums()
  })

  useEffect(() => {
    if (!isLogin) {
      updateCouponSelectList({} as VipCouponListResp)
      return
    }
    getCouponSelectList()
  }, [isLogin])

  useUpdateEffect(() => {
    if (isRefreshCouponSelectApi) getCouponSelectList()
  }, [isRefreshCouponSelectApi])
}

/**
 * 市价是否匹配最优
 * @param size 数量
 * @param isManual 用户手工选择
 * @param isMarket 是否市价
 */
export function useIsMatchCoupon(size, price, isManual, isMarket = true) {
  /** 是否自动匹配 */
  const [isMatch, setIsMatch] = useState(true)

  useUpdateEffect(() => {
    // 数量变，自动匹配
    setIsMatch(true)
  }, [size, isMarket, isManual])

  useUpdateEffect(() => {
    // 市价、手工选择了且数量没变化时不自动匹配
    if (isMarket && isManual) {
      setIsMatch(false)
    }
  }, [price, isMarket, isManual])
  return isMatch
}
