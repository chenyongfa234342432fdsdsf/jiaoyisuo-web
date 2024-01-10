import NoDataImage from '@/components/no-data-image'
import Table from '@/components/table'
import { YapiGetV1MemberVipBaseFeeData } from '@/typings/yapi/MemberVipBaseFeeListV1GetApi'
import { useVipUserInfo } from '@/hooks/features/vip/vip-perks'
import { getTierTableColumns } from './tier-table-schema'
import styles from './index.module.css'

function VipTierTable({ data, loading }: { data?: YapiGetV1MemberVipBaseFeeData[]; loading: boolean }) {
  const { userConfig } = useVipUserInfo()
  return (
    <Table
      border={{
        wrapper: true,
        cell: true,
      }}
      className={styles.scoped}
      columns={getTierTableColumns()}
      data={data}
      noDataElement={<NoDataImage size="h-24 w-28" />}
      pagination={false}
      loading={loading}
      rowClassName={(record, index) => {
        if (record.levelCondition.levelCode === userConfig?.levelCode) return 'active-tr'
        return ''
      }}
    />
  )
}

export default VipTierTable
