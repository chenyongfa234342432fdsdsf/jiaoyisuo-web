import Personalization from '@/features/layout/components/personalization'
import RealTimeTernary from '@/features/market/real-time-ternary'
import Logo from '@/features/layout/components/logo'
import { useLayoutStore } from '@/store/layout'
import { KLineChartType } from '@nbit/chart-utils'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { IncreaseTag } from '@nbit/react'
import { t } from '@lingui/macro'
import { useTernaryOptionStore } from '@/store/ternary-option'
import { getV1OptionProductCallAndPutPercentApiRequest } from '@/apis/ternary-option'
import { YapiGetV1OptionProductCallAndPutPercentData } from '@/typings/yapi/OptionProductCallAndPutPercentV1GetApi'
import { useInterval, useUpdate } from 'ahooks'
import Styles from './index.module.css'

/** 看涨跌数据 */
export type ITernaryOptionUpDownPercent = {
  call: number
  put: number
}

function Header() {
  const ternryOptionState = useTernaryOptionStore()

  const [percentData, setPercentData] = useState<ITernaryOptionUpDownPercent>({
    call: 45,
    put: 55,
  })

  const refresh = useUpdate()
  useInterval(refresh, 1000)

  const { call: up, put: down } = percentData

  const transTime = value => {
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
  }

  const offset = (new Date().getTimezoneOffset() / 60) * -1
  // 这里的样式设定是因为可以保证百分百不会过低
  // const downWidth = `calc(${down}% - 8px)`
  // const upWidth = `calc(${up}% - 8px)`
  const downWidth = `calc(${down}% - 15px)`
  const upWidth = `calc(${up}% - 15px)`

  const fetchPercent = () => {
    if (!ternryOptionState?.currentCoin?.id) {
      return
    }
    getV1OptionProductCallAndPutPercentApiRequest({
      optionId: ternryOptionState?.currentCoin?.id,
    }).then(res => {
      if (res.isOk) {
        setPercentData(res.data as YapiGetV1OptionProductCallAndPutPercentData)
      }
    })
  }

  useEffect(() => {
    fetchPercent()
  }, [ternryOptionState?.currentCoin?.id])

  useInterval(fetchPercent, 120 * 1000)

  return (
    <div className={Styles.scoped}>
      <div className="time">
        {transTime(new Date())}(UTC{<IncreaseTag value={offset} hasColor={false} />})
      </div>
      <div className="bar-wrapper">
        <div
          className="bar down"
          style={{
            width: downWidth,
          }}
        ></div>
        <div className="h-3 w-4"></div>
        <div
          style={{
            width: upWidth,
          }}
          className="bar up"
        ></div>
        {/* <div
          style={{
            left: `calc(${down}% - 4px)`,
          }}
          className="white-clip"
        ></div> */}
      </div>
      <div className="up-down-word">
        <div>
          <span className="text-text_color_02">{t`features_ternary_option_trade_form_up_and_down_index_maocdrcauh`}</span>
          &nbsp;
          <span className="font-medium">{down}%</span>
        </div>
        <div>
          <span className="text-text_color_02">{t`features_ternary_option_trade_form_up_and_down_index_oecc6xacuk`}</span>
          &nbsp;
          <span className="font-medium">{up}%</span>
        </div>
      </div>
    </div>
  )
}

export default Header
