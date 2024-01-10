/**
 * 编辑逐仓名称
 */
import { t } from '@lingui/macro'
import AssetsPopUp from '@/features/assets/common/assets-popup'
import { Message } from '@nbit/arco'
import { postPerpetualGroupModifyName } from '@/apis/assets/futures/common'
import { useLockFn } from 'ahooks'
import { useRef } from 'react'
import { onCheckPositionName } from '@/helper/reg'
import AccountName from '@/features/assets/futures/common/edit-group-name/account-name'
import styles from './index.module.css'

interface EditGroupNameModalProps {
  /** 合约组 ID */
  groupId: string
  groupName: string
  visible: boolean
  setVisible: (val: boolean) => void
  onSubmitFn?(): void
}

export function EditGroupNameModal(props: EditGroupNameModalProps) {
  const { groupId, groupName, visible, setVisible, onSubmitFn } = props || {}
  const maxLength = 20
  const accountNameRef = useRef<Record<'getAccountSelectName', () => void>>()

  const onSubmit = useLockFn(async () => {
    const name = accountNameRef.current?.getAccountSelectName()
    if (!name) {
      Message.error(t`features_assets_futures_common_edit_group_name_index_1zi_jqapjg47_5dcw9a-p`)
      return
    } else if (!onCheckPositionName(name)) {
      Message.error(t`features_assets_futures_common_edit_group_name_index_xcirxhk2wofm35bs_q0ee`)
      return
    } else if ((String(name) || '').length > maxLength) {
      Message.error(t`features_assets_futures_common_edit_group_name_index_fxzpdkkyzzoayndixwqs5`)
      return
    }

    const res = await postPerpetualGroupModifyName({ groupId, name: String(name).trim() })
    const { isOk, data } = res || {}
    if (!isOk || !data) return
    if (data?.isSuccess) {
      Message.info(t`features_assets_futures_common_edit_group_name_index_haip8v3bx6rjrg_ensqzj`)
      onSubmitFn && onSubmitFn()
      setVisible(false)
    }
  })

  return (
    <AssetsPopUp
      title={null}
      visible={visible}
      onCancel={() => {
        setVisible(false)
      }}
      onOk={() => {
        onSubmit()
      }}
      isResetCss
    >
      <div>
        <div className={`${styles['position-modal-header-root']}`}>
          <div className="px-8">
            <div className="position-modal-header-title">{t`features_assets_futures_futures_details_edit_position_name_modal_index_jzkpxzxyvc`}</div>
          </div>
        </div>
        <AccountName groupName={groupName} ref={accountNameRef} />
      </div>
    </AssetsPopUp>
  )
}
