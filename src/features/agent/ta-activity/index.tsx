import { postV1AgentActivationApiRequest, postV1AgentActivationUserInfoApiRequest } from '@/apis/agent'
import Icon from '@/components/icon'
import {
  TaAgentActivitiesTitleMap,
  agentDateTimeTabEnum,
  taAgentActivitiesDetailEnum,
  taAgentUserDetailTitleMap,
} from '@/constants/agent/agent'
import { YapiPostV1AgentActivationUserInfoData } from '@/typings/yapi/AgentActivationUserInfoV1PostApi'
import {
  YapiPostV1AgentActivationApiRequest,
  YapiPostV1AgentActivationData,
} from '@/typings/yapi/AgentActivationV1PostApi'
import { Button, Card, DatePicker, Message, Modal } from '@nbit/arco'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { formatDatePickerData } from '@/helper/agent'
import { HandleDisableEndDate } from '@/features/user/utils/common'
import { t } from '@lingui/macro'
import { formatDate } from '@/helper/date'
import { useAgentStatsStore } from '@/store/agent/agent-gains'
import { useCopyToClipboard } from 'react-use'
import { IncreaseTag } from '@nbit/react'
import { link } from '@/helper/link'
import { agentModuleRoutes } from '@/constants/agent'
import { useMount } from 'ahooks'
import { useAgentStore } from '@/store/agent'
import {
  InviteFilterKycEnum,
  getInviteKycLevelEnumTitle,
  isAgentKycVerified,
  isAgtCheck,
} from '@/constants/agent/invite'
import LazyImage from '@/components/lazy-image'
import { oss_svg_image_domain_address_agent } from '@/constants/oss'
import styles from './index.module.css'
import ReferralRatioModel from '../referral-ratio-modal'
import DatetimeModal from '../common/datetime-modal'

function IconRowDisplay({ userInfo }: { userInfo?: YapiPostV1AgentActivationUserInfoData }) {
  const arr = [
    {
      key: 'email',
      title: () => t`user.safety_items_04`,
      isValid() {
        return !!userInfo?.email
      },
    },
    {
      key: 'mobileNumber',
      title: () => t`features_agent_ta_activity_index_xtvbez6dca`,
      isValid() {
        return !!userInfo?.mobileNumber
      },
    },
    {
      key: 'kycTypeInd',
      title: () => {
        return getInviteKycLevelEnumTitle(String(userInfo?.kycTypeInd))
      },
      isValid() {
        return isAgentKycVerified(String(userInfo?.kycTypeInd || ''))
      },
    },
  ]
  return (
    <div className="icon-row verified-checks pb-2">
      {arr.map((item, index) => {
        return (
          <span key={index} className="pr-4">
            {item.isValid() ? (
              <Icon className="verify-icon" name="login_satisfied" />
            ) : (
              <Icon className="verify-icon" name="rebate_no_authentication" hasTheme />
            )}

            <span className={`text-xs pl-1 ${item.isValid() ? 'text-buy_up_color' : 'text-text_color_04'}`}>
              {item.title()}
            </span>
          </span>
        )
      })}
    </div>
  )
}

const AgentDateTimeTabOptions = () => [
  {
    label: t`common.all`,
    value: agentDateTimeTabEnum.all,
  },
  {
    label: t`features_agent_agency_center_data_overview_index_5101503`,
    value: agentDateTimeTabEnum.today,
  },
  {
    label: t`features_agent_agency_center_data_overview_index_7rv9ftbbap`,
    value: agentDateTimeTabEnum.yesterday,
  },
  {
    label: t`features_agent_agency_center_data_overview_index_5101504`,
    value: agentDateTimeTabEnum.week,
  },
  {
    label: t`features/assets/saving/totalAssets/index-8`,
    value: agentDateTimeTabEnum.month,
  },
  {
    label: t`features_agent_ta_activity_index_hqwgu9hxda`,
    value: agentDateTimeTabEnum.custom,
  },
]

function formatAgentDateTimeTabValue(tabValue?: agentDateTimeTabEnum) {
  switch (tabValue) {
    case agentDateTimeTabEnum.today:
      return {
        startDate: dayjs().startOf('day').valueOf(),
        endDate: dayjs().endOf('day').valueOf(),
      }
    case agentDateTimeTabEnum.yesterday:
      return {
        startDate: dayjs().subtract(1, 'day').startOf('day').valueOf(),
        endDate: dayjs().subtract(1, 'day').endOf('day').valueOf(),
      }
    case agentDateTimeTabEnum.week:
      return {
        startDate: dayjs().startOf('week').valueOf(),
        endDate: dayjs().endOf('week').valueOf(),
      }
    case agentDateTimeTabEnum.month:
      return {
        startDate: dayjs().startOf('month').valueOf(),
        endDate: dayjs().endOf('month').valueOf(),
      }
    default:
      return {
        startDate: undefined,
        endDate: undefined,
      }
  }
}

function TaDateTimeTabs({ onChange }: { onChange: (value: ReturnType<typeof formatAgentDateTimeTabValue>) => void }) {
  const [value, setvalue] = useState<agentDateTimeTabEnum>(AgentDateTimeTabOptions()[0].value)
  const setDisableDate = (currentDate: dayjs.Dayjs) => {
    const endTime = dayjs().endOf('date').valueOf()
    return HandleDisableEndDate(currentDate, endTime)
  }
  useEffect(() => {
    onChange(formatAgentDateTimeTabValue(value))
  }, [value])

  const [datetimeModalVisible, setdatetimeModalVisible] = useState(false)
  return (
    <div className={styles['ta-datetime-tab']}>
      {AgentDateTimeTabOptions().map((option, index) => (
        <span key={index} onClick={() => setvalue(option.value)}>
          <span
            className={value === option.value ? 'checked' : ''}
            onClick={() => {
              option.value === agentDateTimeTabEnum.custom && setdatetimeModalVisible(true)
            }}
          >
            {option.label}
          </span>
        </span>
      ))}
      <DatetimeModal
        onsubmit={v => {
          onChange(v)
          setdatetimeModalVisible(false)
        }}
        visible={datetimeModalVisible}
        setvisible={setdatetimeModalVisible}
      />
      {/* <DatePicker.RangePicker
        className={'ta-date-picker'}
        // value={formatToDatePicker(chartFilterSetting)}
        onChange={v => {
          onChange(formatDatePickerData(v))
        }}
        style={{ minWidth: 210, height: 30 }}
        separator={t`features/assets/saving/history-list/index-0`}
        disabledDate={setDisableDate}
      /> */}
    </div>
  )
}

function TaActivitiesDetail({ activities }: { activities: YapiPostV1AgentActivationData | undefined }) {
  return (
    <div className="ta-activities ta-rebate-info">
      {Object.keys(TaAgentActivitiesTitleMap()).map((key, index) => (
        <div key={index}>
          <span className="label">{TaAgentActivitiesTitleMap()[key]}</span>
          {key === taAgentActivitiesDetailEnum.invitedNum || key === taAgentActivitiesDetailEnum.teamNum ? (
            <span className="value">{activities?.[key] || 0}</span>
          ) : (
            <span className="value">
              <IncreaseTag
                right={<span> USD</span>}
                hasColor={false}
                value={activities?.[key] || undefined}
                defaultEmptyText={'0.00'}
                kSign
                digits={2}
                delZero={false}
              />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function TaUserDetail({
  targetUid,
  user,
  onRatioUpdate,
}: {
  targetUid: number
  user: YapiPostV1AgentActivationUserInfoData | undefined
  onRatioUpdate: () => void
}) {
  const store = useAgentStore()
  const { productCodeMap } = useAgentStatsStore()

  useMount(() => {
    store.fetchUserInBlackList()
  })

  return (
    <div className="ta-activities">
      {isAgtCheck(user?.isAgt) &&
        user?.ratios?.map((ratio, index) => (
          <div key={index}>
            <span className="label">
              {productCodeMap?.[ratio.productCd]} {t`features_agent_ta_activity_index_ygv02afvpk`}
            </span>

            <span className="value">
              <span className="text-text_color_01 text-sm">
                {t`features_agent_agency_center_invitation_details_index_5101545`}
                {ratio?.parentRatio || 0}%{' '}
              </span>
              <span> / </span>
              <span className="text-text_color_01 text-sm">
                {t`features_agent_index_5101357`}
                {ratio?.selfRatio || 0}%
              </span>

              <ReferralRatioModel targetUid={targetUid} ratios={user?.ratios} onRatioUpdate={onRatioUpdate}>
                <span className="ml-2">
                  <Icon className="contract-edit" name="contract_edit" hasTheme />
                </span>
              </ReferralRatioModel>
            </span>
          </div>
        ))}
      {Object.keys(taAgentUserDetailTitleMap()).map((key, index) => {
        return (
          <div key={index}>
            <span className="label">{taAgentUserDetailTitleMap()[key]}</span>
            {key === 'registerTime' ? (
              <span className="value">{user?.[key] ? formatDate(user?.[key]) : '--'}</span>
            ) : (
              <span className="value">{user?.[key] || '--'}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TaActivity({ targetUid, children, onCloseCallback }) {
  const [visible, setvisible] = useState(false)
  const [currentStartEndTime, setcurrentStartEndTime] = useState<ReturnType<typeof formatAgentDateTimeTabValue>>(
    formatAgentDateTimeTabValue()
  )
  const [userInfo, setuserInfo] = useState<YapiPostV1AgentActivationUserInfoData>()
  const [details, setdetails] = useState<YapiPostV1AgentActivationData>()

  const [state, copyToClipboard] = useCopyToClipboard()
  const handleCopy = (key: number | undefined) => {
    if (!key) return
    copyToClipboard(key.toString())
    state.error ? Message.error(t`user.secret_key_02`) : Message.success(t`user.secret_key_01`)
  }
  useEffect(() => {
    if (visible)
      Promise.all([
        postV1AgentActivationUserInfoApiRequest({ targetUid }),
        postV1AgentActivationApiRequest({
          targetUid,
          ...currentStartEndTime,
        } as YapiPostV1AgentActivationApiRequest),
      ]).then(res => {
        const userInfoRes = res[0].data
        const detailsRes = res[1].data

        setuserInfo(userInfoRes)
        setdetails(detailsRes)
      })
  }, [visible, currentStartEndTime])

  const queryInviteDetails = () => {
    postV1AgentActivationUserInfoApiRequest({ targetUid }).then(res => {
      if (res.isOk && res.data) {
        setuserInfo(res.data)
      }
    })
  }

  return (
    <>
      <span onClick={() => setvisible(true)}>{children}</span>
      {visible && (
        <Modal
          className={styles['ta-modal-activity']}
          visible={visible}
          title={t`features_agent_ta_activity_index_j_tsl3_f11`}
          footer={
            <Button
              type="primary"
              onClick={() => {
                link(`${agentModuleRoutes.inviteCheckNew}/${targetUid}`)
              }}
            >{t`features_agent_ta_activity_index_xamdqsaqzi`}</Button>
          }
          onCancel={() => {
            setvisible(false)
            onCloseCallback && onCloseCallback()
          }}
        >
          <div className="ta-modal-header">
            <Icon className="avatar-icon" name="rebates_friends" />
            <div>
              <div className="flex flex-row items-center">
                <span className="nick-name">{userInfo?.nickName}</span>
                {userInfo?.kycTypeInd?.toString() === InviteFilterKycEnum.verified && (
                  <LazyImage
                    width={22}
                    height={16}
                    className="ml-2"
                    src={`${oss_svg_image_domain_address_agent}agent_name_verified.png`}
                  />
                )}

                {userInfo?.isAgt && (
                  <div className="ml-2 badage badage-isAgent">
                    <LazyImage width={20} height={20} src={`${oss_svg_image_domain_address_agent}agent_is_agent.png`} />
                  </div>
                )}
              </div>
              <div className="uid">
                <label className="uid-label">UID: {userInfo?.uid}</label>
                <span>
                  <Icon name="copy" hasTheme fontSize={16} onClick={() => handleCopy(userInfo?.uid)} />
                </span>
              </div>
              <div className="verified-checks">
                <IconRowDisplay userInfo={userInfo} />
              </div>
            </div>
          </div>
          <TaDateTimeTabs onChange={setcurrentStartEndTime} />
          <div className="text-xs text-text_color_03 pb-2 pt-4">
            {currentStartEndTime?.startDate && currentStartEndTime?.endDate ? (
              <>
                <span>{formatDate(currentStartEndTime.startDate)}</span>
                <span> ~ </span>
                <span>{formatDate(currentStartEndTime.endDate)}</span>
              </>
            ) : (
              <span>
                {t`features_agent_ta_activity_index_cyrer5r1fz`} {formatDate(userInfo?.registerTime || '')}
              </span>
            )}
          </div>
          <TaActivitiesDetail activities={details} />
          <TaUserDetail targetUid={targetUid} user={userInfo} onRatioUpdate={queryInviteDetails} />
        </Modal>
      )}
    </>
  )
}

export default TaActivity
