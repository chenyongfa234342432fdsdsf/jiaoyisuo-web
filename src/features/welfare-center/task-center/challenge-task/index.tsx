import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import classNames from 'classnames'
import { map, isEmpty } from 'lodash'
import { t } from '@lingui/macro'
import { link } from '@/helper/link'
import { useHelpCenterUrl } from '@/hooks/use-help-center-url'
import { getV1WelfareMissionListApiRequest } from '@/apis/task-center'
import { YapiGetV1WelfareMissionListData } from '@/typings/yapi/WelfareMissionListV1GetApi'
import { TaskType } from '@/constants/welfare-center/task-center'
import { ruleHomeColumnCd } from '@/constants/welfare-center'
import { Spin } from '@nbit/arco'
import ListEmpty from '@/components/list-empty'
import TaskItem from '../components/task-item'
import styles from './index.module.css'

function ChallengeTask({ cardNameListCode }, ref) {
  const challengeTaskRef = useRef<HTMLDivElement | null>(null)
  const [challengeList, setChallengeList] = useState<YapiGetV1WelfareMissionListData[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const ruleUrl = useHelpCenterUrl(ruleHomeColumnCd.MyTasks) || ''

  useImperativeHandle(ref, () => ({
    scrollToElement() {
      challengeTaskRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
  }))

  const getTaskList = async () => {
    setLoading(true)
    const { isOk, data } = await getV1WelfareMissionListApiRequest({
      missionType: TaskType.Challenge,
      pageNum: '1',
      pageSize: '500',
    })
    setLoading(false)
    if (isOk) {
      setChallengeList(data?.list || [])
    }
  }

  const gotoRule = () => {
    link(ruleUrl)
  }

  useEffect(() => {
    getTaskList()
  }, [])

  return (
    <div className={classNames(styles.scoped)} ref={challengeTaskRef}>
      <div className="task-title">
        {t`features_welfare_center_task_center_index_ncobaylfaz`}
        <div
          className="task-rule"
          onClick={gotoRule}
        >{t`features_welfare_center_task_center_challenge_task_index_qkdrbw90ai`}</div>
      </div>
      <Spin className="w-full" loading={loading}>
        {isEmpty(challengeList) ? (
          <ListEmpty />
        ) : (
          map(challengeList, item => (
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

export default forwardRef(ChallengeTask)
