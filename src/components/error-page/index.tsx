import LazyImage, { Type } from '@/components/lazy-image'
import { t } from '@lingui/macro'
import { oss_svg_image_domain_address } from '@/constants/oss'

export function ErrorPage({ is404, errorInfo }: { is404: boolean; errorInfo?: string }) {
  if (is404) {
    return (
      <div className="flex justify-center items-center mt-52 mb-44">
        <LazyImage
          whetherManyBusiness
          src={`${oss_svg_image_domain_address}icon_default_404`}
          imageType={Type.png}
          imageName={'404~'}
          hasTheme
          whetherPlaceholdImg={false}
        />
      </div>
    )
  }
  return (
    <div className="flex justify-center items-center mt-52 mb-44">
      <LazyImage
        src={`${oss_svg_image_domain_address}icon_default_load_fail`}
        imageType={Type.png}
        imageName={t`user.pageContent.title_04`}
        hasTheme
        whetherPlaceholdImg={false}
        whetherManyBusiness
      />
    </div>
  )
}
