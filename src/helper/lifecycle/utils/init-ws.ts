import { baseUserStore } from '@/store/user'
import { baseCommonStore } from '@/store/common'
import ws from '@/plugins/ws'
import futuresWs from '@/plugins/ws/futures'
import optionWs from '@/plugins/ws/option'
import c2cWs from '@/plugins/ws/c2c-mode'
import { wsUrl, wsFuturesUrl, wsOptionUrl, isPublicC2cMode, publicC2cWs } from '../../env'

export async function initWS() {
  ws.setOptions({
    wsUrl,
    success() {
      if (baseUserStore.getState().isLogin) {
        ws.login()
      }
    },
    getToken: () => {
      return baseUserStore.getState().token?.accessToken as unknown as string
    },
  })
  ws.connect()

  ws.onAddWsDelayTimeChange(time => {
    baseCommonStore.getState().setwsDelayTime(time)
  })

  futuresWs.setOptions({
    wsUrl: wsFuturesUrl,
    success() {
      if (baseUserStore.getState().isLogin) {
        futuresWs.login()
      }
    },
    getToken: () => {
      return baseUserStore.getState().token?.accessToken as unknown as string
    },
  })
  futuresWs.connect()

  optionWs.setOptions({
    wsUrl: wsOptionUrl,
    success() {
      if (baseUserStore.getState().isLogin) {
        futuresWs.login()
      }
    },
    getToken: () => {
      return baseUserStore.getState().token?.accessToken as unknown as string
    },
  })
  optionWs.connect()

  if (isPublicC2cMode) {
    c2cWs.setOptions({
      wsUrl: publicC2cWs,
      success() {
        baseUserStore.getState().isLogin && c2cWs.login()
      },
      getToken: () => {
        return baseUserStore.getState().c2cModeUserInfo?.token
      },
    })
    c2cWs.connect()
  }
}

baseUserStore.subscribe(
  userState => userState.isLogin,
  () => {
    if (baseUserStore.getState().isLogin) {
      ws.login()
      futuresWs.login()
      optionWs.login()
    } else {
      ws.logout()
      futuresWs.logout()
      optionWs.logout()
    }
  }
)

if (isPublicC2cMode) {
  baseUserStore.subscribe(
    state => state.c2cModeUserInfo.token,
    () => {
      if (baseUserStore.getState().c2cModeUserInfo?.token) c2cWs.login()
      else c2cWs.logout()
    }
  )
}
