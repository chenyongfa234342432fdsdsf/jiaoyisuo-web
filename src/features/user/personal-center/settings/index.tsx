import { Message, Switch, Select } from '@nbit/arco'
import { t } from '@lingui/macro'
import { useUserStore } from '@/store/user'
import { getInmailMenu } from '@/apis/inmail'
import Icon from '@/components/icon'
import { useRequest, useMount } from 'ahooks'
import { I18nsEnum, I18nsMap } from '@/constants/i18n'
import { link } from '@/helper/link'
import { useCommonStore } from '@/store/common'
import { ColorPlateEnum } from '@/constants/base'
import UserPopUp from '@/features/user/components/popup'
import { UserUpsAndDownsColorEnum, UserEnabledStateTypeEnum } from '@/constants/user'
import { ReactNode, useState, useEffect, useRef } from 'react'
import { usePersonalCenterStore } from '@/store/user/personal-center'
import InmailSetting from '@/features/user/personal-center/settings/inmail-setting'
import FullScreenLoading from '@/features/user/components/full-screen-loading'
import UserPersonalCenterModifyUserName from '@/features/user/personal-center/modify-username'
import UserPersonalCenterConvertedCurrency from '@/features/user/personal-center/settings/converted-currency'
import UserPersonalCenterUpsAndDowns from '@/features/user/personal-center/settings/ups-and-downs'
import UserSelectSkinColorModal from '@/features/user/personal-center/settings/select-skin-color-modal'
import UserPersonalCenterPushLanguage from '@/features/user/personal-center/settings/language'
import {
  setNoticeType,
  getInmailSettings,
  setMarketingEmail,
  postMemberBaseColorType,
  getMemberBaseSettingsInfo,
  postMemberBasePushLanguage,
} from '@/apis/user'
import { SettingInmailType, SettingInmailModules, UserSelectConfigurationItemType } from '@/typings/api/user'
import styles from './index.module.css'

const Option = Select.Option
interface SettingsCellProps {
  /** 标题 */
  text: string
  /** 左图标 */
  icon: ReactNode
  /** 提示文字 */
  placeholderText: string
  /** 提示图标 */
  placeholderIcon?: ReactNode
  /** 昵称、文字内容 */
  contentText?: string
  /** 头像 */
  contentIcon?: ReactNode
  /** 内容插槽 */
  contentSlot?: ReactNode
  /** 按钮颜色* */
  buttonClassName?: string
  /** 是否显示按钮 */
  isShow?: boolean
  /** 是否显示 switch 按钮 */
  isSwitch?: boolean
  /** 按钮文字 */
  buttonText?: string | ReactNode
  /** 操作插槽 */
  operateSlot?: ReactNode
  /** switch 值 */
  switchValue?: boolean
  /** 点击回调函数 */
  onClick?(): void
  /** 值变化回调函数 */
  onChange?(status: boolean): void
}

enum OrderStatusType {
  enable = 1, // 开启
  noEnable = 2, // 关闭
}

export function SettingsCell({
  text,
  icon,
  placeholderText,
  contentText,
  contentIcon,
  contentSlot,
  buttonClassName,
  isShow,
  isSwitch,
  buttonText,
  operateSlot,
  switchValue,
  onClick,
  onChange,
}: SettingsCellProps) {
  return (
    <div className="cell">
      <div className="cell-wrap">
        <div className="cell-icon">{icon}</div>
        <div className="cell-title">
          <div className="text">
            <label>{text}</label>
          </div>
          <div className="placeholder">
            <label>{placeholderText}</label>
          </div>
        </div>
        <div className="cell-content">
          {contentIcon || null}
          <label>{contentText}</label>
          {contentSlot}
        </div>
        <div className="cell-btn">
          {isShow && (
            <span onClick={onClick} className={buttonClassName}>
              {buttonText || t`user.field.reuse_08`}
            </span>
            // <Button type="text" onClick={onClick} className={buttonClassName}>
            //   {buttonText || t`user.field.reuse_08`}
            // </Button>
          )}
          {isSwitch && <Switch checked={switchValue} onChange={onChange} />}
          {operateSlot}
        </div>
      </div>
    </div>
  )
}

function UserPersonalCenterSettings() {
  const [visibleModifyName, setVisibleModifyName] = useState<boolean>(false)
  const [visibleConvertedCurrency, setVisibleConvertedCurrency] = useState<boolean>(false)
  const [visibleUpsAndDowns, setVisibleUpsAndDowns] = useState<boolean>(false)
  const [visibleLanguage, setVisibleLanguage] = useState<boolean>(false)
  const [visibleInmail, setVisibleInmail] = useState<boolean>(false)
  // const [perpetualOrderStatus, setPerpetualOrderStatus] = useState<boolean>(false)
  const [detailInmail, setDetailInmail] = useState<SettingInmailType>()
  const [inmailData, setInmailData] = useState<Array<SettingInmailModules>>([])
  const [colorText, setColorText] = useState<string>('')
  const [themeText, setThemeText] = useState<string>('')
  const [localText, setLocalText] = useState<string>('')
  const [languageList, setLanguageList] = useState<Array<UserSelectConfigurationItemType>>([])

  const upsAndDownsRef = useRef<Record<'resetTrendColors', () => void>>()

  const userSelectSkinColorModalRef = useRef<Record<'openVisibleSettingModal', () => void>>()

  const { themeType } = useCommonStore()
  const { userInfo, updatePreferenceAndUserInfoData, personalCenterSettings, setPersonalCenterSettings } =
    useUserStore()
  const { fiatCurrencyData } = usePersonalCenterStore()
  const colors = personalCenterSettings?.colors
  const locale = personalCenterSettings?.pushLanguage

  const colorList = [
    {
      key: 1,
      value: UserUpsAndDownsColorEnum.greenUpRedDown,
      icon: <Icon name="icon_set_index_green" hasTheme className="mr-1" />,
      text: t`features_user_personal_center_settings_ups_and_downs_index_2701`,
    },
    {
      key: 2,
      value: UserUpsAndDownsColorEnum.redUpGreenDown,
      icon: <Icon name="icon_set_index_red" hasTheme className="mr-1" />,
      text: t`user.account_security.settings_04`,
    },
  ]

  const themeTypeObj = [
    {
      title: t`features_agent_manage_index_5101437`,
      key: ColorPlateEnum.default,
    },
    {
      title: t`features_user_personal_center_settings_select_skin_color_modal_index_rha6zabtqn`,
      key: ColorPlateEnum.okx,
    },
    {
      title: t`features_user_personal_center_settings_select_skin_color_modal_index__d0gfvemfn`,
      key: ColorPlateEnum.binance,
    },
    {
      title: t`features_user_personal_center_settings_select_skin_color_modal_index_9utfx8ot2h`,
      key: ColorPlateEnum.kucoin,
    },
  ]

  /** 获取已设置内容* */
  const getInmailData = async () => {
    const { data: inmailAllData } = await getInmailMenu({})
    const { data, isOk } = await getInmailSettings({})
    if (!isOk && !data) return
    setDetailInmail(data)
    setInmailData(inmailAllData)
    setPersonalCenterSettings({ pushLanguage: data?.pushLanguage })
  }

  const setVisibleHandle = () => {
    upsAndDownsRef.current?.resetTrendColors()
    setVisibleUpsAndDowns(false)
  }

  const getInfo = async () => {
    await Promise.all([updatePreferenceAndUserInfoData(), getInmailData()])
  }

  const { run, loading } = useRequest(getInfo, { manual: true })

  useEffect(() => {
    run()
  }, [])

  /** 涨跌色设置 */
  const onUpsDownsChange = async (v: number) => {
    const res = await postMemberBaseColorType({ marketSetting: v })
    if (res.isOk && res.data?.isSuccess) {
      updatePreferenceAndUserInfoData()
      Message.success(t`features/user/personal-center/settings/converted-currency/index-0`)
    }
  }

  const onChangeOpenInmail = () => {
    setVisibleInmail(true)
  }

  const handleMarketinSoftwareStatus = async () => {
    const status =
      detailInmail?.isOpenMarketingEmail === OrderStatusType.enable ? OrderStatusType.noEnable : OrderStatusType.enable
    const options = {
      isOpenMarketingEmail: status,
    }
    const res = await setMarketingEmail(options)
    if (!res.isOk && !res.data) return
    getInmailData()
  }

  // 保存站内信
  const onInmailChange = async v => {
    const options = { moduleIds: v }
    const res = await setNoticeType(options)
    if (!res.isOk && !res.data) return
    getInmailData()
    setVisibleInmail(false)
  }

  const onCancelInmail = () => {
    setVisibleInmail(false)
  }

  const getBaseSettingsInfo = async () => {
    const res = await getMemberBaseSettingsInfo({})
    if (res.isOk) {
      let list: UserSelectConfigurationItemType[] = []
      Object.keys(I18nsMap).forEach((v, i) => {
        list.push({ key: i, value: I18nsEnum[v], text: I18nsMap[v], isChecked: v === res.data?.pushLanguage })
      })
      setPersonalCenterSettings({ pushLanguage: res.data?.pushLanguage })
      setLanguageList(list)
    }
  }

  const onLocaleChange = async v => {
    const res = await postMemberBasePushLanguage({ language: v })
    if (res.isOk && res.data?.isSuccess) {
      getInmailData()
      Message.success(t`features/user/personal-center/settings/converted-currency/index-0`)
    }
  }

  useMount(getBaseSettingsInfo)

  useEffect(() => {
    const localData = detailInmail?.pushLanguage
    if (localData) {
      const currentLocal = languageList?.find(item => item?.value === localData)
      currentLocal && setLocalText(currentLocal.text)
    }
  }, [detailInmail?.pushLanguage])

  useEffect(() => {
    const currentTheme = themeTypeObj.find(item => item?.key === themeType)
    currentTheme && setThemeText(currentTheme?.title || t`features_agent_manage_index_5101437`)
  }, [themeType])

  useEffect(() => {
    const currentColor = colorList.find(item => item?.value === colors)
    currentColor && setColorText(currentColor.text)
  }, [colors])

  return (
    <div className={`user-personal-center-settings ${styles.scoped}`}>
      <div className="title">
        <h1 className="wrap">{t`features_trade_trade_setting_index_2510`}</h1>
      </div>

      <div className="flex-1 bg-bg_color">
        <div className="personal-information">
          <div className="personal-information-wrap wrap">
            <div className="subtitle">
              <label>{t`features_user_personal_center_settings_index_ddiidg10vb`}</label>
            </div>

            <div className="personal-information-body">
              <SettingsCell
                text={t`user.account_security.modify_username_04`}
                isShow={userInfo?.setNicknameInd === UserEnabledStateTypeEnum.unEnable}
                icon={<Icon name="a-icon_personal_man" hasTheme />}
                placeholderText={t`user.account_security.modify_username_01`}
                placeholderIcon={<Icon name="msg" />}
                contentText={userInfo?.nickName}
                buttonText={t`user.field.reuse_43`}
                onClick={() => setVisibleModifyName(true)}
              />

              {/* <SettingsCell
              text={t`user.account_security.modify_username_05`}
              icon={<Icon name="user_icon_avatar" />}
              placeholderText={t`user.account_security.modify_username_06`}
              contentIcon={<Icon name="user_head_hover" />}
            />

            <SettingsCell
              text={t`features/user/personal-center/settings/index-2`}
              isShow
              icon={<Icon name="nav_order_c2c" />}
              placeholderText={t`features/user/personal-center/settings/index-3`}
              onClick={() => link('/personal-center/settings/payment')}
            /> */}

              {/* <SettingsCell
              text={t`features/user/personal-center/settings/index-6`}
              isShow
              icon={<Icon name="user_down_set_up" />}
              placeholderText={t`features/user/personal-center/settings/api/index-11`}
              onClick={() => link('/personal-center/settings/api')}
            /> */}

              <SettingsCell
                text={t`user.account_security.settings_02`}
                isShow
                contentText={fiatCurrencyData?.currencyTypeCd}
                icon={<Icon name="currency_selected" hasTheme />}
                placeholderText={t`features_user_personal_center_settings_index_2617`}
                onClick={() => setVisibleConvertedCurrency(true)}
              />

              <SettingsCell
                text={t`features_user_personal_center_settings_select_skin_color_modal_index_ryvwtrz4sy`}
                isShow
                contentSlot={
                  <div className="cell-content-slot">
                    <Icon name="login_satisfied" />
                    <p>{themeText || ''}</p>
                  </div>
                }
                icon={<Icon name="reskin_icon" hasTheme />}
                placeholderText={t`features_user_personal_center_settings_index_shvbra8gjf`}
                onClick={() => userSelectSkinColorModalRef.current?.openVisibleSettingModal()}
              />

              <SettingsCell
                text={t`user.account_security.settings_03`}
                contentSlot={
                  <div className="cell-content-slot">
                    <Icon name="login_satisfied" />
                    <p>{colorText || ''}</p>
                  </div>
                }
                icon={<Icon name="icon_set_index" hasTheme />}
                placeholderText={t`features_user_personal_center_settings_index_2618`}
                operateSlot={
                  <Select
                    value={colors}
                    onChange={onUpsDownsChange}
                    placeholder={t`user.account_security.settings_07`}
                    arrowIcon={<Icon name="arrow_open" hasTheme />}
                  >
                    {colorList.map(v => (
                      <Option key={v.key} value={v.value}>
                        {v.icon}
                        {v.text}
                      </Option>
                    ))}
                  </Select>
                }
              />

              <SettingsCell
                text={t`user.personal_center_08`}
                isShow
                icon={<Icon name="user_down_address" hasTheme />}
                buttonText={t`features_user_personal_center_settings_inmail_setting_index_5101258`}
                placeholderText={t`features_user_personal_center_settings_index_kin97boy2v`}
                onClick={() => link('/assets/main/withdraw/address')}
              />
            </div>
          </div>
        </div>

        <div className="personal-information">
          <div className="personal-information-wrap wrap">
            <div className="subtitle">
              <label>{t`features_user_personal_center_settings_index_5101259`}</label>
            </div>

            <div className="personal-information-body">
              <SettingsCell
                text={t`features/user/personal-center/settings/index-7`}
                contentSlot={
                  <div className="cell-content-slot">
                    <Icon name="login_satisfied" />
                    <p>{localText || ''}</p>
                  </div>
                }
                icon={<Icon name="language_setting" hasTheme />}
                placeholderText={t`features_user_personal_center_settings_index_2619`}
                onClick={() => setVisibleLanguage(true)}
                operateSlot={
                  <Select
                    value={locale}
                    placeholder={t`features/user/utils/validate-1`}
                    onChange={onLocaleChange}
                    arrowIcon={<Icon name="arrow_open" hasTheme />}
                  >
                    {languageList?.map(v => (
                      <Option key={v.key} value={v.value}>
                        {v.text}
                      </Option>
                    ))}
                  </Select>
                }
              />

              <SettingsCell
                isShow
                text={t`features_user_personal_center_settings_inmail_setting_index_5101255`}
                contentSlot={
                  <div className="cell-content-slot">
                    <Icon name="login_satisfied" />
                    <p>{detailInmail?.modules?.map(item => item.name)?.join(',')}</p>
                  </div>
                }
                icon={<Icon name="station_letter" hasTheme />}
                placeholderText={t`features_user_personal_center_settings_inmail_setting_index_5101256`}
                onClick={onChangeOpenInmail}
              />

              <SettingsCell
                text={t`features_user_personal_center_settings_index_5101262`}
                isSwitch
                buttonText={
                  <span className="text-text_color_01">
                    {detailInmail?.isOpenMarketingEmail === OrderStatusType.enable
                      ? t`user.field.reuse_48`
                      : t`features_user_personal_center_settings_index_5101263`}
                  </span>
                }
                buttonClassName={detailInmail?.isOpenMarketingEmail === OrderStatusType.enable ? 'close-btn-color' : ''}
                contentSlot={
                  <div className="cell-content-slot">
                    <Icon
                      name={
                        detailInmail?.isOpenMarketingEmail === OrderStatusType.enable ? 'login_satisfied' : 'icon_fail'
                      }
                    />
                    <div>
                      <p>
                        {detailInmail?.isOpenMarketingEmail === OrderStatusType.enable
                          ? t`features_user_personal_center_settings_index_5101263`
                          : t`user.field.reuse_48`}
                      </p>
                    </div>
                  </div>
                }
                icon={<Icon name="marketing_mail" hasTheme />}
                placeholderText={t`features_user_personal_center_settings_index_5101264`}
                onChange={handleMarketinSoftwareStatus}
                switchValue={detailInmail?.isOpenMarketingEmail === OrderStatusType.enable}
              />
            </div>
          </div>
        </div>
      </div>

      <UserPopUp
        className="user-popup"
        title={<div style={{ textAlign: 'left' }}>{t`user.account_security.modify_username_03`}</div>}
        visible={visibleModifyName}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setVisibleModifyName(false)}
        footer={null}
      >
        <UserPersonalCenterModifyUserName
          isShow={visibleModifyName}
          setVisible={setVisibleModifyName}
          onSuccess={updatePreferenceAndUserInfoData}
        />
      </UserPopUp>

      <UserPopUp
        className="user-popup"
        title={
          <div style={{ textAlign: 'left' }}>
            {t`user.account_security.settings_02`}
            {t`user.field.reuse_08`}
          </div>
        }
        visible={visibleConvertedCurrency}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setVisibleConvertedCurrency(false)}
        footer={null}
      >
        <UserPersonalCenterConvertedCurrency setVisible={setVisibleConvertedCurrency} />
      </UserPopUp>

      <UserPopUp
        className="user-popup"
        title={
          <div style={{ textAlign: 'left' }}>
            {t`user.account_security.settings_03`}
            {t`user.field.reuse_08`}
          </div>
        }
        visible={visibleUpsAndDowns}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setVisibleHandle()}
        footer={null}
      >
        <UserPersonalCenterUpsAndDowns ref={upsAndDownsRef} setVisible={setVisibleUpsAndDowns} />
      </UserPopUp>

      <UserPopUp
        className="user-popup"
        title={
          <div style={{ textAlign: 'left' }}>
            {t`features/user/personal-center/settings/index-7`}
            {t`user.field.reuse_08`}
          </div>
        }
        visible={visibleLanguage}
        closeIcon={<Icon name="close" hasTheme />}
        onCancel={() => setVisibleLanguage(false)}
        footer={null}
      >
        <UserPersonalCenterPushLanguage setVisible={setVisibleLanguage} onSuccess={getInmailData} />
      </UserPopUp>

      <InmailSetting
        visible={visibleInmail}
        onCancel={onCancelInmail}
        onChange={onInmailChange}
        inmailData={detailInmail?.modules}
        inmailSettingData={inmailData}
      />

      <UserSelectSkinColorModal ref={userSelectSkinColorModalRef} />

      <FullScreenLoading isShow={loading} />
    </div>
  )
}

export default UserPersonalCenterSettings
