/**
 * 币种/法币选择列表组件
 */
import { Modal, Input } from '@nbit/arco'
import { t } from '@lingui/macro'
import { useState } from 'react'
import Icon from '@/components/icon'
import LazyImage from '@/components/lazy-image'
import { useDebounce } from 'ahooks'
import { useAgentCenterStore } from '@/store/agent/agent-center/center'
import styles from './index.module.css'

type ICoinListProps = {
  visible: boolean
  setVisible: (val: boolean) => void
}

export function CoinList({ visible, setVisible }: ICoinListProps) {
  const { agentCurrencyList, updateCurrentCurrency } = useAgentCenterStore() || {}
  const [searchKey, setSearchKey] = useState('')
  const debounceKey = useDebounce(searchKey)
  const filterList = [...agentCurrencyList].filter(currencyItem => {
    const ignoreCaseKey = debounceKey.toUpperCase()
    return currencyItem?.currencyEnName && currencyItem?.currencyEnName.toUpperCase().includes(ignoreCaseKey)
  })

  /** 本地搜索 */
  const onSearch = val => {
    setSearchKey(val)
  }

  return (
    <Modal
      className={styles.scoped}
      title={
        <div
          style={{ textAlign: 'left' }}
        >{t`features_agent_agent_center_data_overview_coin_list_index_5dqqm5ahdq`}</div>
      }
      style={{ width: 480 }}
      visible={visible}
      footer={null}
      onCancel={() => {
        setVisible(false)
      }}
    >
      <div className="px-8">
        <Input
          className="search-form"
          style={{ width: 416, height: 46 }}
          prefix={<Icon name="search" hasTheme />}
          placeholder={t`features_agent_agent_center_data_overview_coin_list_index_hoqu3hciky`}
          onChange={value => onSearch(value)}
        />
      </div>
      <div className="coin-list-wrap">
        <div className="coin-list">
          {filterList &&
            filterList?.map((item, index) => (
              <div
                key={index}
                className="coin-item"
                onClick={() => {
                  updateCurrentCurrency({ ...item })
                  setVisible && setVisible(false)
                }}
              >
                <LazyImage className="mr-4" src={item?.logo || ''} width={24} height={24} />
                {item.currencyEnName}
              </div>
            ))}
        </div>
      </div>
    </Modal>
  )
}
