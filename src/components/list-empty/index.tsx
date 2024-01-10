/**
 * 列表空数据
 */
import { t } from '@lingui/macro'
import { Empty } from '@nbit/arco'
import Icon from '@/components/icon'
import { MergeModeDefaultImage } from '@/features/user/common/merge-mode-default-image'
import { baseCommonStore } from '@/store/common'
import { oss_svg_image_domain_address } from '@/constants/oss'
import styles from './index.module.css'
import LazyImage, { Type } from '../lazy-image'

interface ListEmptyProps {
  imageName?: string
  text?: string | React.ReactNode
  loading?: boolean
  className?: string
}

function ListEmpty(props: ListEmptyProps) {
  const { imageName, text, loading = false, className } = props
  if (loading) return null

  const { isMergeMode } = baseCommonStore.getState()

  return (
    <Empty
      className={className || styles.scoped}
      icon={
        isMergeMode ? (
          <MergeModeDefaultImage />
        ) : (
          <LazyImage
            className="nb-icon-png"
            whetherManyBusiness
            hasTheme
            imageType={imageName ? Type.svg : Type.png}
            src={`${oss_svg_image_domain_address}${imageName || 'icon_default_no_order'}`}
          />
        )
      }
      description={text || t`help.center.support_05`}
    />
  )
}
export default ListEmpty
