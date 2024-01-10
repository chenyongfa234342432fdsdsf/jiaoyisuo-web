/**
 * 代理商 - 邀请码名称修改组建
 */

import CustomModal from '@/features/agent/modal'
import { t } from '@lingui/macro'
import { Button, Input } from '@nbit/arco'
import Icon from '@/components/icon'
import styles from './index.module.css'

interface Props {
  isShow: boolean // 弹框显示隐藏值
  value?: string // input 输入框值
  onCloseHide?: (isShow: boolean) => void // 弹框关闭方法
  InvitationCodeNameChange?: (name: string) => void // input 中的 Change 方法，传递当前输入对象
  updateInvitationCodeName?: () => void // 弹框确认按钮方法
}

function ManageModelName({
  isShow = false,
  value,
  onCloseHide,
  InvitationCodeNameChange,
  updateInvitationCodeName,
}: Props) {
  return (
    <div>
      <CustomModal style={{ width: 444 }} className={styles['agent-modal-name']} visible={isShow}>
        <div className="update-invitation-code">
          <div className="invitation-code-header">
            <div className="invitation-code-header-title">{t`features_agent_index_5101408`}</div>
            <div>
              <Icon name="close" hasTheme fontSize={18} onClick={() => onCloseHide?.(false)} />
            </div>
          </div>

          <div className="invitation-code-content">
            <Input
              className="invitation-code"
              maxLength={30}
              showWordLimit
              value={value}
              onChange={InvitationCodeNameChange}
              placeholder={t`features_agent_manage_index_5101430`}
            />
          </div>

          <div className="invitation-code-footer">
            <Button className="button" type="secondary" onClick={() => onCloseHide?.(false)}>
              {t`trade.c2c.cancel`}
            </Button>
            <Button className="button" type="primary" disabled={!value} onClick={() => updateInvitationCodeName?.()}>
              {t`components_chart_header_data_2622`}
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  )
}

export default ManageModelName
