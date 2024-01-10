import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { Button, Select, Message, Input, Form, InputNumber } from '@nbit/arco'
import { AssetSelect } from '@/features/assets/common/assets-select'
import { AdvertListReq } from '@/typings/api/c2c/advertise/post-advertise'
import { getStoreEnumsToOptions } from '@/helper/assets'
import { useAgentInviteV3Store } from '@/store/agent/agent-invite-v3'
import { useAgentCenterStore } from '@/store/agent/agent-center/center'
import { getTextFromStoreEnums } from '@/helper/store'
import { AgentModalTypeEnum } from '@/constants/agent/agent-center'
import styles from './index.module.css'

interface SearchItemProps {
  onSearch?(val): void
  onReset?(): void
  searchParams?: AdvertListReq
}

export function SearchItem({ onSearch, onReset }: SearchItemProps) {
  const { agentEnums } = {
    ...useAgentInviteV3Store(),
  }
  const { rebateDetailForm, productLine, currentModalTab } = {
    ...useAgentCenterStore(),
  }
  const [form] = Form.useForm()
  const FormItem = Form.Item
  const Option = Select.Option
  const rebateTypeList = getStoreEnumsToOptions(agentEnums.agentRebateTypeCdEnum.enums)

  /** 重置 */
  const onResetForm = () => {
    onReset && onReset()
    form.clearFields()
    Message.success(t`assets.financial-record.search.resetRemind`)
  }

  const onSearchList = () => {
    const minAmount = Number(form.getFieldValue('minAmount'))
    const maxAmount = Number(form.getFieldValue('maxAmount'))
    if ((!minAmount && maxAmount) || (minAmount && !maxAmount)) {
      Message.error(t`features_agent_agent_center_rebate_details_search_form_index_zntn8o3ghd`)
      return
    }
    if (minAmount && maxAmount) {
      if (minAmount > maxAmount) {
        Message.error(t`features_agent_agent_center_rebate_details_search_form_index_ebnkghxns9`)
        return
      }
    }
    const params = {
      ...rebateDetailForm,
      productCd: form.getFieldValue('productCd'),
      rebateType: form.getFieldValue('rebateType'),
      minAmount,
      maxAmount,
    }
    onSearch && onSearch({ ...params })
  }

  useEffect(() => {
    form.clearFields()
  }, [currentModalTab])

  return (
    <div className={styles.scoped}>
      <Form form={form} layout="inline" autoComplete="off" className="search-item" onSubmit={onSearchList}>
        <FormItem
          label={t`features_assets_financial_record_search_form_index_njivosohlh`}
          field="productCd"
          className="mb-filter-block"
        >
          <AssetSelect
            defaultActiveFirstOption
            placeholder={t`assets.financial-record.search.all`}
            // onChange={val => {
            //   onSearchList({ productCd: val })
            // }}
          >
            <Option key="all" value="">
              {t`common.all`}
            </Option>
            {productLine.map(item => (
              <Option value={item} key={item}>
                {getTextFromStoreEnums(item || '', agentEnums.agentProductCdRatioEnum.enums)}
              </Option>
            ))}
          </AssetSelect>
        </FormItem>
        {currentModalTab !== AgentModalTypeEnum.threeLevel && (
          <FormItem
            label={t`features_agent_agency_center_revenue_details_index_5101515`}
            field="rebateType"
            className="mb-filter-block"
          >
            <AssetSelect defaultActiveFirstOption placeholder={t`assets.financial-record.search.all`}>
              <Option key="all" value="">
                {t`common.all`}
              </Option>
              {rebateTypeList.map(item => (
                <Option value={item.id} key={item.id}>
                  {item.value}
                </Option>
              ))}
            </AssetSelect>
          </FormItem>
        )}
        <div className="flex items-center mr-6">
          <span className="mr-4 font-medium w-28">{t`features_agent_agency_center_revenue_details_index_5101517`}</span>
          <div className="amount-search">
            <FormItem field="minAmount" style={{ width: 96 }}>
              <InputNumber
                placeholder={t`features_agent_agent_center_rebate_details_search_form_index_feeeng7wo2`}
                hideControl
              />
            </FormItem>

            <span className="separator">{t`features/assets/saving/history-list/index-0`}</span>
            <FormItem field="maxAmount" style={{ width: 96 }}>
              <InputNumber
                placeholder={t`features_agent_agent_center_rebate_details_search_form_index_fof_5tbvom`}
                hideControl
              />
            </FormItem>
          </div>
          {/* </FormItem> */}
        </div>
        <FormItem field="reset">
          <Button
            className={'mr-4'}
            type="primary"
            // onClick={onSearchList}
            htmlType="submit"
          >{t`assets.financial-record.search.search`}</Button>
          <Button onClick={() => onResetForm()}>{t`assets.financial-record.search.reset`}</Button>
        </FormItem>
      </Form>
    </div>
  )
}
