import { create } from 'zustand'

import { createTrackedSelector } from 'react-tracked'
import produce from 'immer'
import { devtools } from 'zustand/middleware'

type TLayoutStore = ReturnType<typeof getStore>

function getStore(set) {
  return {
    codeDictMap: null as unknown as Record<string, string>,
    setCodeDictMap: codeDict =>
      set(
        produce((draft: TLayoutStore) => {
          draft.codeDictMap = codeDict
        })
      ),
  }
}
const baseVipStore = create(devtools(getStore, { name: 'vip-store' }))

const useVipStore = createTrackedSelector(baseVipStore)

export { useVipStore, baseVipStore }
