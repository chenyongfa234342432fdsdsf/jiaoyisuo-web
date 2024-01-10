import { enabledStatusEnum, showStatusEnum } from '@/constants/layout/basic-web-info'
import { useUserStore } from '@/store/user'

/**
 * component hide or display based on Web guide page api status set in console
 */
function ShouldGuidePageComponentDisplay({ children, showStatusCd, enabledInd }) {
  const { isLogin } = useUserStore()

  if (!showStatusCd || !enabledInd) return children

  if (enabledInd === enabledStatusEnum.isDisabled) return <div></div>

  if (showStatusCd === showStatusEnum.login) return isLogin && children

  if (showStatusCd === showStatusEnum.notLogin) return !isLogin && children

  return children
}

export default ShouldGuidePageComponentDisplay
