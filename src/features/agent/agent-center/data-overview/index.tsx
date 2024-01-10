/**
 * 数据总览 - 代理中心
 */
import { useEffect } from 'react'
import { useRequest, useUpdateEffect } from 'ahooks'
import { DatePicker, Message, Tooltip } from '@nbit/arco'
import { t } from '@lingui/macro'
import { HandleDisableEndDate } from '@/features/user/utils/common'
import FullScreenSpin from '@/features/user/components/full-screen-loading'
import dayjs from 'dayjs'
import Icon from '@/components/icon'
import { useAgentCenterStore } from '@/store/agent/agent-center/center'
import { getAgentLevelIconName } from '@/constants/agent/agent-invite'
import { getAgentModelInfo, isDateIntervalValid, rateFilterAgent } from '@/helper/agent/agent-center'
import { getAgentCenterOverviewData } from '@/apis/agent/agent-center'
import { AgentModalTypeEnum, DateTypeEnum, IAgentCurrencyList } from '@/constants/agent/agent-center'
import { IAgentRebateOverviewData } from '@/typings/api/agent/agent-center'
import { getPeriodDayTime } from '@/helper/date'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { oss_area_code_image_domain_address } from '@/constants/oss'
import { usePersonalCenterStore } from '@/store/user/personal-center'
import { SetCurrency } from './set-currency'

const DatePickerRangePicker = DatePicker.RangePicker

enum NoDataEnum {
  zero = 0, // 无数据默认值
}

type overviewDateTabType = {
  text: string
  value: number
  starTime: number
  endTime: number
}

const hiddenSymbols = '******' // 隐藏星号
const timeFormat = 'YYYY-MM-DD HH:mm:ss' // 时间格式

function AgentCenterDataOverview() {
  const { fiatCurrencyData, getFiatCurrencyData } = usePersonalCenterStore()
  const memberCurrencyList = fiatCurrencyData?.currencyList
  const {
    overviewData,
    overviewParams,
    currentModalTab,
    encryption,
    currentCurrency: { currencyEnName },
    updateEncryption,
    updateOverviewParams,
    updateOverviewData,
    updateAgentCurrencyList,
    updateCurrentCurrency,
  } = useAgentCenterStore() || {}

  const { updateVisibleThreeLevelRatioModal, updateVisibleAreaRebateModal } = {
    ...useAgentInviteV3Store(),
  }

  const overviewDateTab = [
    {
      text: t`features_agent_agency_center_data_overview_index_5101503`,
      value: DateTypeEnum.today,
      starTime: getPeriodDayTime(DateTypeEnum.today).start,
      endTime: getPeriodDayTime(DateTypeEnum.today).end,
    },
    {
      text: t`features_agent_agency_center_data_overview_index_7rv9ftbbap`,
      value: DateTypeEnum.yesterday,
      starTime: getPeriodDayTime(DateTypeEnum.yesterday).start,
      endTime: dayjs().subtract(1, 'day').endOf('day').valueOf(),
    },
    {
      text: t`features_agent_gains_index_5101565`,
      value: DateTypeEnum.week,
      starTime: getPeriodDayTime(DateTypeEnum.week).start,
      endTime: getPeriodDayTime(DateTypeEnum.week).end,
    },
    {
      text: t`features_agent_gains_index_5101566`,
      value: DateTypeEnum.month,
      starTime: getPeriodDayTime(DateTypeEnum.month).start,
      endTime: getPeriodDayTime(DateTypeEnum.month).end,
    },
  ]

  const formatTimeStamp = (time?: number) => {
    if (time) {
      return dayjs(time).format(timeFormat)
    }

    return dayjs().format(timeFormat)
  }

  /** 设置时间组件禁用时间 */
  const setDisableDate = (currentDate: dayjs.Dayjs) => {
    const endTime = dayjs().endOf('date').valueOf()
    return HandleDisableEndDate(currentDate, endTime)
  }

  /** 获取总览数据 */
  const getOverviewData = async (startDate?: number, endDate?: number) => {
    const params = {
      model: currentModalTab,
      startTime: startDate || getPeriodDayTime(overviewDateTab[0]?.value).start,
      endTime: endDate || getPeriodDayTime(overviewDateTab[0]?.value).end,
    }

    const res = await getAgentCenterOverviewData(params)
    if (!res.isOk || !res.data) {
      return
    }

    const data = res.data || overviewData || {}
    updateOverviewData(data)
  }
  const { run: getHistoryOverview, loading } = useRequest(getOverviewData, { manual: true })

  /** 处理自定义时间 */
  const handleCustomTimeOnChange = (_: string[], date: dayjs.Dayjs[]) => {
    const starTime = date[0].startOf('date').valueOf()
    const endTime = date[1].endOf('date').valueOf()
    if (starTime && endTime) {
      if (!isDateIntervalValid(starTime, endTime)) {
        return Message.error(t`features_agent_center_invite_his_personal_modal_index_xmq5nsydjo`)
      }
    }
    updateOverviewParams({
      dateType: DateTypeEnum.custom,
      model: currentModalTab,
      startTime: starTime,
      endTime,
    })
    getHistoryOverview(starTime, endTime)
  }

  /** tab 时间切换处理 */
  const handleSelectTime = (v: overviewDateTabType) => {
    updateOverviewParams({
      dateType: v.value,
      model: currentModalTab,
      startTime: v.starTime,
      endTime: v.endTime,
    })

    getHistoryOverview(v.starTime as number, v.endTime as number)
  }

  useEffect(() => {
    if (!currentModalTab) return
    getHistoryOverview()
  }, [currentModalTab])

  useEffect(() => {
    getFiatCurrencyData()
  }, [])

  useUpdateEffect(() => {
    let agentCurrency: IAgentCurrencyList[] = []
    let memberCurrency: IAgentCurrencyList[] = []
    if (!overviewData?.currencySymbol) return
    if (overviewData?.currencySymbol) {
      agentCurrency = [{ currencyEnName: overviewData?.currencySymbol, offset: 2, logo: overviewData?.webLogo }]
    }
    if (memberCurrencyList?.length > 0) {
      memberCurrency = memberCurrencyList
        .map(item => {
          return {
            currencyEnName: item?.currencyEnName || '',
            offset: 2,
            logo: `${oss_area_code_image_domain_address}${item?.countryFlagImg}.png`,
          }
        })
        .sort((a, b) => {
          if (a.currencyEnName === overviewData?.currencySymbol) return -1
          if (b.currencyEnName === overviewData?.currencySymbol) return 1
          return 0
        })
    }

    const isRepeat = memberCurrency?.some(item => item.currencyEnName === overviewData?.currencySymbol)
    updateAgentCurrencyList(isRepeat ? memberCurrency : [...agentCurrency, ...memberCurrency])
    const newAgentCurrencyList = isRepeat ? memberCurrency : [...agentCurrency, ...memberCurrency]

    if (!currencyEnName || !newAgentCurrencyList?.some(item => item.currencyEnName === currencyEnName)) {
      updateCurrentCurrency(newAgentCurrencyList[0])
    }

    updateAgentCurrencyList(newAgentCurrencyList)
  }, [overviewData?.currencySymbol, fiatCurrencyData])

  const renderDataItem = () => {
    const totalData: IAgentRebateOverviewData = overviewData[`${currentModalTab}AgentRebateDto`]

    const inviteCommonInfo = [
      {
        icon: 'c2c_order_history_hover',
        text: t`features_agent_agency_center_data_overview_index_5101508`,
        value: totalData?.inviteNum ?? NoDataEnum.zero,
        reactDom: null,
        showNew: totalData?.inviteNewAdd || null,
      },
      {
        icon: 'c2c_order_history_hover',
        text: (
          <div>
            {t`features_agent_agency_center_data_overview_index_o2y6ibxmqh`}
            {currentModalTab === AgentModalTypeEnum.threeLevel && (
              <Tooltip
                content={
                  <div className="tips-wrap">{t`features_agent_agent_center_data_overview_index_ozzwkbarfb`}</div>
                }
              >
                <span>
                  <Icon className="ml-1" name="msg" hasTheme />
                </span>
              </Tooltip>
            )}
          </div>
        ),
        value: totalData?.teamNum ?? NoDataEnum.zero,
        reactDom: null,
        showNew: totalData?.teamNewAdd || null,
      },
    ]

    const dataReactDom = {
      area: [
        {
          icon: 'c2c_order_history_hover',
          text: t`features_agent_agent_center_data_overview_index_rqscngjrsu`,
          value: totalData?.rebateLevel ?? NoDataEnum.zero,
          reactDom: (
            <div className="model-grade">
              <div className="my-grade">
                <Icon name={getAgentLevelIconName(totalData?.rebateLevel || 1) || ''} className="mr-3" />
              </div>
              <div className="ratio-info">
                <div className="grade">
                  <span>{totalData?.rebateRatio || 0}%</span>
                </div>
              </div>
              <Icon
                name="msg"
                hasTheme
                className="msg-icon"
                onClick={() => {
                  updateVisibleAreaRebateModal(true)
                }}
              />
            </div>
          ),
        },
        {
          icon: 'c2c_order_history_hover',
          text: t`features_agent_agent_center_data_overview_index_jqjpafwdsi`,
          value: rateFilterAgent(totalData?.teamFee ?? NoDataEnum.zero),
          reactDom: null,
          showUnit: true,
        },
        ...inviteCommonInfo,
      ],
      threeLevel: [
        {
          icon: 'c2c_order_history_hover',
          text: t`features_agent_agent_center_data_overview_index_bgsll4tiin`,
          value: totalData?.rebateLevel ?? NoDataEnum.zero,
          reactDom: (
            <div className="model-grade">
              <div className="my-grade">
                <Icon name={getAgentLevelIconName(totalData?.rebateLevel) || ''} className="mr-3" />
              </div>
              <div className="ratio-info">
                <div className="grade">
                  {t`features_agent_agent_invite_invite_header_agent_model_index_huadwtlbyr`}
                  <span>{totalData?.firstRebateRatio}%</span> /
                </div>
                <div className="grade ml-1">
                  {t`features_agent_agent_invite_invite_header_agent_model_index_ephj5yutej`}
                  <span>{totalData?.secondRebateRatio}%</span> /
                </div>
                <div className="grade ml-1">
                  {t`features_agent_agent_invite_invite_header_agent_model_index_ib52hqfaqs`}
                  <span>{totalData?.thirdRebateRatio}%</span>
                </div>
              </div>
              <Icon
                name="msg"
                hasTheme
                className="msg-icon"
                onClick={() => {
                  updateVisibleThreeLevelRatioModal(true)
                }}
              />
            </div>
          ),
        },
        {
          icon: 'c2c_order_history_hover',
          text: t`features_agent_agent_center_data_overview_index_k8v8fztwbm`,
          value: rateFilterAgent(totalData?.firstLevelFee),
          reactDom: null,
          showUnit: true,
        },
        {
          icon: 'c2c_order_history_hover',
          text: t`features_agent_agent_center_data_overview_index_ux776lmyw1`,
          value: rateFilterAgent(totalData?.secondLevelFee),
          reactDom: null,
          showUnit: true,
        },
        {
          icon: 'c2c_order_history_hover',
          text: t`features_agent_agent_center_data_overview_index_lcanjp2d6m`,
          value: rateFilterAgent(totalData?.thirdLevelFee),
          reactDom: null,
          showUnit: true,
        },
        ...inviteCommonInfo,
      ],
      pyramid: [
        {
          icon: 'c2c_order_history_hover',
          text: t`features_agent_agent_center_data_overview_index_jqjpafwdsi`,
          value: rateFilterAgent(totalData?.teamFee),
          reactDom: null,
          showUnit: true,
        },
        ...inviteCommonInfo,
      ],
    }

    const dataItem = dataReactDom[currentModalTab] || []

    return dataItem?.map((v, index) => (
      <div className="item" key={index}>
        <div className="text">
          <label>{v.text}</label>
        </div>
        <div className="num">
          {!encryption ? (
            v?.reactDom ? (
              v?.reactDom
            ) : (
              <div>
                {v.value}
                {v?.showUnit && <span className="ml-1">{currencyEnName}</span>}
                {v?.showNew && <span className="info-new">(+{v?.showNew})</span>}
              </div>
            )
          ) : (
            <label>{hiddenSymbols}</label>
          )}
        </div>
      </div>
    ))
  }

  return (
    <>
      <div className="agent-center-title">
        <Icon name="icon_agency_center_data" hasTheme />
        <label>{t`features_agent_agency_center_data_overview_index_5101505`}</label>
      </div>

      <div className="overview-container">
        <div className="time-tab">
          {overviewDateTab.map((v, index) => (
            <span
              className={overviewParams?.dateType === v.value ? 'active time-type' : 'time-type'}
              key={index}
              onClick={() => handleSelectTime(v)}
            >
              {v.text}
            </span>
          ))}

          <div className="time-type inline-block mr-3">
            <span className="mr-1">{t`features_agent_agency_center_data_overview_index_5101506`}</span>
            <Tooltip content={<div>{t`features_agent_agent_center_data_overview_index_2cb_zhj_ak`}</div>}>
              <span className="!ml-1">
                <Icon name="msg" hasTheme />
              </span>
            </Tooltip>
          </div>

          <div className="inline-block">
            <DatePickerRangePicker
              value={[overviewParams?.startTime, overviewParams?.endTime]}
              style={{ width: 260 }}
              separator={t`features/assets/saving/history-list/index-0`}
              // prefix={<Icon name="asset_overview_icon_time" hasTheme />}
              onChange={handleCustomTimeOnChange}
              disabledDate={setDisableDate}
            />
          </div>
        </div>

        <div className="time-info">
          <label>{`${formatTimeStamp(overviewParams.startTime)} - ${formatTimeStamp(overviewParams.endTime)}`}</label>
        </div>

        <div className="income">
          <div className="income-wrap">
            <div className="overview-header">
              <div className="item left-icon">
                <div className="text">
                  <label>
                    {t`features_agent_index_5101414`}
                    {getAgentModelInfo(currentModalTab)?.modelName}
                    {t`features_api_service_component_api_service_project_index_5101419`}
                  </label>
                  <Icon
                    name={encryption ? `icon_list_close` : 'icon_list_open'}
                    className="text-lg"
                    hasTheme
                    onClick={() => updateEncryption(!encryption)}
                  />
                </div>
                <div className="total-wrap">
                  {!encryption ? (
                    <>
                      <div className="total-val">
                        {`${rateFilterAgent((overviewData[`${currentModalTab}AgentRebateDto`] || {})?.rebateAmount)}`}
                      </div>
                      <SetCurrency />
                    </>
                  ) : (
                    <label>{hiddenSymbols}</label>
                  )}
                </div>
              </div>
            </div>
            <div className="footer">{renderDataItem()}</div>

            <FullScreenSpin isShow={loading} customBackground="bg-card_bg_color_01" />
          </div>
          <div className="tips">
            <label>{t`features_agent_agency_center_data_overview_index_5101510`}</label>
          </div>
        </div>
      </div>
    </>
  )
}

export default AgentCenterDataOverview
