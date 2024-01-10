import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Trigger, Message, Button, Modal } from '@nbit/arco'
import { t } from '@lingui/macro'
import { link } from '@/helper/link'
import { useCopyToClipboard } from 'react-use'
import { getMemberUserLoginOut } from '@/apis/user'
import { removeUserInfo, getUserInfo, removeC2CParamsTipsCache } from '@/helper/cache'
import { removeToken } from '@/helper/auth'
import cn from 'classnames'
import { UserKycTypeEnum } from '@/constants/user'
import { useUserStore } from '@/store/user'
import { usePageContext } from '@/hooks/use-page-context'
import { getMergeModeStatus } from '@/features/user/utils/common'
import Icon from '@/components/icon'
import { oss_svg_image_domain_address } from '@/constants/oss'
import LazyImage, { Type } from '@/components/lazy-image'
import { useInitVipCodeDict, useVipUpgradeConditionsList, useVipUserInfo } from '@/hooks/features/vip/vip-perks'
import { isEmpty } from 'lodash'
import { getDiscountAmt, getVipCdValue, getVipHeaderValue } from '@/helper/vip'
import { formatNumberDecimal } from '@/helper/decimal'
import { useVipSettingStore } from '@/store/vip/vip-user-setting'
import { getVipSettingRoutePath } from '@/helper/route'
import styles from './index.module.css'
import UserAvatar from '../../common/user-avatar'

interface MenuCellListType {
  key: number
  /** 图标 */
  icon: ReactNode
  /** 文字 */
  text: string
  /** 是否跳转 */
  isLink: boolean
  /** 路由地址 */
  link?: string
  /** 弹窗类型 */
  type?: string
}

enum aboutEnum {
  about = 'about',
}

enum vipCenterEnum {
  vipCenter = 'vipCenter',
}

function MenuCell({ onLink, isMergeMode }) {
  const store = useUserStore()
  const userInfo = store.userInfo || getUserInfo()
  const { userConfig } = useVipUserInfo()
  const rates = {
    key: 1,
    icon: <Icon name="icon_personal_public_percentage" fontSize={24} hasTheme />,
    text: t`features_user_personal_center_menu_navigation_index_rt7qwvslbp`,
    isLink: true,
    link: '/vip/vip-tier',
    rightText: null,
  }

  const vipCenter = {
    key: 2,
    icon: <Icon name="icon_personal_public_vip" fontSize={24} hasTheme />,
    text: t`features_user_personal_center_menu_navigation_index_kgmvkfruho`,
    isLink: userInfo?.kycType !== UserKycTypeEnum.notCertified || !userInfo?.vipKycLimit,
    link: '/vip/vip-center',
    rightText: (
      <span className="text-text_color_03 text-xs">
        {t`features_user_personal_center_menu_navigation_index_fqrtyf74pe`} {userConfig?.levelCode || ''}
      </span>
    ),
    type: vipCenterEnum.vipCenter,
  }

  const kycAuthentication = {
    key: 3,
    icon: <Icon name="icon_personal_public_identity" fontSize={24} hasTheme />,
    text: t`constants_agent_invite_index_vzl3j_iht7`,
    isLink: true,
    link: '/kyc-authentication-homepage',
    rightText: (
      <div
        className={cn(
          `tag ${userInfo?.kycType === UserKycTypeEnum.notCertified ? 'off' : 'on'}`,
          'cursor-pointer',
          'kyc-tag'
        )}
      >
        <LazyImage
          className="nb-icon-png"
          src={`${oss_svg_image_domain_address}${
            userInfo?.kycType === UserKycTypeEnum.notCertified
              ? 'user_kyc_not_verified.png'
              : 'user_safety_label_activated.svg'
          }`}
          width={8}
          height={8}
        />
        <label className="cursor-pointer">
          {userInfo?.kycType === UserKycTypeEnum.notCertified && t`user.personal_center_03`}
          {userInfo?.kycType === UserKycTypeEnum.standardCertification &&
            t`features_user_personal_center_menu_navigation_index_5101265`}
          {userInfo?.kycType === UserKycTypeEnum.advancedCertification &&
            t`features_user_personal_center_menu_navigation_index_5101266`}
          {userInfo?.kycType === UserKycTypeEnum.enterpriseCertification &&
            t`features/user/personal-center/profile/index-17`}
        </label>
      </div>
    ),
  }

  const accountSecurity = {
    key: 4,
    icon: <Icon name="user_down_security" fontSize={24} hasTheme />,
    text: t`user.personal_center_09`,
    isLink: true,
    link: '/personal-center/account-security',
    rightText: null,
  }

  const settings = {
    key: 5,
    icon: <Icon name="user_anatar_site" fontSize={24} hasTheme />,
    text: t`features_trade_trade_setting_index_2510`,
    isLink: true,
    link: '/personal-center/settings',
    rightText: null,
  }

  const menuList = isMergeMode ? [] : [rates, vipCenter, kycAuthentication, accountSecurity, settings]

  return (
    <>
      {menuList.map(v => {
        if ((v as any).type === vipCenterEnum.vipCenter && !userInfo?.showVipMenu) return null
        return (
          <div className="cell" key={v.key} onClick={() => onLink(v)}>
            <div className="cell-wrap">
              <div className="icon">{v.icon}</div>
              <div className="text">
                <label className="text-sm">{v.text}</label>
              </div>
              {v?.rightText && <span className="suffix-text">{v.rightText}</span>}
            </div>
          </div>
        )
      })}
    </>
  )
}

function MenuHeader({ onClick, isMergeMode }) {
  const store = useUserStore()
  const userInfo = store.userInfo || getUserInfo()
  const [state, copyToClipboard] = useCopyToClipboard()

  const handleCopy = (key: string) => {
    copyToClipboard(key)
    state.error ? Message.error(t`user.secret_key_02`) : Message.success(t`user.secret_key_01`)
  }

  const handleSwitch = async () => {
    const res = await getMemberUserLoginOut({})
    res.isOk && Message.success(t`features_user_personal_center_menu_navigation_index_2443`)
    removeUserInfo()
    await removeToken()
    removeC2CParamsTipsCache()
    link('/login')
  }

  return (
    <div className="header">
      <div className="flex flex-row space-x-2">
        {/* avatar */}
        <UserAvatar width={40} height={40} hasFrame />

        <div>
          <div className="name" onClick={onClick}>
            <label className="text-base font-medium">{userInfo?.nickName || t`user.personal_center_01`}</label>
            <Icon name="next_arrow" hasTheme fontSize={10} />
          </div>

          <div className="uid">
            <label>UID: {userInfo?.uid}</label>
            <Icon name="copy" hasTheme fontSize={12} onClick={() => handleCopy(userInfo?.uid)} />
          </div>
        </div>
      </div>
      <Button long className={'switch-btn'} style={{ height: 30 }} onClick={() => handleSwitch()}>
        {t`features_user_personal_center_menu_navigation_index_wtuuy1axab`}
      </Button>
      <MenuVipDiscountBar />
    </div>
  )
}

function MenuVipDiscountBar() {
  useInitVipCodeDict()
  const { userConfig } = useVipUserInfo()
  const { levelCode } = userConfig || {}
  const list = useVipUpgradeConditionsList()
  const data = list?.find(e => e.levelCode?.toString() === levelCode?.toString())
  if (isEmpty(data?.feeList)) return <div></div>
  return (
    <div className="bg-card_bg_color_01 rounded-lg text-xs p-3 space-y-2">
      {data!.feeList!.map((fee, idx) => (
        <div className="flex flex-row space-x-2 justify-between" key={idx}>
          <span>
            {t({
              id: 'features_user_personal_center_menu_navigation_index_nechi3rdvy',
              values: { 0: getVipHeaderValue(fee.productCd) },
            })}
          </span>
          <div>
            <span className="text-text_color_03">
              {t`features_user_personal_center_menu_navigation_index_ak4wf2zasf`}
            </span>
            <span>
              {getDiscountAmt(fee.makerFee)}/{getDiscountAmt(fee.takerFee)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MenuLoginOut() {
  const handleLoginOut = async () => {
    const res = await getMemberUserLoginOut({})
    res.isOk && Message.success(t`features_user_personal_center_menu_navigation_index_2443`)
    removeUserInfo()
    await removeToken()
    removeC2CParamsTipsCache()
    link('/')
  }

  return (
    <div className="login-out">
      <div className="cell" onClick={() => handleLoginOut()}>
        <div className="cell-wrap">
          <div className="text text-center">
            <label>{t`user.personal_center_13`}</label>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserPersonalCenterMenuNavigation({ isAboutShow, handleAboutPopUpShow }) {
  const { path } = usePageContext()
  const isMergeMode = getMergeModeStatus()
  const { updateUserInfoData, userInfo } = useUserStore()

  const [showKycModal, setShowKycModal] = useState(false)

  useEffect(() => {
    if (isAboutShow) handleAboutPopUpShow(false)
  }, [path])

  const handleLink = (v: MenuCellListType) => {
    if (v.isLink) {
      link(v.link)
      return
    }

    v.type === aboutEnum.about && handleAboutPopUpShow(true)
    v.type === vipCenterEnum.vipCenter && setShowKycModal(true)
  }

  const menuCell = useMemo(() => {
    return <MenuCell onLink={handleLink} isMergeMode={isMergeMode} />
  }, [])

  const onPersonalCenterChange = e => {
    if (e) {
      updateUserInfoData()
    }
  }

  return (
    <>
      <Trigger
        popupAlign={{
          bottom: [-110, 16],
        }}
        onVisibleChange={onPersonalCenterChange}
        popup={() => (
          <div className={`user-personal-center-menu ${styles.scoped}`}>
            <div className="user-personal-center-menu-wrap">
              <MenuHeader onClick={() => link(getVipSettingRoutePath())} isMergeMode={isMergeMode} />

              {menuCell}
            </div>

            {!isMergeMode && <MenuLoginOut />}
          </div>
        )}
      >
        <div className="user-menu-icon">
          <Icon name="user_head" fontSize={22} hasTheme hover />
        </div>
      </Trigger>
      <Modal
        className={styles['is-kyc-modal']}
        title={t`features_user_personal_center_menu_navigation_index_wv2dkzm3se`}
        onCancel={() => setShowKycModal(false)}
        footer={() => (
          <>
            <Button
              onClick={() => setShowKycModal(false)}
            >{t`features_user_personal_center_menu_navigation_index_tsar4c5bui`}</Button>
            <Button
              type="primary"
              onClick={() => {
                link('/kyc-authentication-homepage')
                setShowKycModal(false)
              }}
            >
              KYC{t`features_c2c_trade_free_trade_index_ueruhwwnrlhksqf41fkqn`}
            </Button>
          </>
        )}
        visible={showKycModal}
      >
        <span>{t`features_user_personal_center_menu_navigation_index_jclv7a83ni`}</span>
      </Modal>
    </>
  )
}

export default UserPersonalCenterMenuNavigation
