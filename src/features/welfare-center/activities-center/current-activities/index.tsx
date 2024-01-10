import { useState, useMemo, useEffect } from 'react'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { isEmpty, map } from 'lodash'
import { Tabs, Spin, Button } from '@nbit/arco'
import { useUserStore } from '@/store/user'
import { link } from '@/helper/link'
import { usePageContext } from '@/hooks/use-page-context'
import { ActivitiesType } from '@/constants/welfare-center/activities-center'
import { getV1WelfareActivityListApiRequest } from '@/apis/activity-center'
import { YapiGetV1WelfareActivityAllListData } from '@/typings/yapi/WelfareActivityAllV1GetApi'
import ListEmpty from '@/components/list-empty'
import ActivitiesCard from '../components/activities-card'
import styles from './index.module.css'

const TabPane = Tabs.TabPane

function CurrentActivities() {
  const [tabKey, setTabKey] = useState<string>(ActivitiesType.Started)
  const [loading, setLoading] = useState<boolean>(false)
  const [activitiesList, setActivitiesList] = useState<YapiGetV1WelfareActivityAllListData[]>([])
  const { isLogin } = useUserStore()
  const pageContext = usePageContext()

  const tabList = [
    {
      title: t`features_welfare_center_activities_center_current_activities_index_ovvm8eypga`,
      key: ActivitiesType.Started,
    },
    {
      title: t`features_welfare_center_activities_center_current_activities_index_jvoc3szyyl`,
      key: ActivitiesType.Ended,
    },
  ]

  const handleActivitiesType = (key: string) => {
    setTabKey(key)
  }

  const goLogin = () => {
    const backUrl = `${pageContext.urlPathname}?type=activity`
    link(`/login?redirect=${encodeURIComponent(backUrl)}`)
  }

  const getList = async () => {
    setLoading(true)
    const { isOk, data } = await getV1WelfareActivityListApiRequest({
      status: tabKey,
      pageNum: '1',
      pageSize: '500',
    })
    setLoading(false)
    if (isOk) {
      setActivitiesList(data?.list || [])
    }
  }

  useEffect(() => {
    if (isLogin) {
      getList()
    }
  }, [isLogin, tabKey])

  const renderActivity = useMemo(() => {
    if (isLogin) {
      if (isEmpty(activitiesList)) {
        return (
          <div className="empty-wrap">
            <ListEmpty />
          </div>
        )
      }

      return map(activitiesList, (item, index) => (
        <div className="list-items" key={`${item.activityId}_${index}`}>
          <ActivitiesCard activityData={item} timeOutCallback={getList} />
        </div>
      ))
    }

    return (
      <div className="login-wrap">
        <div className="login-info">{t`features_welfare_center_activities_center_current_activities_index_9jrtuixx9t`}</div>
        <Button
          type="primary"
          className="login-btn"
          onClick={goLogin}
        >{t`features_welfare_center_activities_center_current_activities_index_hvkergbhbj`}</Button>
      </div>
    )
  }, [isLogin, activitiesList])

  return (
    <div className={classNames(styles.scoped)}>
      <div className="activity-tabs">
        <Tabs defaultActiveTab={tabKey} onChange={handleActivitiesType}>
          {tabList.map(item => (
            <TabPane key={item.key} title={item.title} />
          ))}
        </Tabs>
      </div>
      <Spin className="w-full" loading={loading}>
        <div className="activity-wrap">{renderActivity}</div>
      </Spin>
    </div>
  )
}

export default CurrentActivities
