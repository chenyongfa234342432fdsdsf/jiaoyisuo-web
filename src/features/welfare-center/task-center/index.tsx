import { memo, useState, useMemo, useRef } from 'react'
import classNames from 'classnames'
import { t } from '@lingui/macro'
import { useUserStore } from '@/store/user'
import Icon from '@/components/icon'
import { TaskType } from '@/constants/welfare-center/task-center'
import { useCouponCenterCode } from '@/features/welfare-center/welfare-center'
import ChallengeTask from './challenge-task'
import AchievementTask from './achievement-task'
import TaskRecord from './record'
import styles from './index.module.css'

function TaskCenter({ changePage }) {
  const [activekey, setActivekey] = useState<string>(TaskType.Challenge)
  const { isLogin } = useUserStore()
  /** 获取卡片分类，卡劵名称，卡劵类型使用业务场景数据字典 hooks */
  const { cardNameListCode } = useCouponCenterCode()
  const challengeTaskRef = useRef<Record<'scrollToElement', () => void>>()
  const achievementTaskRef = useRef<Record<'scrollToElement', () => void>>()

  const taskTitleList = [
    {
      title: t`features_welfare_center_task_center_index_ncobaylfaz`,
      type: TaskType.Challenge,
    },
    {
      title: t`features_welfare_center_task_center_index_lubl5vqztw`,
      type: TaskType.Achievement,
    },
  ]

  const handleTaskChange = key => {
    setActivekey(key)
    if (key === TaskType.Challenge) {
      challengeTaskRef.current?.scrollToElement()
    }
    if (key === TaskType.Achievement) {
      achievementTaskRef.current?.scrollToElement()
    }
  }

  const renderTaskList = useMemo(() => {
    if (activekey === TaskType.Record) {
      return <TaskRecord cardNameListCode={cardNameListCode} changePage={changePage} />
    }
    return (
      <>
        <ChallengeTask ref={challengeTaskRef} cardNameListCode={cardNameListCode} />
        <AchievementTask ref={achievementTaskRef} cardNameListCode={cardNameListCode} />
      </>
    )
  }, [activekey, cardNameListCode])

  return (
    <div className={classNames(styles.scoped)}>
      <div className="task-content">
        <div className="task-content-title">
          <Icon name="icon_welfare_center_ongoing_tasks" />
          {t`features_welfare_center_task_center_index_k5zqcuoirv`}
        </div>
        {taskTitleList.map(item => (
          <div
            key={item.type}
            onClick={() => handleTaskChange(item.type)}
            className={classNames('task-content-subtitle', {
              'task-content-subtitle-active': activekey === item.type,
            })}
          >
            {item.title}
          </div>
        ))}
        {isLogin && (
          <div className="task-content-title" onClick={() => handleTaskChange(TaskType.Record)}>
            <Icon name="icon_task_record" />
            {t`features_welfare_center_task_center_index_e4vo6qh_gx`}
          </div>
        )}
      </div>
      <div className="task-list">{renderTaskList}</div>
    </div>
  )
}

export default memo(TaskCenter)
