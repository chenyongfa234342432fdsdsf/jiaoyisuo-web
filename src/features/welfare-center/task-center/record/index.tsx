import { memo, useState, useEffect } from 'react'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { map, isEmpty } from 'lodash'
import { Spin, Tabs } from '@nbit/arco'
import { RecordType } from '@/constants/welfare-center/task-center'
import { getV1WelfareMissionRecordsApiRequest } from '@/apis/task-center'
import { YapiGetV1WelfareMissionRecordsListData } from '@/typings/yapi/WelfareMissionRecordsV1GetApi'
import ListEmpty from '@/components/list-empty'
import TaskItem from '../components/task-item'
import styles from './index.module.css'

const TabPane = Tabs.TabPane

function TaskRecord({ cardNameListCode, changePage }) {
  const [recordType, setRecordType] = useState<string>(RecordType.Finished)
  const [loading, setLoading] = useState<boolean>(false)
  const [recordList, setRecordList] = useState<YapiGetV1WelfareMissionRecordsListData[]>([])

  const tabList = [
    {
      title: t`constants/assets/index-21`,
      key: RecordType.Finished,
    },
    {
      title: t`constants_c2c_history_records_index_giygvnc2otzqgl_i07dlo`,
      key: RecordType.Unfinished,
    },
  ]

  const handleRecordType = (key: string) => {
    setRecordList([])
    setRecordType(key)
  }

  const getRecordList = async () => {
    setLoading(true)
    const { isOk, data } = await getV1WelfareMissionRecordsApiRequest({
      status: recordType,
      pageNum: '1',
      pageSize: '1000',
    })
    setLoading(false)
    if (isOk) {
      setRecordList(data?.list || [])
    }
  }

  useEffect(() => {
    getRecordList()
  }, [recordType])

  return (
    <div className={classNames(styles.scoped)}>
      <div className="task-title">{t`features_welfare_center_task_center_index_e4vo6qh_gx`}</div>
      <div className="record-tabs">
        <Tabs defaultActiveTab={recordType} onChange={handleRecordType}>
          {tabList.map(item => (
            <TabPane key={item.key} title={item.title}>
              <Spin className="w-full" loading={loading}>
                {isEmpty(recordList) ? (
                  <ListEmpty />
                ) : (
                  map(recordList, (el, index) => (
                    <TaskItem
                      key={`${el.missionId}_${index}`}
                      recordData={el}
                      recordType={recordType}
                      cardNameListCode={cardNameListCode}
                      changePage={changePage}
                    />
                  ))
                )}
              </Spin>
            </TabPane>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

export default memo(TaskRecord)
