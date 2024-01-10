import { create } from 'zustand'

import { createTrackedSelector } from 'react-tracked'
import produce from 'immer'
import { TlayoutProps } from '@/typings/api/layout'
import { extractFooterData } from '@/helper/layout/footer'
import { extractHeaderData } from '@/helper/layout/header'
import { devtools } from 'zustand/middleware'
import { YapiGetV1HomeWebsiteGetData } from '@/typings/yapi/HomeWebsiteGetDataV1GetApi'
import { YapiGetV1ChainStarGetNavigationListNavigationBarListData } from '@/typings/yapi/ChainStarGetNavigationV1GetApi'

type TLayoutStore = ReturnType<typeof getStore>

function getStore(set) {
  return {
    layoutProps: {} as YapiGetV1HomeWebsiteGetData | TlayoutProps | undefined,
    setLayoutProps: (layoutProps?: YapiGetV1HomeWebsiteGetData | TlayoutProps | undefined) =>
      set(() => {
        if (layoutProps) {
          return { layoutProps }
        }
        return {}
      }),
    navigationMenu: [] as YapiGetV1ChainStarGetNavigationListNavigationBarListData[],
    setNavigationMenu: (data: YapiGetV1ChainStarGetNavigationListNavigationBarListData[]) =>
      set(
        produce((draft: TLayoutStore) => {
          draft.navigationMenu = data
        })
      ),
    footerData: undefined as ReturnType<typeof extractFooterData>,
    setFooterData: data =>
      set(
        produce((draft: TLayoutStore) => {
          draft.footerData = data
        })
      ),

    headerData: { businessName: '' } as ReturnType<typeof extractHeaderData>,
    setHeaderData: data =>
      set(
        produce((draft: TLayoutStore) => {
          draft.headerData = data
        })
      ),
    columnsDataByCd: {} as Record<string, any>,
    setColumnsDataByCd: data =>
      set(
        produce((draft: TLayoutStore) => {
          draft.columnsDataByCd = data
        })
      ),
    guidePageBasicWebInfo: {} as any,
    setGuidePageBasicWebInfo: data =>
      set(
        produce((draft: TLayoutStore) => {
          draft.guidePageBasicWebInfo = data
        })
      ),
  }
}
const baseLayoutStore = create(devtools(getStore, { name: 'layout-store' }))

const useLayoutStore = createTrackedSelector(baseLayoutStore)

export { useLayoutStore, baseLayoutStore }
