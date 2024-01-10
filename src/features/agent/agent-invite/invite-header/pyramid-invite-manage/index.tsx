/**
 * 代理商 - 邀请返佣页 - 金字塔邀请码管理
 */
import { t } from '@lingui/macro'
import Link from '@/components/link'
import { useEffect, useState } from 'react'
import { fetchDefaultInvCode, fetchInvitationCodeQuery } from '@/apis/agent/agent-invite/apply'
import { Message, Trigger } from '@nbit/arco'
import classNames from 'classnames'
import Icon from '@/components/icon'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { getAgentInviteCodeManage } from '@/helper/route/agent'
import styles from './index.module.css'

interface IDefaultInviteCodeProps {
  onCallback?: () => void
}
function PyramidInviteManage(props: IDefaultInviteCodeProps) {
  const { onCallback } = props || {}
  const [popupVisible, setPopupVisible] = useState(false)
  const { defaultInviteCodeData, inviteCodeList, updateInviteCodeList } = useAgentInviteV3Store()

  /**
   * 邀请码列表查询
   */
  const inviteManagePageList = async (page = '1', pageSize = '5') => {
    const res = await fetchInvitationCodeQuery({ page, pageSize })
    if (res.isOk && res.data) {
      updateInviteCodeList(res.data?.list ?? [])
    }
  }

  /**
   * 设置默认邀请码
   */
  const onSetDefault = async id => {
    const res = await fetchDefaultInvCode({
      invitationCodeId: id,
    })
    if (res.isOk && res.data) {
      Message.success(t`features/user/personal-center/settings/converted-currency/index-0`)
      inviteManagePageList()
      onCallback && onCallback()
      setPopupVisible(false)
    }
  }

  useEffect(() => {
    inviteManagePageList()
  }, [])

  return (
    <div className={styles['pyramid-invite-manage']}>
      <div className="invite-code-name">
        {/* 金字塔邀请码管理 */}
        {inviteCodeList?.length > 1 ? (
          <div className={classNames(styles['trigger-wrapper'])}>
            <Trigger
              popup={() => (
                <div className={styles['menu-wrapper']}>
                  {inviteCodeList?.map(v => (
                    <div
                      className="cell"
                      key={v.id}
                      onClick={() => {
                        onSetDefault(v.id)
                      }}
                    >
                      <div className={classNames('cell-wrap', { active: defaultInviteCodeData?.id === v.id })}>
                        {v.name || '--'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              onVisibleChange={setPopupVisible}
              popupVisible={popupVisible}
              position="bl"
            >
              <div className="name-wrap">
                <div className="name">{defaultInviteCodeData?.pyramid?.name || '--'}</div>
                <Icon
                  className="icon"
                  name={popupVisible ? 'icon_agent_away' : 'icon_agent_drop'}
                  hasTheme
                  onClick={() => setPopupVisible(true)}
                />
              </div>
            </Trigger>
          </div>
        ) : (
          <span>{defaultInviteCodeData?.pyramid?.name || '--'}</span>
        )}
      </div>
      <Link className="link-text" href={getAgentInviteCodeManage()}>
        {t`features_agent_agent_invite_invite_header_pyramid_invite_manage_index_c9hvo8qqz6`}
      </Link>
    </div>
  )
}

export default PyramidInviteManage
