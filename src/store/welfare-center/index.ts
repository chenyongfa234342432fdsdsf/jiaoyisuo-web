import { create } from 'zustand'
import { createTrackedSelector } from 'react-tracked'
import produce from 'immer'
import { IStoreEnum } from '@/typings/store/common'
import { getCodeDetailListBatch } from '@/apis/common'
import { CouponSelectEnum } from '@/constants/welfare-center/coupon-select'
import { VipCouponListResp } from '@/typings/api/welfare-center/coupons-select'

type IStore = ReturnType<typeof getStore>

function getStore(set, get) {
  const defaultCouponSelect = {}

  return {
    /** 卡券选择列表 */
    couponSelectList: defaultCouponSelect as VipCouponListResp,
    updateCouponSelectList: newCouponSelectList =>
      set(
        produce((store: IStore) => {
          store.couponSelectList = newCouponSelectList
        })
      ),
    /** 是否刷新卡券选择列表接口，true:刷新 */
    isRefreshCouponSelectApi: false,
    updateIsRefreshCouponSelectApi: newIsRefreshCouponSelectApi =>
      set(
        produce((store: IStore) => {
          store.isRefreshCouponSelectApi = newIsRefreshCouponSelectApi
        })
      ),
    /** 卡券选择所需数据字典 */
    couponSelectEnums: {
      /** 卡券使用场景 */
      businessSceneEnum: {
        codeKey: CouponSelectEnum.businessScene,
        enums: [],
      } as IStoreEnum,
      /** 卡券分类 */
      couponTypeCd: {
        codeKey: CouponSelectEnum.businessScene,
        enums: [],
      } as IStoreEnum,
      /** 卡券名称 */
      couponNameCd: {
        codeKey: CouponSelectEnum.couponNameCd,
        enums: [],
      } as IStoreEnum,
    },
    async fetchCouponSelectEnums() {
      const state: IStore = get()
      const data = await getCodeDetailListBatch(Object.values(state.couponSelectEnums).map(item => item.codeKey))
      set(
        produce((draft: IStore) => {
          const items = Object.values(draft.couponSelectEnums)
          items.forEach((item, index) => {
            item.enums = data[index].map(enumValue => {
              return {
                label: enumValue.codeKey,
                value:
                  parseInt(enumValue.codeVal, 10).toString() === enumValue.codeVal
                    ? parseInt(enumValue.codeVal, 10)
                    : enumValue.codeVal,
              }
            })
          })
        })
      )
    },
    /** 任务跳转卡券 */
    couponItemType: '',
    updateCouponItemType: type =>
      set(
        produce((store: IStore) => {
          store.couponItemType = type
        })
      ),
  }
}

const baseWelfareCenterStore = create<IStore>(getStore)

const useWelfareCenterStore = createTrackedSelector(baseWelfareCenterStore)

export { useWelfareCenterStore, baseWelfareCenterStore }
