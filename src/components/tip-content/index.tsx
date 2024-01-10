import Icon from '@/components/icon'
import { oss_svg_domain_address, oss_svg_image_domain_address } from '@/constants/oss'
import styles from './index.module.css'
import LazyImage from '../lazy-image'

function TipContent({ children }) {
  return (
    <div>
      <div className="flex flex-col items-center">
        <div className="mb-6">
          <LazyImage
            className="nb-icon-png"
            src={`${oss_svg_image_domain_address}msg_tips.png`}
            width={36}
            height={36}
          />
        </div>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
export const modalWrapperClassName = styles['tip-content-modal-wrapper']

export default TipContent
