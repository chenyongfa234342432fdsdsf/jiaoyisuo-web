/**
 * 代理商 - 邀请返佣页 - 默认邀请码及邀请链接
 */
import { useState } from 'react'
import { Input, Message } from '@nbit/arco'
import Icon from '@/components/icon'
import { t } from '@lingui/macro'
import { useCopyToClipboard } from 'react-use'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { getInviteLink } from '@/helper/agent/agent-invite'
import QRCodeModal from '../../common/qr-code-modal'

export function InviteCodeForm() {
  const agentInviteStore = useAgentInviteV3Store()
  const { defaultInviteCodeData: inviteCodeData } = {
    ...agentInviteStore,
  }
  const [visibleQRCodeModal, setVisibleQRCodeModal] = useState(false)
  const inviteCode = inviteCodeData?.invitationCode || ''
  const inviteLink = getInviteLink(inviteCode)

  /** 复制功能 */
  const [state, copyToClipboard] = useCopyToClipboard()
  const onCopy = (val: string) => {
    if (!val) return
    copyToClipboard(val)
    state.error
      ? Message.error(t`assets.financial-record.copyFailure`)
      : Message.success(t`assets.financial-record.copySuccess`)
  }

  const renderCopyIcon = (val: string) => {
    if (!inviteCode) return
    return (
      <span className="ml-2">
        <Icon name="icon_agent_invite_copy" hasTheme className="text-sm" onClick={() => onCopy(val)} />
      </span>
    )
  }

  return (
    <>
      <div className="form-item">
        {inviteCode && (
          <div className="qr-code">
            <Icon
              name="rebates_drawing-qr"
              hasTheme
              onClick={() => {
                setVisibleQRCodeModal(true)
              }}
            />
          </div>
        )}
        <div className="flex-1">
          <Input
            readOnly
            prefix={<div className="left-box-info">{t`features_agent_index_5101364`}</div>}
            suffix={
              <div className="right-box-info">
                <span className="input-text">{inviteCode || '--'}</span>
                {renderCopyIcon(inviteCode)}
              </div>
            }
          />
        </div>
      </div>
      <div className="form-item">
        <Input
          readOnly
          prefix={<div className="left-box-info">{t`features_agent_index_5101368`}</div>}
          suffix={
            <div className="right-box-info">
              <span className="input-text">{inviteLink || '--'}</span>
              {renderCopyIcon(inviteLink)}
            </div>
          }
        />
      </div>
      <QRCodeModal
        inviteCode={inviteCode}
        inviteLink={inviteLink}
        visible={visibleQRCodeModal}
        setVisible={setVisibleQRCodeModal}
      />
    </>
  )
}
