import { create } from 'zustand'

import { subscribeWithSelector } from 'zustand/middleware'
import { createTrackedSelector } from 'react-tracked'
import { ThemeEnum, ColorPlateEnum } from '@/constants/base'
import { setCookieLocale, setCookieTheme } from '@/helper/cookie'
import {
  getLangCache,
  getThemeCache,
  setLangCache,
  setThemeCache,
  getMergeModeCache,
  setMergeModeCache,
  getBusinessIdCache,
  getAccessKeyCache,
  setBusinessIdCache,
  setAccessKeyCache,
  setThemeTypeCache,
} from '@/helper/cache'
import { I18nsEnum } from '@/constants/i18n'
import { navigate } from 'vite-plugin-ssr/client/router'
import { getMaintenanceConfigFromS3 } from '@/apis/maintenance'
import produce from 'immer'

type IStore = ReturnType<typeof getStore>

const themeCache = getThemeCache()
const langCache = getLangCache()
const mergeCache = getMergeModeCache()
const businessIdCache = getBusinessIdCache()
const accessKeyCache = getAccessKeyCache()

function getStore(set, get) {
  return {
    maintenanceMode: {
      triggerCheck: false,
      isMaintenance: false,
    },
    setMaintenanceMode: ({ triggerCheck, isMaintenance }: { triggerCheck?: boolean; isMaintenance?: boolean }) =>
      set(
        produce((draft: IStore) => {
          if (triggerCheck) draft.maintenanceMode.triggerCheck = triggerCheck
          if (isMaintenance) draft.maintenanceMode.isMaintenance = isMaintenance
        })
      ),

    theme: themeCache || ThemeEnum.light,
    themeType: ColorPlateEnum.default,
    setThemeType: (currentThemeType?: string) =>
      set(state => {
        setThemeTypeCache(currentThemeType)
        if (currentThemeType === ColorPlateEnum.okx) {
          state.setTheme(ThemeEnum.light)
        }
        return { themeType: currentThemeType }
      }),
    setTheme: (currentTheme?: string) =>
      set((state: IStore) => {
        if (currentTheme) {
          setThemeCache(currentTheme)
          return { theme: currentTheme }
        }
        currentTheme = state.theme === ThemeEnum.dark ? ThemeEnum.light : ThemeEnum.dark
        setThemeCache(currentTheme)
        return { theme: currentTheme }
      }),
    locale: langCache || I18nsEnum['en-US'],
    setLocale: (currentLocale?: string) =>
      set(() => {
        if (currentLocale) {
          return { locale: currentLocale }
        }
        return {}
      }),
    secretKey: null,
    setSecretKey: (secretKey?: string) =>
      set(() => {
        if (secretKey) {
          return { secretKey }
        }
        return {}
      }),
    isMergeMode: mergeCache || false,
    setMergeMode: (isMergeMode: boolean) =>
      set(() => {
        setMergeModeCache(isMergeMode)
        return { isMergeMode }
      }),
    businessId: businessIdCache || null,
    setBusinessId: (businessId: string) =>
      set(() => {
        setBusinessIdCache(businessId)
        return { businessId }
      }),
    accessKey: accessKeyCache || null,
    setAccessKey: (accessKey: string) =>
      set(() => {
        setAccessKeyCache(accessKey)
        return { accessKey }
      }),
    // ws 的延迟时间
    wsDelayTime: 0,
    setwsDelayTime: (wsDelayTime: number) =>
      set(() => {
        return { wsDelayTime }
      }),

    c2cModeInfo: {} as {
      c2cBid?: number
    },
    setC2cModeInfo: info =>
      set(() => {
        return {
          c2cModeInfo: info,
        }
      }),
  }
}

const baseCommonStore = create(subscribeWithSelector(getStore))

baseCommonStore.subscribe(
  state => state.themeType,
  themeType => {
    if (typeof window !== 'undefined') {
      document.body.setAttribute('theme-type', themeType)
    }
  }
)
// 添加监听，A 模块变动去修改 B 模块状态
baseCommonStore.subscribe(
  state => state.theme,
  theme => {
    if (typeof window !== 'undefined') {
      document.body.setAttribute('arco-theme', theme)
      setCookieTheme(theme)
    }
  }
)

baseCommonStore.subscribe(
  state => state.locale,
  locale => {
    if (typeof window !== 'undefined') {
      setLangCache(locale)
      setCookieLocale(locale)
    }
  }
)

/**
 * check isMaintenance mode on trigger
 * set maintenance mode to true
 * redirect to current page to render maintenance page
 */
baseCommonStore.subscribe(
  state => state.maintenanceMode.triggerCheck,
  () => {
    const { setMaintenanceMode } = baseCommonStore.getState()
    getMaintenanceConfigFromS3({}).then(res => {
      const maintenanceState = res.data.state
      setMaintenanceMode({ isMaintenance: maintenanceState })
      navigate(window.location.pathname)
    })
  }
)

const useCommonStore = createTrackedSelector(baseCommonStore)
// TODO: 必须要这样调用：baseCommonStore.getState()
export { useCommonStore, baseCommonStore }
