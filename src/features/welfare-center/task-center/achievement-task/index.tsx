import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { Spin } from '@nbit/arco'
import { map, isEmpty } from 'lodash'
import { getV1WelfareMissionListApiRequest } from '@/apis/task-center'
import { YapiGetV1WelfareMissionListData } from '@/typings/yapi/WelfareMissionListV1GetApi'
import { TaskType } from '@/constants/welfare-center/task-center'
import ListEmpty from '@/components/list-empty'
import TaskItem from '../components/task-item'
import styles from './index.module.css'

function AchievementTask({ cardNameListCode }, ref) {
  const achievementTaskRef = useRef<HTMLDivElement | null>(null)
  const [achievementList, setAchievementList] = useState<YapiGetV1WelfareMissionListData[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useImperativeHandle(ref, () => ({
    scrollToElement() {
      achievementTaskRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
  }))

  const getTaskList = async () => {
    setLoading(true)
    const { isOk, data } = await getV1WelfareMissionListApiRequest({
      missionType: TaskType.Achievement,
      pageNum: '1',
      pageSize: '500',
    })
    setLoading(false)
    if (isOk) {
      setAchievementList(data?.list || [])
    }
  }

  useEffect(() => {
    getTaskList()
  }, [])

  return (
    <div className={classNames(styles.scoped)} ref={achievementTaskRef}>
      <div className="task-title">{t`features_welfare_center_task_center_index_lubl5vqztw`}</div>
      <Spin className="w-full" loading={loading}>
        {isEmpty(achievementList) ? (
          <ListEmpty />
        ) : (
          map(achievementList, item => (
            <TaskItem
              key={item.missionId}
              taskData={item}
              cardNameListCode={cardNameListCode}
              timeOutCallback={getTaskList}
            />
          ))
        )}
      </Spin>
    </div>
  )
}

export default forwardRef(AchievementTask)
