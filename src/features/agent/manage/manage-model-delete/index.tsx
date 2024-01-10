/**
 * 代理商 - 邀请码删除组建
 */
import CustomModal from '@/features/agent/modal'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { Button } from '@nbit/arco'
import { IApplyInvitationCodeList } from '@/typings/api/agent/agent-invite/apply'
import styles from './index.module.css'

interface Props {
  isDeleteShowModal: boolean
  onDeleteShowModal: () => void
  onManageInviteRemove: () => void
  currValue?: IApplyInvitationCodeList
}

function ManageModelDelete({ isDeleteShowModal, onDeleteShowModal, onManageInviteRemove, currValue }: Props) {
  return (
    <CustomModal style={{ width: 360 }} className={styles['manage-modal-delete']} visible={isDeleteShowModal}>
      <div className="agent-manage-submit-box">
        <div className="agent-manage-submit-header">
          <div className="manage-submit-header-title">{t`features_agent_manage_index_5101445`}</div>
          <div className="manage-submit-header-icon">
            <Icon name="close" hasTheme fontSize={22} onClick={() => onDeleteShowModal()} />
          </div>
        </div>
        <div className="agent-manage-submit-content">
          {t({
            id: 'features_agent_manage_index_umz5zwcd93',
            values: { 0: currValue?.name, 1: currValue?.invitationCode },
          })}
          {t`features_agent_manage_manage_model_delete_index_7owa_l4nt3`}
        </div>
        <div className="agent-manage-submit-footer">
          <Button className="button" type="primary" onClick={() => onDeleteShowModal()}>
            {t`trade.c2c.cancel`}
          </Button>
          <Button className="button" type="primary" onClick={() => onManageInviteRemove()}>
            {t`user.field.reuse_17`}
          </Button>
        </div>
      </div>
    </CustomModal>
  )
}

export default ManageModelDelete
