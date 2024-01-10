import Icon from '@/components/icon'
import { ReactNode, useState } from 'react'
import { Message, Switch } from '@nbit/arco'
import AvatarUploader from '@/features/user/common/avatar-uploader'
import { useUserStore } from '@/store/user'
import { useVipSettingStore } from '@/store/vip/vip-user-setting'
import { t } from '@lingui/macro'
import styles from './index.module.css'
import { VipSettingIntroModal, VipSettingNicknameModal } from '../vip-setting-modals'

function VipTierSettingCell({
  title,
  subtitle,
  description,
  button,
  icon,
  Modal,
}: {
  title: string
  subtitle: string
  description: string | ReactNode
  button: ReactNode
  icon: ReactNode
  Modal?: typeof VipSettingNicknameModal
}) {
  const [modalVisible, setmodalVisible] = useState(false)

  return (
    <>
      <div className={styles['vip-tier-setting-cell']}>
        <div className="flex flex-row">
          {icon}
          <div className="ml-4">
            <div className="text-base font-medium">{title}</div>
            <span className="text-sm text-text_color_02">{subtitle}</span>
          </div>
        </div>
        <div className="text-text_color_01 font-medium">{description}</div>
        <span className="text-brand_color cursor-pointer" {...(Modal && { onClick: () => setmodalVisible(true) })}>
          {button}
        </span>
      </div>
      {/* destroy modal on exit */}
      {Modal && modalVisible && <Modal visible={modalVisible} setvisible={setmodalVisible} />}
    </>
  )
}

function VipTierSetting() {
  const userInfo = useUserStore()?.userInfo || {}
  const { nickName, introduction } = userInfo || {}

  const { vipSettingConfig, setVipSettingConfig } = useVipSettingStore()

  const settings = () => {
    return [
      {
        title: t`user.account_security.modify_username_04`,
        subtitle: t`features_vip_vip_tier_setting_index_mlvhyz6pww`,
        description: nickName,
        icon: <Icon name="a-icon_personal_man" hasTheme />,
        button: <span>{t`assets.common.edit`}</span>,
        Modal: VipSettingNicknameModal,
      },
      {
        title: t`features_vip_vip_tier_setting_index_88afkk9wzd`,
        subtitle: t`features_vip_vip_tier_setting_index_va7xgwlfgw`,
        description: introduction,
        icon: <Icon name="a-icon_personal_introduction" hasTheme />,
        button: <span>{t`assets.common.edit`}</span>,
        Modal: VipSettingIntroModal,
      },
      {
        title: t`features_vip_vip_tier_setting_index_zn9hlcslnf`,
        subtitle: t`features_vip_vip_tier_setting_index_as42qa2e5v`,
        description: !vipSettingConfig.watchList ? (
          <>
            <Icon className="mr-2 !text-sm" name="icon_fail" />
            <span>{t`user.field.reuse_48`}</span>
          </>
        ) : (
          <>
            <Icon className="mr-2 !text-sm" name="login_satisfied" />
            <span>{t`features/trade/trade-order/base-2`}</span>
          </>
        ),
        icon: <Icon name="a-icon_personal_attention" hasTheme />,
        button: (
          <Switch
            checked={vipSettingConfig.watchList}
            onChange={flag => {
              Message.success(t`features_vip_vip_tier_setting_index_8igtnwnskm`)
              setVipSettingConfig({ watchList: flag })
            }}
          />
        ),
      },
      {
        title: t`features_vip_vip_tier_setting_index_6vfdcvse1k`,
        subtitle: t`features_vip_vip_tier_setting_index_3bx8kwxgzx`,
        description: !vipSettingConfig.fanList ? (
          <>
            <Icon className="mr-2 !text-sm" name="icon_fail" />
            <span>{t`user.field.reuse_48`}</span>
          </>
        ) : (
          <>
            <Icon className="mr-2 !text-sm" name="login_satisfied" />
            <span>{t`features/trade/trade-order/base-2`}</span>
          </>
        ),
        icon: <Icon name="a-icon_personal_fans" hasTheme />,
        button: (
          <Switch
            checked={vipSettingConfig.fanList}
            onChange={flag => {
              Message.success(t`features_vip_vip_tier_setting_index_8igtnwnskm`)
              setVipSettingConfig({ fanList: flag })
            }}
          />
        ),
      },
    ]
  }
  return (
    <div className={styles.scoped}>
      <AvatarUploader className={'setting-avatar-upload'} />
      <div className="settings-col">
        {settings()?.map((setting, idx) => (
          <VipTierSettingCell key={idx} {...setting} />
        ))}
      </div>
    </div>
  )
}

export default VipTierSetting
