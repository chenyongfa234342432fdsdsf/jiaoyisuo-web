import { Button, Message, Modal } from '@nbit/arco'
import { ReactNode, useEffect, useState } from 'react'
import { YapiPostV1AgentActivationUserInfoListRatiosData } from '@/typings/yapi/AgentActivationUserInfoV1PostApi'
import { useAgentStatsStore } from '@/store/agent/agent-gains'
import { find } from 'lodash'
import {
  postV1AgentActivationUserInfoApiRequest,
  postV1AgentUpdateInvitedUserRebateRatioApiRequest,
} from '@/apis/agent'
import { t } from '@lingui/macro'
import { useAgentStore } from '@/store/agent'
import { useMount } from 'ahooks'
import Icon from '@/components/icon'
import RatioSlider from './ratio-slider'
import styles from './index.module.css'

function ReferralRatioModel({
  targetUid,
  children,
  ratios,
  onRatioUpdate,
}: {
  targetUid: number
  children: ReactNode
  ratios?: YapiPostV1AgentActivationUserInfoListRatiosData[]
  onRatioUpdate?: () => void
}) {
  const { userInBlackListInfo, fetchUserInBlackList } = useAgentStore()
  const [visible, setvisible] = useState(false)
  const { productCodeMap } = useAgentStatsStore()
  const [ratioValues, setratioValues] = useState<any[]>(ratios || [])
  const [defaultRatioValues, setdefaultRatioValues] = useState<any[]>(ratios || [])

  useMount(() => {
    fetchUserInBlackList()
  })

  const onSubmit = () => {
    postV1AgentUpdateInvitedUserRebateRatioApiRequest({
      invitedUid: targetUid,
      ratios: ratioValues,
    })
      .then(res => {
        if (res.isOk) {
          Message.info(t`user.field.reuse_40`)
          setvisible(false)
          onRatioUpdate && onRatioUpdate()
        } else {
          // reset ratio values
          setratioValues([...defaultRatioValues])
        }
      })
      .catch(e => {
        setratioValues([...defaultRatioValues])
      })
  }

  useEffect(() => {
    if (ratios) {
      setratioValues(ratios)
      setdefaultRatioValues(ratios)
    }
  }, [ratios])

  useEffect(() => {
    if (visible && !ratios)
      postV1AgentActivationUserInfoApiRequest({ targetUid }).then(res => {
        if (res.isOk && res.data) {
          setratioValues(res.data.ratios)
          setdefaultRatioValues(res.data.ratios)
        }
      })
  }, [visible])

  return (
    <>
      <span
        onClick={() => {
          if (userInBlackListInfo.onTheBlacklist) Message.info(t`features_agent_referral_ratio_modal_index_cper1sch7t`)
          else setvisible(true)
        }}
      >
        {children}
      </span>
      <Modal
        className={styles['referral-ratio-modal']}
        visible={visible}
        onCancel={() => setvisible(false)}
        title={t`features_agent_referral_ratio_modal_index_u2dh_e3rp4`}
        okButtonProps={{
          value: t`components_chart_header_data_2622`,
        }}
        footer={
          <>
            <Button onClick={() => setvisible(false)}>{t`trade.c2c.cancel`}</Button>
            <Button className={'ml-5'} onClick={onSubmit} type="primary">
              {t`components_chart_header_data_2622`}
            </Button>
          </>
        }
      >
        <span className="warning-msg-wrapper">
          <span className="msg-wrapper">
            <Icon name="msg" />
            <span className="text">{t`features_agent_referral_ratio_modal_index_nrd4mil_ol`}</span>
          </span>
        </span>
        {ratioValues?.map((ratio, index) => {
          // my ratio
          const originRatio = defaultRatioValues[index]
          const selfRatio = ratio?.parentRatio ? Number(ratio.parentRatio) : 0
          const selfRatioOrigin = originRatio?.parentRatio ? Number(originRatio?.parentRatio) : 0
          // friend ratio
          const childRatio = ratio?.selfRatio ? Number(ratio.selfRatio) : 0
          const totalRatio = selfRatio + childRatio
          const childRatioOrigin = totalRatio - selfRatioOrigin

          return (
            <div key={index} className="item-ratio-wrapper">
              <span className="title-name">
                {productCodeMap[ratio.productCd]} {t`features_agent_referral_ratio_modal_index_mia6tmunaz`}
                <span className="ratio">{totalRatio}%</span>
              </span>
              <RatioSlider
                value={childRatio}
                originValue={childRatioOrigin}
                max={totalRatio}
                onchange={(v: number) => {
                  const parent = v.toString()
                  const self = (totalRatio - v).toString()

                  setratioValues(prev => {
                    if (find(prev, each => each?.productCd === ratio.productCd)) {
                      return prev.map(each =>
                        each?.productCd === ratio.productCd
                          ? {
                              productCd: each.productCd,
                              parentRatio: self,
                              selfRatio: parent,
                            }
                          : each
                      )
                    }

                    return [
                      ...prev,
                      {
                        productCd: ratio.productCd,
                        parentRatio: self,
                        selfRatio: parent,
                      },
                    ]
                  })
                }}
              />
            </div>
          )
        })}
      </Modal>
    </>
  )
}

export default ReferralRatioModel
