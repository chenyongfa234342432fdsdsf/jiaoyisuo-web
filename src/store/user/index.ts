import { create } from 'zustand'
import { Message } from '@nbit/arco'
import { subscribeWithSelector } from 'zustand/middleware'
import { createTrackedSelector } from 'react-tracked'
import produce from 'immer'
import cacheUtils from 'store'
import { userInfo, setLineCssColor, getTokenCache, setTokenCache, removeC2CParamsTipsCache } from '@/helper/cache'
import { removeToken, setToken } from '@/helper/auth'
import {
  UserUpsAndDownsColorEnum,
  UserCurrencySymbolEnum,
  UserEnableEnum,
  ColorBlockSettingsEnum,
} from '@/constants/user'
import { I18nsEnum } from '@/constants/i18n'
import { UserInfoType } from '@/typings/api/user'
import { MemberOpenContractReq } from '@/typings/api/future/preferences'
import { setMemberSellProperty, setMemberBuyProperty } from '@/helper/handlecolor'
import { useSetting } from '@/features/user/personal-center/settings/ups-and-downs/setting'
import { baseContractPreferencesStore } from '@/store/user/contract-preferences'
import {
  getMemberUserInfo,
  getMemberBaseSettingsInfo,
  postMemberAuthRefreshToken,
  getMemberDemoIsOpen,
  getMemberRegisterDemo,
  postV1LinkedUserLoginApiRequest,
  postMemberAuthRefreshFastPayToken,
} from '@/apis/user'
import { link } from '@/helper/link'
import { t } from '@lingui/macro'
import { MemberUserInfoResp, MemberBaseSettingsInfoResp, MemberAuthRefreshTokenResp } from '@/typings/user'
import { basePersonalCenterStore } from '@/store/user/personal-center'
import { toKenTtlDefaultValue } from '@/constants/auth'
import { MergeModeLoginInvalidPopUp } from '@/features/user/utils/common'
import { isPublicC2cMode } from '@/helper/env'
import { YapiPostV1LinkedUserLoginData } from '@/typings/yapi/LinkedUserLoginV1PostApi'
import { isEmpty } from 'lodash'
import { fetchPublicC2cToken } from '@/helper/c2c-mode'

type IStore = ReturnType<typeof getStore>

const cacheToken = getTokenCache() as MemberAuthRefreshTokenResp | null
const userTransitionData = 'USER_TRANSITION_DATA'
const personalCenterSettings = 'PERSONAL_CENTER_SETTINGS'
const deviceId = 'DEVICE_ID'
const mergeModeToken = 'MERGE_MODE_TOKEN'
const multipleLoginTime = 'MULTIPLE_LOGIN_TIME'
const thirdPartyToken = 'THIRD_PARTY_TOKEN'

type RestItemType = {
  /** 邮箱 */
  isEmail: boolean
  /** 手机 */
  isMobile: boolean
  /** 谷歌 */
  isGoogle: boolean
}

type UserTransitionDataType = {
  /** 账号 */
  account?: string
  /** 账号类型 手机或邮箱 */
  accountType?: string | number
  /** 第三方账号 */
  thirdPartyAccount?: string
  /** 第三方账号类型 */
  thirdPartyAccountType?: string | number
  /** 注册类型 */
  registerType?: string
  /** 极验码 */
  imageCode?: string
  /** 安全项 */
  item?: number
  /** 邮箱 */
  email?: string
  /** 密码 */
  loginPassword?: string
  /** 国家缩写字母 */
  regCountry?: string
  /** 手机区号 */
  mobileCountryCode?: string
  /** 手机号 */
  mobileNumber?: string
  /** uid */
  uid?: string
  /** 重置安全项选项 */
  resetItem?: RestItemType
  /** 地区值 */
  codeVal?: string
  /** 国家名称 */
  codeKey?: string
  /** 是否可用  */
  enableInd?: number
  /** 国家缩写 */
  remark?: string | null
  /** 目录名 */
  homeColumnName?: string
}

type PersonalCenterSettingsType = {
  /** 涨跌色 */
  colors?: number
  /** 深色色块 */
  colorsBlock?: number
  /** 货币符号 */
  currencySymbol?: UserCurrencySymbolEnum
  /** 推送语言 */
  pushLanguage?: string
  /** 保持登录时长 */
  tokenTtl?: number
  /** 自动追加保证金是否首次设置 */
  automaticMarginCall?: string
}

const personalCenterSettingsDefaultValue = {
  colors: UserUpsAndDownsColorEnum.greenUpRedDown,
  colorsBlock: ColorBlockSettingsEnum.grandTotal,
  /** 过渡变量 更新后删除 */
  currencySymbol: UserCurrencySymbolEnum.usd,
  pushLanguage: I18nsEnum['en-US'],
  tokenTtl: toKenTtlDefaultValue,
  automaticMarginCall: UserEnableEnum.no,
}

// 判断 refreshToken 过期时间 重置 isLogin 状态
function getIsLoginStatus() {
  if (cacheToken) {
    const isTrue = Date.now() <= cacheToken.refreshTokenExpireTime && !!cacheToken.accessToken
    return isTrue
  }

  return !!cacheToken
}

function getStore(set, get) {
  return {
    token: cacheToken,
    setToken: (tokenObj: MemberAuthRefreshTokenResp | null) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.token = tokenObj
          setTokenCache(tokenObj)
        })
      }),
    isLogin: getIsLoginStatus(),
    setLogin: (values: boolean) => {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.isLogin = values
        })
      })
    },
    userInfo: cacheUtils.get(userInfo) || <UserInfoType>{},
    setUserInfo: (values: Partial<UserInfoType>) =>
      set((store: IStore) => {
        return produce(store, _store => {
          const userInfoFormations = { ..._store.userInfo, ...values }
          _store.userInfo = userInfoFormations
          cacheUtils.set(userInfo, userInfoFormations)
        })
      }),
    removeUserInfo: () =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.userInfo = <UserInfoType>{}
          cacheUtils.set(userInfo, '')
        })
      }),
    deviceId: cacheUtils.get(deviceId) || '',
    setDeviceId: (values: string) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.deviceId = values
          cacheUtils.set(deviceId, values)
        })
      }),
    /** 用户登录、注册过渡数据 */
    userTransitionDatas: cacheUtils.get(userTransitionData) || <UserTransitionDataType>{},
    setUserTransitionDatas: (values: UserTransitionDataType) =>
      set((store: IStore) => {
        return produce(store, _store => {
          const userTranstionData = { ..._store.userTransitionDatas, ...values }
          _store.userTransitionDatas = userTranstionData
          cacheUtils.set(userTransitionData, userTranstionData)
        })
      }),
    removeUserTransitionDatas: () =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.userTransitionDatas = <UserTransitionDataType>{}
          cacheUtils.set(userTransitionData, '')
        })
      }),
    /** 个人中心个人偏好设置 */
    personalCenterSettings: <PersonalCenterSettingsType>{
      ...personalCenterSettingsDefaultValue,
      ...cacheUtils.get(personalCenterSettings),
    },
    setPersonalCenterSettings: (values: PersonalCenterSettingsType) =>
      set((store: IStore) => {
        return produce(store, _store => {
          const personalCanterSettingsData = { ..._store.personalCenterSettings, ...values }
          _store.personalCenterSettings = personalCanterSettingsData
          cacheUtils.set(personalCenterSettings, personalCanterSettingsData)
        })
      }),
    /** 开通合约过渡数据 */
    openContractTransitionDatas: <MemberOpenContractReq>{},
    setOpenContractTransitionDatas: values =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.openContractTransitionDatas = { ..._store.openContractTransitionDatas, ...values }
        })
      }),
    clearOpenContractTransitionDatas: () =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.openContractTransitionDatas = <MemberOpenContractReq>{}
        })
      }),
    /** 全局设置涨跌色 */
    setMemberBaseColor: (key: number) =>
      set((store: IStore) => {
        return produce(store, _store => {
          const { cssColorObj } = useSetting()
          const showHandleColor = key === UserUpsAndDownsColorEnum.greenUpRedDown
          const sellHandle = cssColorObj({ valueTittle: showHandleColor ? 'rd' : 'gr' })
          const buyHandle = cssColorObj({ valueTittle: showHandleColor ? 'gr' : 'rd' })
          const info = cacheUtils.get(personalCenterSettings) || _store.personalCenterSettings
          setLineCssColor({ buyHandle, sellHandle, trend: key })
          setMemberSellProperty(sellHandle)
          setMemberBuyProperty(buyHandle)
          _store.personalCenterSettings.colors = key
          cacheUtils.set(personalCenterSettings, { ...info, colors: key })
        })
      }),
    /** 清除用户登录状态缓存的数据 */
    clearUserCacheData: async () => {
      const state: IStore = get()

      removeC2CParamsTipsCache()
      await removeToken()
      await state.removeUserInfo()
      await state.removeUserTransitionDatas()
      state.setLogin(false)
    },
    /** 更新用户信息 */
    async updateUserInfoData() {
      const res = await getMemberUserInfo({})

      if (res.isOk) {
        set((store: IStore) => {
          return produce(store, _store => {
            const userInfoFormations = { ..._store.userInfo, ...(res?.data as MemberUserInfoResp) }
            _store.userInfo = userInfoFormations
            cacheUtils.set(userInfo, userInfoFormations)
          })
        })
      }
    },
    /** 更新用户设置信息 */
    async updateUserSettingsInfo() {
      const { updateFiatCurrencyData } = basePersonalCenterStore.getState()

      const res = await getMemberBaseSettingsInfo({})

      if (res.isOk) {
        set((store: IStore) => {
          return produce(store, _store => {
            const userInfoFormations = { ..._store.userInfo, ...(res?.data as MemberBaseSettingsInfoResp) }
            _store.userInfo = userInfoFormations
            _store.personalCenterSettings.colors = res.data?.marketSetting
            updateFiatCurrencyData('currencyTypeCd', res.data?.currencyTypeCd as string)
            cacheUtils.set(userInfo, userInfoFormations)
          })
        })
      }
    },
    /** 更新偏好设置和用户信息的聚合方法 */
    async updatePreferenceAndUserInfoData() {
      const { getContractPreference } = baseContractPreferencesStore.getState()
      const { updateFiatCurrencyData } = basePersonalCenterStore.getState()

      getContractPreference()

      const [userInfoRes, userSettingInfoRes] = await Promise.all([
        getMemberUserInfo({}),
        getMemberBaseSettingsInfo({}),
      ])

      if (userInfoRes.isOk && userSettingInfoRes.isOk) {
        set((store: IStore) => {
          return produce(store, _store => {
            const userInfoFormations = {
              ..._store.userInfo,
              ...(userInfoRes?.data as MemberUserInfoResp),
              ...(userSettingInfoRes?.data as MemberBaseSettingsInfoResp),
            }
            _store.userInfo = userInfoFormations
            _store.personalCenterSettings.colors = userSettingInfoRes.data?.marketSetting
            updateFiatCurrencyData('currencyTypeCd', userSettingInfoRes.data?.currencyTypeCd as string)
            cacheUtils.set(userInfo, userInfoFormations)
          })
        })
      }
    },
    /** 更新商户 Token */
    async updateMerchantToken(refreshToken: string, callback: () => void) {
      const state: IStore = get()

      const res = await postMemberAuthRefreshToken({ refreshToken, tokenTtl: toKenTtlDefaultValue })
      /** error code 10000122 token 为空 */
      if (res.code === 10000122) {
        MergeModeLoginInvalidPopUp()
        return
      }

      if (res.isOk && res.data) {
        setToken(res.data)
        state.setLogin(true)
        await state.updatePreferenceAndUserInfoData()
        callback()
      }
    },
    mergeModeToken: cacheUtils.get(mergeModeToken) || '',
    setMergeModeToken: (token: string) => {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.mergeModeToken = token
          cacheUtils.set(mergeModeToken, token)
        })
      })
    },
    /** 获取商户是否有试玩资格 */
    hasMerchantTrialQualification: false,
    async getMerchantTrialQualification() {
      const res = await getMemberDemoIsOpen({})
      if (res.isOk && res.data) {
        set((store: IStore) => {
          return produce(store, _store => {
            _store.hasMerchantTrialQualification = res.data?.isOpen || false
          })
        })
      }
    },
    /** 设置试玩账户身份信息 */
    async setTrialAccountInfo() {
      const state: IStore = get()
      const res = await getMemberRegisterDemo({})
      if (res.isOk && res.data) {
        setToken({
          accessToken: res.data.token,
          refreshToken: res.data.refreshToken,
          accessTokenExpireTime: res.data.tokenExpireTime,
          refreshTokenExpireTime: res.data.refreshTokenExpireTime,
        })
        state.setLogin(true)
        await state.setUserInfo({ ...res.data?.userInfo })
        await state.setMemberBaseColor(
          res.data?.usrMemberSettingsVO?.marketSetting || UserUpsAndDownsColorEnum.greenUpRedDown
        )

        Message.success(t`store_user_index_suoaao9ftj`)

        link('/')
      }
    },
    showUserClassificationPopUp: false,
    setUserClassificationPopUpStatus: (status: boolean) =>
      set((store: IStore) => {
        return produce(store, _store => {
          _store.showUserClassificationPopUp = status
        })
      }),
    /** 多点登录时间 */
    multipleLoginTime: cacheUtils.get(multipleLoginTime) || 0,
    setMultipleLoginTime(value) {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.multipleLoginTime = value
          cacheUtils.set(multipleLoginTime, value)
        })
      })
    },
    clearMultipleLoginTime() {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.multipleLoginTime = 0
          cacheUtils.set(multipleLoginTime, 0)
        })
      })
    },
    c2cModeUserInfo: {} as YapiPostV1LinkedUserLoginData,
    setC2cModeUserInfo: (c2cUserInfo: YapiPostV1LinkedUserLoginData) => {
      set(
        produce((draft: IStore) => {
          draft.c2cModeUserInfo = c2cUserInfo
        })
      )
    },
    /** 第三方登录 token */
    thirdPartyToken: cacheUtils.get(thirdPartyToken) || '',
    setThirdPartyToken(token: string) {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.thirdPartyToken = token
          cacheUtils.set(thirdPartyToken, token)
        })
      })
    },
    clearThirdPartyToken() {
      set((store: IStore) => {
        return produce(store, _store => {
          _store.thirdPartyToken = ''
          cacheUtils.set(thirdPartyToken, '')
        })
      })
    },
  }
}
const baseUserStore = create(subscribeWithSelector(getStore))

const useUserStore = createTrackedSelector(baseUserStore)

// 添加监听，A 模块变动去修改 B 模块状态
const unUserSub = baseUserStore.subscribe(
  state => !!state.token,
  val => {
    baseUserStore.getState().setLogin(val)
  }
)

// subscribe to public c2c
const subPublicC2cToken = baseUserStore.subscribe(
  state => state.isLogin && isPublicC2cMode,
  async isLogin => {
    if (isLogin) {
      await fetchPublicC2cToken()
    } else {
      // remove c2c user info
      baseUserStore.getState().setC2cModeUserInfo({} as YapiPostV1LinkedUserLoginData)
    }
  }
)

export { useUserStore, baseUserStore, unUserSub, subPublicC2cToken }
