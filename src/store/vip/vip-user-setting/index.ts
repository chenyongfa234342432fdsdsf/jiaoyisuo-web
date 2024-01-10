import { create } from 'zustand'

import { createTrackedSelector } from 'react-tracked'
import produce from 'immer'
import { devtools } from 'zustand/middleware'
import { YapiGetV1MemberVipBaseInfoApiResponse } from '@/typings/yapi/MemberVipBaseInfoV1GetApi'

type TLayoutStore = ReturnType<typeof getStore>

function getStore(set) {
  return {
    userConfig: null as YapiGetV1MemberVipBaseInfoApiResponse | null,
    setConfig: config =>
      set(
        produce((draft: TLayoutStore) => {
          draft.userConfig = config
        })
      ),
    vipSettingConfig: {
      watchList: false,
      fanList: false,
    },
    setVipSettingConfig: config => {
      set(
        produce((draft: TLayoutStore) => {
          draft.vipSettingConfig = { ...draft.vipSettingConfig, ...config }
        })
      )
    },
  }
}
const baseVipSettingStore = create(devtools(getStore, { name: 'vip-setting-store' }))

const useVipSettingStore = createTrackedSelector(baseVipSettingStore)

export { useVipSettingStore, baseVipSettingStore }
