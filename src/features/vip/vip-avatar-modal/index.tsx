import { MouseEventHandler, useEffect, useRef, useState } from 'react'
import { useRequest } from 'ahooks'
import {
  getV1MemberVipBaseAvatarListApiRequest,
  getV1MemberVipBaseInfoApiRequest,
  postV1MemberBaseExtendInfoApiRequest,
  postV1MemberVipBaseDressAvatarApiRequest,
} from '@/apis/vip'
import { YapiGetV1MemberVipBaseAvatarListData } from '@/typings/yapi/MemberVipBaseAvatarListV1GetApi'
import LazyImage from '@/components/lazy-image'
import { Button, Message, Modal, Spin } from '@nbit/arco'
import classNames from 'classnames'
import { getVipAvatarFrameIcon } from '@/constants/vip'
import UserAvatar from '@/features/user/common/user-avatar'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { t } from '@lingui/macro'
import { useVipUserInfo } from '@/hooks/features/vip/vip-perks'
import { isEmpty } from 'lodash'
import { useGetAvatarFrames } from '@/hooks/features/vip/vip-avatar'
import { useCommonStore } from '@/store/common'
import { ThemeEnum } from '@nbit/chart-utils'
import styles from './index.module.css'

function VipAvatarFrame(
  props: YapiGetV1MemberVipBaseAvatarListData & {
    onclick?: MouseEventHandler<HTMLDivElement>
    className?: string
  }
) {
  const { levelCode, vipIcon, allowDress, dressing, onclick, className } = props
  return (
    <div className={`${styles['vip-avatar-frame']} ${className}`} {...(onclick && { onClick: e => onclick(e) })}>
      {dressing && <span className="tag">{t`features_vip_vip_avatar_modal_index_kv4yoqalgr`}</span>}
      {vipIcon && <LazyImage width={78} height={78} className="frame" src={vipIcon} />}
      <span className="mx-auto text-sm text-text_color_02">{levelCode}</span>
    </div>
  )
}

function VipAvatarModal({ visible, setvisible }: { visible: boolean; setvisible: (state: boolean) => void }) {
  const [selectedFrame, setselectedFrame] = useState<YapiGetV1MemberVipBaseAvatarListData | null>()

  const { fetchApi } = useVipUserInfo()

  const { frames, fetchApi: fetchFramesApiAsync, loading } = useGetAvatarFrames()

  const { theme } = useCommonStore()

  const onConfirm = () => {
    if (selectedFrame?.dressing) {
      postV1MemberVipBaseDressAvatarApiRequest({ dressLevelCode: null as unknown as string }).then(res => {
        if (res.isOk && res.data) {
          Message.success(t`features_vip_vip_avatar_modal_index_gzyrwgyb_x`)
          fetchApi()
          fetchFramesApiAsync()
          setselectedFrame(null)
          setvisible(false)
        } else Message.error(t`features_vip_vip_avatar_modal_index_cricgwtulg`)
      })
      return
    }
    selectedFrame?.levelCode &&
      postV1MemberVipBaseDressAvatarApiRequest({ dressLevelCode: selectedFrame.levelCode }).then(res => {
        if (res.isOk && res.data) {
          Message.success(t`features_vip_vip_avatar_modal_index_3mqkxp1_ju`)
          fetchApi()
          fetchFramesApiAsync()
          setvisible(false)
        } else Message.error(t`features_vip_vip_avatar_modal_index_fzg7fw_428`)
      })
  }

  const renderBtnText = () => {
    if (selectedFrame?.dressing) return t`features_vip_vip_avatar_modal_index_c3yw7mdkup`
    return selectedFrame?.allowDress
      ? t`features_vip_vip_avatar_modal_index_nbrcpxjlqi`
      : t({
          id: 'features_vip_vip_avatar_modal_index_hwdz2auuin',
          values: { 0: selectedFrame?.levelCode },
        })
  }

  return (
    <Modal
      className={styles['vip-avatar-modal']}
      title={t`features_vip_vip_avatar_modal_index_3eelptaj8l`}
      visible={visible}
      onCancel={() => setvisible(false)}
      footer={
        <Button
          disabled={!selectedFrame?.allowDress}
          onClick={() => {
            onConfirm()
          }}
          type={!selectedFrame?.dressing ? 'primary' : 'default'}
          long
        >
          {renderBtnText()}
        </Button>
      }
    >
      <div
        className="modal-header"
        style={{
          backgroundImage:
            theme === ThemeEnum.dark
              ? `url(${oss_svg_image_domain_address}vip/image_avatar_frame_bg_black.png)`
              : `url(${oss_svg_image_domain_address}vip/image_avatar_frame_bg.png)`,
        }}
      >
        <UserAvatar hasFrame setFrameLvl={selectedFrame?.levelCode} />
      </div>
      <Spin loading={loading}>
        <div className="grid grid-cols-4 gap-4 m-8">
          {frames?.map((avatar, idx) => (
            <VipAvatarFrame
              className={classNames({ 'active-frame': selectedFrame?.levelCode === avatar.levelCode })}
              key={`${idx}frame`}
              {...avatar}
              onclick={() => setselectedFrame(avatar)}
            />
          ))}
        </div>
      </Spin>
    </Modal>
  )
}

export default VipAvatarModal
