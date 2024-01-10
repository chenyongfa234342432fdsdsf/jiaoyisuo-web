import { getV1MemberVipBaseAvatarListApiRequest } from '@/apis/vip'
import { getCacheAvatarFrames, setCacheAvatarFrames } from '@/helper/cache/vip'
import { YapiGetV1MemberVipBaseAvatarListData } from '@/typings/yapi/MemberVipBaseAvatarListV1GetApi'
import { useRequest } from 'ahooks'
import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'

export function useGetAvatarFrames() {
  const [frames, setframes] = useState<YapiGetV1MemberVipBaseAvatarListData[] | null>(null)

  const { loading, runAsync } = useRequest(getV1MemberVipBaseAvatarListApiRequest, { manual: true })

  const fetchApi = () => {
    setframes([])
    runAsync({}).then(res => {
      if (res?.data) {
        setframes(res.data)
      } else setframes(null)
    })
  }

  useEffect(() => {
    if (frames !== null) return

    fetchApi()
  }, [])

  return { frames, fetchApi, loading }
}
