import { create } from 'zustand'
import { createTrackedSelector } from 'react-tracked'
import produce from 'immer'
import { devtools } from 'zustand/middleware'
import dayjs from 'dayjs'

type TStore = ReturnType<typeof getStore>

function getStore(set) {
  return {
    legendMap: {},
    setLegendMap: (key, value) =>
      set(
        produce((draft: TStore) => {
          draft.legendMap = {
            ...draft.legendMap,
            [key]: value,
          }
        })
      ),

    resetLegendMap(key?: string) {
      set(
        produce((draft: TStore) => {
          if (key) delete draft.legendMap?.[key]
          else draft.legendMap = {}
        })
      )
    },
  }
}

const baseAgentChartStore = create(devtools(getStore, { name: 'market-agent-chart-store' }))

const useAgentChartStore = createTrackedSelector(baseAgentChartStore)

export { useAgentChartStore, baseAgentChartStore }
