import { create } from 'zustand'
import { createTrackedSelector } from 'react-tracked'
import produce from 'immer'
import { devtools } from 'zustand/middleware'
import { getV1AgentAbnormalApiRequest } from '@/apis/agent'
import { YapiGetV1AgentAbnormalDataReal } from '@/typings/api/agent-old/invite'

type IStore = ReturnType<typeof getStore>

function getStore(set) {
  return {
    userInBlackListInfo: {} as YapiGetV1AgentAbnormalDataReal,
    fetchUserInBlackList() {},
    clearBlackList() {
      set(
        produce((draft: IStore) => {
          draft.userInBlackListInfo = {}
        })
      )
    },
    // agentCurrencyInfo: <AgentCurrencyInfoResp>{},
    // getAgentCurrencyInfo: async () => {
    //   const res = await getAgentCurrency({})
    //   if (res.isOk && res.data) {
    //     set((store: IStore) => {
    //       return produce(store, _store => {
    //         _store.agentCurrencyInfo = res.data as AgentCurrencyInfoResp
    //       })
    //     })
    //   }
    // },
  }
}

const baseAgentStore = create(devtools(getStore, { name: 'agent-store' }))

const useAgentStore = createTrackedSelector(baseAgentStore)

export { useAgentStore, baseAgentStore }
