import { t } from '@lingui/macro'
import classNames from 'classnames'
import LazyImage, { Type } from '@/components/lazy-image'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { useCommonStore } from '@/store/common'
import { MergeModeDefaultImage } from '@/features/user/common/merge-mode-default-image'
import { businessId } from '@/helper/env'
import styles from './index.module.css'

type NoDataImageType = {
  name?: string
  size?: string
  footerText?: string
  className?: string
  whetherManyBusiness?: boolean
}

function NoDataImage({ size, name, className, footerText, whetherManyBusiness }: NoDataImageType) {
  const { isMergeMode } = useCommonStore()
  return (
    <div className={classNames(styles.scoped, className, 'no-data-content')}>
      <div className="no-data">
        {isMergeMode ? (
          <MergeModeDefaultImage />
        ) : (
          <LazyImage
            hasTheme
            // name === undefined set whetherManyBusiness to true due to no_data
            whetherManyBusiness={!name ? true : whetherManyBusiness}
            className={`${size || 'w-44 h-44'}`}
            imageType={Type.png}
            src={`${oss_svg_image_domain_address}${name || 'icon_default_no_order'}`}
          />
        )}
        <div className="no-data-text">{footerText || t`trade.c2c.noData`}</div>
      </div>
    </div>
  )
}
export default NoDataImage
