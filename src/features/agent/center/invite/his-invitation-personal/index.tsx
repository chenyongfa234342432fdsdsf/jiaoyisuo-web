/**
 *
 * TA 的邀请邀请人信息基本信息组建
 */
import { useEffect, useState } from 'react'
import { getUserInfo } from '@/helper/cache'
import { Tooltip, Message, Spin } from '@nbit/arco'
import Icon from '@/components/icon'
import { usePageContext } from '@/hooks/use-page-context'
import { useCopyToClipboard } from 'react-use'
import { AgentIsRealNameEnum, AgentModeEnumeration } from '@/constants/agent/agent'
import { formatCurrency } from '@/helper/decimal'
import { t } from '@lingui/macro'
import { useRequest } from 'ahooks'
import { AgentLevelIconMethod } from '@/features/agent/invitation-v3/invitation-details-v3/his-tools'
import { cloneDeep } from 'lodash'
import { getAgentCenterSetRebateRatio } from '@/apis/agent/agent-center/userDetails'
import { AgentProductRatioDate } from '@/typings/api/agent/agent-invite/apply'
import { InviteCertificationStatusTypeEnum } from '@/constants/agent/agent-center/index'
import AreaRebateModal from '@/features/agent/agent-invite/common/area-rebate-modal'
import ManageSetScale from '@/features/agent/manage/manage-set-scale'
import dayjs from 'dayjs'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import style from './index.module.css'

function HisInvitationPersonal({ foundation, ratio, onReturnMethod, centerHisInvitation, loading }) {
  const { visibleAreaRebateModal, updateVisibleAreaRebateModal } = {
    ...useAgentInviteV3Store(),
  }
  const { uid } = getUserInfo() // 获取当前用户信息
  const pageContext = usePageContext() // 获取路由参数
  const [isShowSetRatio, setIsShowSetRatio] = useState<boolean>(false) // 设置金字塔佣金比例 Modal 弹窗
  const [state, copyToClipboard] = useCopyToClipboard()
  const [productList, setProductList] = useState<AgentProductRatioDate[]>([]) // 产品线集合数据
  /**
   * UID 复制方法
   */
  const handleCopy = val => {
    if (!val) return
    copyToClipboard(val)
    state.error
      ? Message.error(t`assets.financial-record.copyFailure`)
      : Message.success(t`assets.financial-record.copySuccess`)
  }
  /**
   * 认证标识方法
   */
  const AuthenticationMethod = (RealName: number) => {
    let realNameObj = {
      isName: '--',
      isIcon: '',
      hasTheme: true,
    }
    if (RealName) {
      realNameObj.isName =
        RealName === InviteCertificationStatusTypeEnum.verified
          ? t`features_agent_agency_center_invitation_details_index_5101548`
          : t`features_agent_agency_center_invitation_details_index_5101549`
      realNameObj.isIcon =
        RealName === AgentIsRealNameEnum.Yes ? 'icon_agency_center_verified' : 'icon_agent_not_certified'
      realNameObj.hasTheme = RealName !== AgentIsRealNameEnum.Yes
    }
    return realNameObj
  }

  /**
   * 金字塔比例过滤方法
   */
  const pyramidFilteringMethod = productRebateList => {
    let RebateList = ''
    if (productRebateList && productRebateList.length > 0) {
      ratio.forEach(res => {
        productRebateList.forEach(resKey => {
          if (res.codeVal === resKey.productCd) {
            RebateList += `${res.codeKey} ${resKey?.childRatio || 0}% / `
          }
        })
      })
    }
    return (RebateList = RebateList.replace(/\/\s*[^/]*\s*$/, ''))
  }

  /**
   * 比例方法
   */
  const proportionalMethod = (productRebateList, ratioList) => {
    let data = [] as any
    if (productRebateList.length > 0) {
      ratioList.forEach(res => {
        productRebateList.forEach(resKey => {
          if (res.codeVal === resKey.productCd) {
            data.push({
              codeKey: res.codeKey,
              selfRatio: resKey.selfRatio,
              Comparison: resKey.childRatio || 0,
              productCd: resKey.productCd,
              total: Number(resKey?.selfRatio) + Number(resKey?.childRatio),
            })
          }
        })
      })
    }
    setProductList(data)
  }
  useEffect(() => {
    if (foundation?.productRebateList && ratio) {
      proportionalMethod(foundation?.productRebateList, ratio)
    }
  }, [foundation?.productRebateList, ratio])

  /**
   * 区域返佣比例方法
   */
  const RegionalRebateMethod = e => {
    return AgentLevelIconMethod(e?.rebateLevel)
  }

  /**
   * 金字塔比例修改事件
   */
  const onIconEven = () => {
    setIsShowSetRatio(true)
  }

  /**
   * 代理等级阶梯返佣弹框事件
   */
  const onAgentEventModel = () => {
    updateVisibleAreaRebateModal(true)
  }

  /**
   * 比例确定事件
   */
  const { run: onAddOrUpdate, loading: loadingModal } = useRequest(
    async () => {
      const res = await getAgentCenterSetRebateRatio({
        uid: foundation?.uid,
        rebateRatio: productList.map(row => ({
          selfRatio: Number(row.total || 0) - Number(row?.Comparison || 0),
          childRatio: Number(row.Comparison),
          productCd: row.productCd,
        })),
      })
      if (res.isOk && res.data) {
        Message.success(t`user.field.reuse_40`)
        centerHisInvitation()
        setIsShowSetRatio(false)
      }
    },
    { manual: true }
  )

  /**
   * 滑块事件
   */
  const onSliderChange = (productCd, val) => {
    const copyList = cloneDeep(productList)
    copyList.forEach(res => {
      if (productCd === res.productCd) {
        res.Comparison = val
      }
    })
    setProductList(copyList)
  }

  /**
   * 判断代理等级空值
   */

  const JudgeNullValues = val => {
    if (['number', 'string'].includes(typeof val)) {
      return Number(val) === 0
        ? t`features_agent_center_invite_his_invitation_personal_index_be3fc6iro5`
        : `${val}${t`features_agent_agent_center_rebate_details_index_lua3arq5gd`}`
    }
    return '--'
  }
  /**
   * 定义所有的基本信息数据
   */
  let list = [
    {
      name: 'UID',
      value: (
        <div className={style['personal-list-scoped']}>
          {foundation?.uid || '--'}
          <Icon
            className="personal-uid-icon"
            name="icon_agent_invite_copy"
            hasTheme
            onClick={() => handleCopy(foundation?.uid)}
            fontSize={16}
          />
        </div>
      ),
    },
    {
      name: t`features_agent_center_invite_his_invitation_personal_index_suejdq10yx`,
      value: <div>{JudgeNullValues(foundation?.agentLevel)}</div>,
    },
    {
      isDisplay: !foundation?.productRebateList, // 只有是金字塔代理才展示
      name: (
        <div className={style.table}>
          {t`features_agent_center_invite_his_invitation_personal_index_o1hzcgls0s`}
          {[1].includes(Number(foundation?.agentLevel)) && (
            <Icon className="table-text" onClick={onIconEven} name="modify_icon" fontSize={12} />
          )}
        </div>
      ),
      value: (
        <div className={style['personal-list-scoped']}>
          {foundation?.productRebateList ? pyramidFilteringMethod(foundation?.productRebateList) : '--'}
        </div>
      ),
    },
    {
      isDisplay: !(pageContext.urlParsed.search?.model === AgentModeEnumeration.area), // 只有是区域代理才展示
      name: t`features_agent_center_invite_his_invitation_personal_index_fvls7t5zuu`,
      value: (
        <div className={style['personal-list-scoped']}>
          <div className="personal-rank-ratio">
            <div>
              {foundation?.rebateRatio && (
                <Icon className="personal-grade-svg" fontSize={18} name={RegionalRebateMethod(foundation)} />
              )}
            </div>
            <div>{foundation?.rebateRatio ? `${foundation.rebateRatio}%` : '--'}</div>
            <div>
              {foundation?.rebateRatio && <Icon onClick={onAgentEventModel} fontSize={12} name="msg" hasTheme />}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: t`constants_agent_agent_jkly4smzop`,
      value: <div>{foundation?.inviteNum ? formatCurrency(foundation?.inviteNum) : 0}</div>,
    },
    {
      isDisplay: !(pageContext.urlParsed.search?.model !== AgentModeEnumeration.threeLevel), // 三级代理不展示
      name: t`features_agent_agency_center_invitation_details_index_qfbw6m22wx`,
      value: <div>{foundation?.teamNum ? formatCurrency(foundation.teamNum) : 0}</div>,
    },
    {
      name: t`features_agent_agency_center_invitation_details_index_5101536`,
      value: (
        <div className={style['personal-list-scoped']}>
          <div className="personal-real-name">
            <span>{AuthenticationMethod(Number(foundation?.isRealName))?.isName}</span>
          </div>
        </div>
      ),
    },
    {
      name: t`features_agent_agency_center_invitation_details_index_5101541`,
      value: (
        <div>{foundation?.registerDate ? dayjs(foundation.registerDate).format('YYYY-MM-DD HH:mm:ss') : '--'}</div>
      ),
    },
  ].filter(res => {
    return !res.isDisplay
  })

  /**
   * 返回上一级方法
   */
  const onReturnSuperior = () => {
    onReturnMethod()
  }

  return (
    <div className={style.scoped}>
      <Spin dot loading={loading}>
        <div className="personal-body-box">
          <div className="personal-individual">
            <div>{foundation?.nickName?.substring(0, 1) || '-'}</div>
            <div>
              {foundation?.nickName || '--'}
              <Tooltip position={'top'} content={<div>{AuthenticationMethod(foundation?.isRealName)?.isName}</div>}>
                <span className="personal-tooltip">
                  <Icon
                    name={AuthenticationMethod(foundation?.isRealName)?.isIcon}
                    hasTheme={AuthenticationMethod(foundation?.isRealName)?.hasTheme}
                  />
                </span>
              </Tooltip>
            </div>
            {/* 当基本信息展示为当前登陆用户的就没有返回上级按钮 */}
            {foundation?.uid && String(uid) !== String(foundation.uid) && (
              <div onClick={onReturnSuperior}>{t`features_agent_invitation_index_5101594`}</div>
            )}
          </div>

          <div className="personal-list-box">
            {list.map((row, index) => {
              return (
                <div
                  key={index}
                  className={
                    pageContext.urlParsed.search?.model === AgentModeEnumeration.pyramid
                      ? 'personal-list-width3'
                      : 'personal-list-width12'
                  }
                >
                  <div className="personal-list-name">{row?.name || ''}</div>
                  <div className="personal-list-value">{row?.value || ''}</div>
                </div>
              )
            })}
          </div>
        </div>
      </Spin>
      <ManageSetScale
        loading={loadingModal}
        productRebateList={foundation?.productRebateList}
        onIsShowSetRatio={setIsShowSetRatio}
        productList={productList}
        touchId={'1'}
        isShowSetRatio={isShowSetRatio}
        AddOrUpdate={() => {
          onAddOrUpdate()
        }}
        onSliderChange={(productCd, val) => {
          onSliderChange(productCd, val)
        }}
      />

      {visibleAreaRebateModal && (
        <AreaRebateModal visible={visibleAreaRebateModal} setVisible={updateVisibleAreaRebateModal} />
      )}
    </div>
  )
}

export default HisInvitationPersonal
