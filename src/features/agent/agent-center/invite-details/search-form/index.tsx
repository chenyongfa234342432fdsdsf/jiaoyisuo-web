import { t } from '@lingui/macro'
import { useEffect, useState } from 'react'
import { Select, Message, Input, Form } from '@nbit/arco'
import { AssetSelect } from '@/features/assets/common/assets-select'
import Icon from '@/components/icon'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { useAgentCenterStore } from '@/store/agent/agent-center/center'
import { AgentModalTypeEnum, getInviteCertificationStatusTypeName } from '@/constants/agent/agent-center'
import { checkSearchKey, onGetAreaAgentLevelList } from '@/helper/agent/agent-center'
import { useDebounce, useUpdateEffect } from 'ahooks'
import styles from './index.module.css'

interface SearchItemProps {
  onSearch?(val): void
  onReset?(): void
}

export function SearchItem({ onSearch, onReset }: SearchItemProps) {
  const { currentModalTab, inviteDetailForm, userAgentList, areaAgentLevelList, updateInviteDetailForm } = {
    ...useAgentCenterStore(),
  }
  const [form] = Form.useForm()
  const FormItem = Form.Item
  const Option = Select.Option
  const [searchAdvertIdKey, setSearchAdvertIdKey] = useState<string>('')
  const debouncedSearchAdvertIdKey = useDebounce(searchAdvertIdKey, { wait: 500 })

  const realNameTypeList = getInviteCertificationStatusTypeName()

  /** 重置 */
  const onResetForm = () => {
    onReset && onReset()
    form.clearFields()
    Message.success(t`assets.financial-record.search.resetRemind`)
  }

  const onSearchList = (searchParams?) => {
    const params = {
      ...inviteDetailForm,
      ...searchParams,
    }
    onSearch && onSearch(params)
  }

  useEffect(() => {
    const { uid, isRealName } = inviteDetailForm || {}
    uid && form.setFieldValue('uid', uid)
    isRealName && form.setFieldValue('isRealName', isRealName)
  }, [])

  useEffect(() => {
    userAgentList?.includes(AgentModalTypeEnum?.area) && onGetAreaAgentLevelList()
  }, [userAgentList])

  useUpdateEffect(() => {
    updateInviteDetailForm({ ...inviteDetailForm, uid: debouncedSearchAdvertIdKey })
    onSearchList({ uid: debouncedSearchAdvertIdKey })
  }, [debouncedSearchAdvertIdKey])

  useEffect(() => {
    form.clearFields()
  }, [currentModalTab])

  return (
    <div className={styles.scoped}>
      <Form
        form={form}
        layout="inline"
        autoComplete="off"
        validateTrigger="onBlur"
        className="search-item"
        // onChange={handleValidateChange}
      >
        <FormItem field="uid" className="mb-filter-block">
          <Input
            allowClear
            className="assets-search-input"
            prefix={<Icon name="search" className="input-search-icon" hasTheme />}
            placeholder={t`features_agent_agency_center_invitation_details_index_5101534`}
            onChange={val => {
              if (val && !checkSearchKey(val)) {
                Message.warning(t`features_assets_common_search_form_coin_search_index_5101300`)
                setSearchAdvertIdKey(val)
                return
              }
              setSearchAdvertIdKey(val)
            }}
            onClear={() => {
              setSearchAdvertIdKey('')
            }}
            maxLength={100}
          />
        </FormItem>
        {currentModalTab === AgentModalTypeEnum.area && (
          <FormItem
            label={t`features_agent_invitation_v3_invitation_formfilter_v3_index_xocibthwhg`}
            field="rebateLevel"
            className="mb-filter-block"
          >
            <AssetSelect
              defaultActiveFirstOption
              placeholder={t`assets.financial-record.search.all`}
              onChange={val => {
                onSearchList({ rebateLevel: Number(val) })
              }}
            >
              <Option value={0} key={0}>
                {t`common.all`}
              </Option>
              {areaAgentLevelList.map(item => (
                <Option value={item} key={item}>
                  V{item}
                </Option>
              ))}
            </AssetSelect>
          </FormItem>
        )}
        <FormItem
          label={t`features_agent_agency_center_invitation_details_index_5101536`}
          field="isRealName"
          className="mb-filter-block"
        >
          <AssetSelect
            defaultActiveFirstOption
            placeholder={t`assets.financial-record.search.all`}
            onChange={val => {
              onSearchList({ isRealName: Number(val) })
            }}
          >
            {Object.keys(realNameTypeList)?.map(key => (
              <Option value={key} key={key}>
                {realNameTypeList[key]}
              </Option>
            ))}
          </AssetSelect>
        </FormItem>
        {/* <FormItem field="reset">
          <Button
            className={'mr-4'}
            type="primary"
            onClick={() => {
              onSearchList()
            }}
          >{t`assets.financial-record.search.search`}</Button>
          <Button onClick={() => onResetForm()}>{t`assets.financial-record.search.reset`}</Button>
        </FormItem> */}
      </Form>
    </div>
  )
}
