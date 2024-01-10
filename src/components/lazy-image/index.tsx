import { LazyLoadImage, LazyLoadImageProps } from 'react-lazy-load-image-component'
import { ThemeEnum } from '@/constants/base'
import classNames from 'classnames'
import { getIsManyMerchantMode, oss_svg_image_domain_address } from '@/constants/oss'
import { useMemo, useState } from 'react'
import { useCommonStore } from '@/store/common'
import { fastUrlUtils } from '@nbit/utils'
import { businessId } from '@/helper/env'
import { getBConfig } from '@/constants/business-users'
import styles from './index.module.css'

const { getFastUrl, injectThemeImgUrl } = fastUrlUtils

type ImageSrc = LazyLoadImageProps & {
  src: string
  width?: number
  height?: number
  imageName?: string
  hasTheme?: boolean
  imageType?: Type
  className?: string
  imgClassName?: string
  alt?: string
  title?: string
  radius?: boolean
  whetherManyBusiness?: boolean
  /** 加载加载之后需要执行的回调函数 * */
  afterLoad?: () => void
  /**  在占位符被图像元素替换之前调用的函数。* */
  beforeLoad?: () => void
  /** 加载加载错误需要执行的回调函数 * */
  onError?: () => void
  /** 是否需要占位图片 * */
  whetherPlaceholdImg?: boolean
  /**  以像素为单位的阈值。因此，图像在出现在视口中之前就开始加载。* */
  threshold?: number
  /**  类名 * */
  wrapperClassName?: string
  /**
   * render image with original size
   */
  renderOriginalSize?: boolean
}

export enum Type {
  svg = '.svg',
  png = '.png',
}

type ImgDimension = {
  width?: number
  height?: number
}

const svgAddress = oss_svg_image_domain_address // 渐变色 svg

function LazyImage(props: ImageSrc) {
  const {
    src,
    radius,
    hasTheme,
    className,
    imageName,
    whetherPlaceholdImg = false,
    whetherManyBusiness = false,
    imageType,
    renderOriginalSize = false,
    imgClassName,
    ...rest
  } = props

  const [dimensions, setDimensions] = useState<ImgDimension>({})

  const commonState = useCommonStore()

  const themeName = commonState.theme === ThemeEnum.dark ? '_black' : '_white'

  const svgHref = `${svgAddress}icon_default_load_fail${themeName}${Type.png}`
  /** 加载失败或加载时的图像 src * */
  const placeholderSrc = whetherPlaceholdImg ? (
    <img
      className="placeholder-img"
      src={svgHref}
      alt=""
      width={renderOriginalSize ? dimensions.width : rest.width}
      height={renderOriginalSize ? dimensions.height : rest.height}
    />
  ) : undefined

  /**
   * retrieve img original size
   */
  const onImgLoad = useMemo(
    () =>
      ({ target }: { target: HTMLImageElement }) => {
        setDimensions({
          width: target.naturalWidth,
          height: target.naturalHeight,
        })
        return true
      },
    []
  )

  const href = useMemo(() => {
    if (typeof src !== 'string') {
      console.error('LazyImage: 传入的 src 非字符串请检查', src)
      return src
    }
    let _src = getFastUrl(src)
    // check is many merchant
    if (whetherManyBusiness && getIsManyMerchantMode()) {
      _src = _src.replace(`${getBConfig().ossFolder}/web/image/`, `/web/business/${businessId}/business-img/`)
    }
    if (hasTheme) {
      if (imageType) {
        return injectThemeImgUrl(`${_src}${imageType}`, themeName)
      }
      return injectThemeImgUrl(`${_src}`, themeName)
    }
    if (imageType) {
      return `${_src}${imageType}`
    }
    return `${_src}`
  }, [src, imageType, hasTheme, themeName, whetherManyBusiness])

  if (!src) {
    // fix：api 加载的时候图片内容，如果图片的地址为空，则直接返回占位。
    return (
      <span
        style={{
          width: rest.width || 0,
          height: rest.height || 0,
        }}
      ></span>
    )
  }

  const placeholder = placeholderSrc ? { placeholder: placeholderSrc } : {}
  return (
    <div className={classNames(styles.scoped, className, radius ? 'lazy-radius' : '')}>
      <LazyLoadImage
        className={imgClassName}
        {...rest}
        src={href}
        {...placeholder}
        onLoad={renderOriginalSize ? onImgLoad : ((() => {}) as any)}
        width={renderOriginalSize ? dimensions.width : rest.width}
        height={renderOriginalSize ? dimensions.height : rest.height}
      />
      <label>{imageName || ''}</label>
    </div>
  )
}
export default LazyImage
