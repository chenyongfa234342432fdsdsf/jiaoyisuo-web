import { ReactNode } from 'react'
import LazyImage, { Type } from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'

interface UserPopUpSuccessContentProps {
  /** 插槽内容 */
  slotContent: ReactNode
  /** 自定义图标 */
  icon?: ReactNode
}

function UserPopUpSuccessContent({ slotContent, icon }: UserPopUpSuccessContentProps) {
  return (
    <div className="user-popup-success">
      <div className="popup-icon">
        {icon || (
          <LazyImage className="nb-icon-png" src={`${oss_svg_image_domain_address}success_icon`} imageType={Type.png} />
        )}
      </div>
      <div className="slot-content">{slotContent}</div>
    </div>
  )
}

export default UserPopUpSuccessContent
