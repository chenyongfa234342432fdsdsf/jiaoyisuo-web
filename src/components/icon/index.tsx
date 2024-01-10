import { Icon as ArcoIcon } from '@nbit/arco'
import classNames from 'classnames'
import { ThemeEnum } from '@/constants/base'
import { useCommonStore } from '@/store/common'
import { oss_merge_mode_svg_domain_address, oss_svg_domain_address } from '@/constants/oss'
import { useEffect, useMemo, useState } from 'react'
import Styles from './index.module.css'

const brandColor = 'brand'
let IconFont = ArcoIcon.addFromIconFontCn({
  src: oss_svg_domain_address,
})

interface IIcon {
  className?: string
  style?: any
  spin?: boolean
  hoverText?: boolean | typeof brandColor
  hover?: boolean
  isHoverHasTheme?: boolean
  name: string
  onClick?: any
  hasTheme?: boolean
  /** 是否禁止 cursor:pointer */
  noPointer?: boolean
  /** 图标尺寸 */
  fontSize?: number | string
  width?: number | string
  height?: number | string
}
function Icon(props: IIcon) {
  const { isMergeMode } = useCommonStore()

  useEffect(() => {
    if (isMergeMode)
      IconFont = ArcoIcon.addFromIconFontCn({
        src: oss_merge_mode_svg_domain_address,
      })
  }, [isMergeMode])

  const isBrandColor = props.hoverText === brandColor
  const isTextColor = !isBrandColor && props.hoverText
  const onClick = e => {
    props.onClick && props.onClick(e)
  }
  const commonState = useCommonStore()
  const theme = commonState.theme
  let href = ''

  /** 主题颜色后缀 */
  const themeText = props.hasTheme ? (theme === ThemeEnum.dark ? '_black' : '_white') : ''

  const [isHover, setIsHover] = useState(false)
  /** 图标名称 */
  const iconName = useMemo(() => {
    if (props.hover) {
      if (isHover) {
        // svg name hover  后缀自动补齐
        const _hoverText = props.hover ? '_hover' : ''
        const delThemeName = !props.isHoverHasTheme ? props.name.replace(/_black|_white/, '') : props.name
        const str = !props.isHoverHasTheme
          ? `icon-${delThemeName}${_hoverText}`
          : `icon-${delThemeName}${themeText}${_hoverText}`
        return str
      }
      return `icon-${props.name}${themeText}`
    }
    return `icon-${props.name}${themeText}`
  }, [props.name, props.hover, isHover, props.isHoverHasTheme, themeText])

  function onMouseOver() {
    if (!props.hover) {
      return
    }
    setIsHover(true)
  }
  function onMouseOut() {
    if (!props.hover) {
      return
    }
    setIsHover(false)
  }
  return (
    <div
      className={classNames(Styles.scoped, props.className, 'icon-wrap', {
        'text-brand_color': isBrandColor,
        'text-text_color_01': isTextColor,
        'cursor-pointer': !props.noPointer,
      })}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onFocus={() => 0}
      onBlur={() => 0}
    >
      <IconFont
        className="svg-icon"
        style={props.style}
        type={iconName}
        fontSize={props.fontSize}
        width={props.width}
        height={props.height}
        spin={props.spin}
      />
    </div>
  )
}
export default Icon
