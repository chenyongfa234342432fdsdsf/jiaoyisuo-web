import { oss_domain_address } from '@/constants/oss'
import { getThemeSuffix } from '@/helper/common'
import axios from 'axios'
import Lottie, { LottieComponentProps } from 'lottie-react'
import { useEffect, useState } from 'react'

const jsonCache: Record<string, any> = {}

function DynamicLottie({
  animationData,
  onAnimationDataLoaded,
  hasTheme,
  transformJsonData,
  ...rest
}: Exclude<LottieComponentProps, 'animationData'> & {
  animationData:
    | (() => Promise<{
        default: any
      }>)
    | string
  onAnimationDataLoaded?: (data: any) => void
  hasTheme?: boolean
  transformJsonData?: (data: any) => any
}) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const getData =
      typeof animationData === 'function'
        ? animationData
        : async () => {
            const url = `${oss_domain_address}/json/${animationData}${hasTheme ? getThemeSuffix() : ''}.json`
            if (jsonCache[url]) {
              return {
                default: jsonCache[url],
              }
            }
            const res = await axios.get(url)
            jsonCache[url] = res.data
            return {
              default: res.data,
            }
          }
    getData().then(res => {
      if (transformJsonData) {
        res.default = transformJsonData(res.default)
      }
      onAnimationDataLoaded && onAnimationDataLoaded(res.default)
      setData(res.default)
    })
  }, [animationData])

  if (!data) return null

  return data && <Lottie animationData={data} {...rest} />
}

export default DynamicLottie
