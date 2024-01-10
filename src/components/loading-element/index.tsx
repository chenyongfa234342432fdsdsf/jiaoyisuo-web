import { oss_svg_image_domain_address } from '@/constants/oss'
import { getMergeModeStatus } from '@/features/user/utils/common'
import DynamicLottie from '../dynamic-lottie'

let jsonData = 'loading-element'

function transformJsonData(data) {
  data.assets[0].u = oss_svg_image_domain_address
  data.assets[0].p = `default-loading.png`

  return data
}

function LoadingElement() {
  const isMergeMode = getMergeModeStatus()
  if (isMergeMode) jsonData = 'merge-mode-loading-element'
  return (
    <div>
      <DynamicLottie
        {...(!isMergeMode && { transformJsonData })}
        animationData={jsonData}
        loop
        style={isMergeMode ? { width: '100px', height: '100px' } : { width: '30px', height: '30px' }}
      />
    </div>
  )
}
export default LoadingElement
