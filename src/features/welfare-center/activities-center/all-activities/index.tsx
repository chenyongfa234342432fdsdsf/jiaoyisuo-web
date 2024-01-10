import { useState, useMemo, useEffect } from 'react'
import { t } from '@lingui/macro'
import classNames from 'classnames'
import { map, isEmpty } from 'lodash'
import { Pagination, Spin } from '@nbit/arco'
import ListEmpty from '@/components/list-empty'
import { getV1WelfareActivityAllApiRequest } from '@/apis/activity-center'
import { YapiGetV1WelfareActivityAllListData } from '@/typings/yapi/WelfareActivityAllV1GetApi'
import ActivitiesCard from '../components/activities-card'
import styles from './index.module.css'

type Page = {
  pageNumber: number
  pageSize: number
  totalCount: any
}

function AllActivities() {
  const [page, setPage] = useState<Page>({
    pageNumber: 1,
    pageSize: 8,
    totalCount: 0,
  })
  const [allActivitiesList, setAllActivitiesList] = useState<YapiGetV1WelfareActivityAllListData[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const getList = async () => {
    setLoading(true)
    const { isOk, data } = await getV1WelfareActivityAllApiRequest({
      pageNum: `${page.pageNumber}`,
      pageSize: `${page.pageSize}`,
    })
    setLoading(false)
    if (isOk) {
      setAllActivitiesList(data?.list || [])
      setPage({ ...page, totalCount: data?.total || 0 })
    }
  }

  useEffect(() => {
    getList()
  }, [page.pageNumber])

  const renderList = useMemo(() => {
    if (isEmpty(allActivitiesList)) {
      return (
        <div className="list-empty-wrap">
          <ListEmpty />
        </div>
      )
    }

    return (
      <div className="all-activities-list">
        {map(allActivitiesList, (item, index) => (
          <ActivitiesCard key={`${item.activityId}_${index}`} activityData={item} layoutType="vertical" />
        ))}
      </div>
    )
  }, [allActivitiesList])

  return (
    <div className={classNames(styles.scoped)}>
      <div className="all-activities-title">{t`features_welfare_center_activities_center_all_activities_index_h8jzpc4yrr`}</div>
      <Spin className="w-full" loading={loading}>
        {renderList}
      </Spin>
      <Pagination
        className="list-pagination"
        size={'default'}
        current={page.pageNumber}
        total={page.totalCount}
        showTotal
        showJumper
        onChange={(pageNumber: number) => {
          setPage({ ...page, pageNumber })
        }}
        hideOnSinglePage
      />
    </div>
  )
}

export default AllActivities
