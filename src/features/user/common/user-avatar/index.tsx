import LazyImage from '@/components/lazy-image'
import { useUserStore } from '@/store/user'
import { ReactNode, useEffect, useState } from 'react'
import { useVipSettingStore } from '@/store/vip/vip-user-setting'
import { getVipAvatarFrameIcon } from '@/constants/vip'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { useVipUserInfo } from '@/hooks/features/vip/vip-perks'
import { useGetAvatarFrames } from '@/hooks/features/vip/vip-avatar'
import { isEmpty } from 'lodash'
import styles from './index.module.css'

function UserAvatar({
  tagIcon,
  width = 90,
  height = 90,
  hasFrame,
  setFrameLvl,
}: {
  tagIcon?: ReactNode
  width?: number
  height?: number
  hasFrame?: boolean
  setFrameLvl?: string
}) {
  const userInfo = useUserStore()?.userInfo
  const { userConfig, fetchApi } = useVipUserInfo()
  const { frames } = useGetAvatarFrames()

  const [selectedFrame, setselectedFrame] = useState('')

  useEffect(() => {
    fetchApi()
  }, [])

  useEffect(() => {
    if (setFrameLvl !== undefined || setFrameLvl !== null) {
      const selected = frames?.find(frame => frame.levelCode === setFrameLvl)
      const frame = selected?.vipIcon || ''
      setselectedFrame(frame)
    }
  }, [setFrameLvl, frames])

  return (
    <div className={styles.scoped} style={{ width, height }}>
      {hasFrame &&
        (userConfig?.avatarIcon || setFrameLvl) &&
        (setFrameLvl ? (
          <LazyImage width={width} height={height} className="user-avatar-frame" src={selectedFrame} />
        ) : (
          <LazyImage width={width} height={height} className="user-avatar-frame" src={userConfig?.avatarIcon || ''} />
        ))}
      <LazyImage
        className="user-avatar"
        width={width}
        height={height}
        src={userInfo?.avatarPath || `${oss_svg_image_domain_address}vip/image_vip_no_avatar.png`}
        hasTheme={!userInfo?.avatarPath}
      />
      {tagIcon && <span className="avatar-status-tag">{tagIcon}</span>}
    </div>
  )
}

export default UserAvatar
