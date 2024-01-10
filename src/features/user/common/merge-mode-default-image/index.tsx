import { oss_merge_mode_image_domain_address } from '@/constants/oss'
import LazyImage, { Type } from '@/components/lazy-image'
import styles from './index.module.css'

interface MergeModeDefaultImageProps {
  /** 链接地址 */
  src?: string
  /** 是否有主题色 */
  hasTheme?: boolean
  /** 图片类型 */
  imageType?: Type
}

export function MergeModeDefaultImage({ src, hasTheme, imageType }: MergeModeDefaultImageProps) {
  return (
    <LazyImage
      className={`merge-mode-default-image ${styles.scoped}`}
      src={src || `${oss_merge_mode_image_domain_address}merge_mode_not_data`}
      hasTheme={hasTheme || true}
      imageType={imageType || Type.png}
    />
  )
}

export const MergeModeDefaultImageSrc = `${oss_merge_mode_image_domain_address}merge_mode_not_data`
