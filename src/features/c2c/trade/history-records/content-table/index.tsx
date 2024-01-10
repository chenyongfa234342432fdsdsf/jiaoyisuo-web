import classNames from 'classnames'
import { useC2CHrStore } from '@/store/c2c/history-records'
import { C2cHrTable } from '@/features/c2c/trade/history-records/common/table'
import styles from './index.module.css'
import { getC2cHistoryRecordsColumns } from './column'

export function C2cHistoryRecordsTable() {
  const store = useC2CHrStore()
  const columns = getC2cHistoryRecordsColumns()
  const { apiData: list, setPage, page, apiStatus } = store.hooks.useC2cHistoryRecords()

  return (
    <div className={classNames(styles.scope)}>
      <C2cHrTable
        columns={columns}
        data={list || []}
        getRowKey={record => `${record.id}`}
        page={page}
        setPage={setPage}
        apiStatus={apiStatus}
        scroll={{
          x: 1200,
        }}
      />
    </div>
  )
}
