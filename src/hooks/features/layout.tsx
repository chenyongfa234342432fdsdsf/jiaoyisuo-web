import { getV1ChainStarGetNavigationApiRequest, getV1GuideMapH5GetApiRequest } from '@/apis/layout'
import { ahookRequestSWRConfig } from '@/constants/market'
import { cacheKeyGuidePage, cacheKeyHeaderMenu } from '@/helper/cache/layout'
import { useLayoutStore } from '@/store/layout'
import { useMount, useRequest } from 'ahooks'
import { isEmpty } from 'lodash'

export default function useApiHeaderMenu() {
  const store = useLayoutStore()

  const { run } = useRequest(
    async () => {
      getV1ChainStarGetNavigationApiRequest({}).then(res => {
        if (!res.isOk || !res.data?.navigationBarList) return
        store.setNavigationMenu(res.data.navigationBarList || [])
      })
    },
    {
      manual: true,
      retryCount: 1,
      cacheKey: cacheKeyHeaderMenu,
      ...ahookRequestSWRConfig,
    }
  )

  useMount(() => {
    if (isEmpty(store.navigationMenu)) {
      run()
    }
  })

  return store.navigationMenu
}

// get dynamic home page config from api
export function useGuidePageInfo() {
  const store = useLayoutStore()

  const { run } = useRequest(
    async () => {
      getV1GuideMapH5GetApiRequest().then(res => {
        if (res.isOk) {
          const formatted = res.data.reduce((p, c) => {
            const key = Object.keys(c)[0]
            const value = c[key]
            p[key] = value
            return p
          }, {})
          store.setGuidePageBasicWebInfo(formatted)
        }
      })
    },
    {
      manual: true,
      retryCount: 1,
      cacheKey: cacheKeyGuidePage,
      ...ahookRequestSWRConfig,
    }
  )
  useMount(() => {
    if (isEmpty(store.guidePageBasicWebInfo)) {
      run()
    }
  })

  return store.guidePageBasicWebInfo
}
