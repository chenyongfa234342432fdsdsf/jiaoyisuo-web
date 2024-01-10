import { postV1MemberBaseExtendInfoApiRequest } from '@/apis/vip'
import Icon from '@/components/icon'
import { Input } from '@/components/input'
import { PersonalCenterModifyUsernameRules } from '@/features/user/utils/validate'
import { t } from '@lingui/macro'
import { Button, Form, Message, Modal, Input as ArcoInput } from '@nbit/arco'
import { useRequest } from 'ahooks'
import { useUserStore } from '@/store/user'
import styles from './index.module.css'

const FormItem = Form.Item
const TextArea = ArcoInput.TextArea

const nickNameRulesInfo = () => [
  t`features_vip_vip_setting_modals_index_t75o1j6a2u`,
  t`features_vip_vip_setting_modals_index_iegmz1ebu9`,
  t`features_vip_vip_setting_modals_index_zhfa1nrpmd`,
]

const introRulesInfo = () => [
  t`features_vip_vip_setting_modals_index_hfgoxdb25v`,
  t`features_vip_vip_setting_modals_index_efhcyp0xqu`,
]

export function VipSettingNicknameModal({ visible, setvisible }) {
  const [form] = Form.useForm()

  const { userInfo, setUserInfo } = useUserStore()

  const rules = PersonalCenterModifyUsernameRules()

  const setNickName = async nickName => {
    const res = await postV1MemberBaseExtendInfoApiRequest(nickName)
    if (res.isOk) {
      Message.success(t`user.field.reuse_40`)
      setUserInfo(nickName)
      setvisible(false)
    }
  }

  const { run, loading } = useRequest(setNickName, { manual: true })

  return (
    <Modal
      className={styles['vip-setting-nickname-modal']}
      title={t`user.account_security.modify_username_03`}
      visible={visible}
      onCancel={() => setvisible(false)}
      footer={null}
      unmountOnExit
      autoFocus={false}
    >
      <Form form={form} layout="vertical" onSubmit={run} autoComplete="off" validateTrigger="onBlur">
        <FormItem
          field="nickName"
          requiredSymbol={false}
          rules={[rules.nickName]}
          {...(userInfo?.nickName && { initialValue: userInfo.nickName })}
          normalize={v => (v ? v.trimStart() : v)}
        >
          <Input maxLength={12} placeholder={t`features_vip_vip_setting_modals_index_a96pbotjdd`} />
        </FormItem>

        {nickNameRulesInfo().map((info, idx) => (
          <div key={idx} className="flex flex-row">
            <Icon name="prompt-symbol" className="prompt-icon" />
            <span className="text-sm text-text_color_03">{info}</span>
          </div>
        ))}

        <FormItem>
          <Button long loading={loading} type="primary" htmlType="submit">
            {t`user.field.reuse_17`}
          </Button>
        </FormItem>
      </Form>
    </Modal>
  )
}

export function VipSettingIntroModal({ visible, setvisible }) {
  const [form] = Form.useForm()

  const { userInfo, setUserInfo } = useUserStore()

  const setIntro = async introduction => {
    const res = await postV1MemberBaseExtendInfoApiRequest(introduction)
    if (res.isOk) {
      Message.success(t`user.field.reuse_40`)
      setUserInfo(introduction)
      setvisible(false)
    }
  }

  const { run, loading } = useRequest(setIntro, { manual: true })

  return (
    <Modal
      className={styles['vip-setting-intro-modal']}
      title={t`features_vip_vip_tier_setting_index_88afkk9wzd`}
      visible={visible}
      onCancel={() => setvisible(false)}
      footer={null}
      unmountOnExit
      autoFocus={false}
    >
      <Form form={form} layout="vertical" onSubmit={run} autoComplete="off" validateTrigger="onBlur">
        <FormItem
          field="introduction"
          requiredSymbol={false}
          {...(userInfo?.introduction && { initialValue: userInfo.introduction })}
          normalize={v => (v ? v.trimStart() : v)}
        >
          <TextArea maxLength={300} showWordLimit placeholder={t`features_vip_vip_setting_modals_index_voyzdvka02`} />
        </FormItem>

        {introRulesInfo().map((info, idx) => (
          <div key={idx} className="flex flex-row">
            <Icon name="prompt-symbol" className="prompt-icon" />
            <span className="text-sm text-text_color_03">{info}</span>
          </div>
        ))}

        <FormItem>
          <Button long loading={loading} type="primary" htmlType="submit">
            {t`user.field.reuse_17`}
          </Button>
        </FormItem>
      </Form>
    </Modal>
  )
}
