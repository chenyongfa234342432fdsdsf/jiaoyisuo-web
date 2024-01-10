/**
 * 直推代理列表查询组建
 */
import { useState, lazy, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Select, Table, PaginationProps, InputNumber, Message } from '@nbit/arco'
import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import {
  getAgentSystemAreaAgentLevel,
  getAgentCenterHisInvitee,
  getAgentCenterSetRebateRatio,
} from '@/apis/agent/agent-center/userDetails'
import { AgentModeEnumeration, AgentTableSortingEnumeration, TableSortEnumeration } from '@/constants/agent/agent'
import {
  pyramidAgentInviteeListType,
  areaAgentInviteeListType,
  thirdLevelAgentInviteeListType,
} from '@/typings/api/agent/agent-center/user'
import { cloneDeep } from 'lodash'
import { usePageContext } from '@/hooks/use-page-context'
import { useRequest } from 'ahooks'
import ManageSetScale from '@/features/agent/manage/manage-set-scale'
import { AgentProductRatioDate } from '@/typings/api/agent/agent-invite/apply'
import { GetBrokerTableColumnList } from './table-schema'
import style from './index.module.css'

const HisPersonalModal = lazy(() => import('@/features/agent/center/invite/his-personal-modal'))
const Option = Select.Option

// 排序枚举
enum sortEnumeration {
  /** 倒序 */
  descend = 'descend',
  /** 正序 */
  ascend = 'ascend',
}

function HiSbrokerList(props, ref) {
  const pageContext = usePageContext() // 获取路由参数
  const [uidValue, setUidValue] = useState(undefined) // uid 查询数据
  const [list, setList] = useState<
    Array<pyramidAgentInviteeListType | areaAgentInviteeListType | thirdLevelAgentInviteeListType>
  >([]) // 表格数据
  const [regionList, setRegionList] = useState([{ id: 0, name: t`common.all` }]) // 区域等级数据
  const [paginatedData, setPaginatedData] = useState({ pageNum: 1, pageSize: 10 })
  const [registerDateSort, setRegisterDateSort] = useState<number | null>(null)
  const realsTaList = [
    { value: 0, name: t`common.all` },
    { value: 1, name: t`features_agent_agency_center_invitation_details_index_5101548` },
    { value: 2, name: t`features_agent_agency_center_invitation_details_index_5101549` },
  ] // 实名状态数据
  const [visible, setVisible] = useState(false) // 筛选弹框
  const [pagination, setPagination] = useState<PaginationProps>({
    total: 0,
    current: 1,
    showTotal: true,
    showJumper: true,
    sizeCanChange: true,
    hideOnSinglePage: false,
  }) // 分页数据
  const defaultStateData = {
    ...props.listObj,
    isRealName: 0,
    rebateLevel: 0,
  }
  const state = useRef(defaultStateData)
  const [isShowSetRatio, setIsShowSetRatio] = useState<boolean>(false)
  const [productList, setProductList] = useState<AgentProductRatioDate[]>([]) // 产品线集合数据
  const [currentUid, setCurrentUid] = useState<number>(0)
  const [cloneList, setCloneList] = useState<AgentProductRatioDate[]>([])
  /**
   * 获取列表数据
   */
  const AgentCenterHisInviteeQuery = async () => {
    const res = await getAgentCenterHisInvitee({
      ...state.current,
      isRealName: state.current.isRealName || null,
      rebateLevel: state.current.rebateLevel || null,
      registerDateSort,
      ...paginatedData,
    })
    if (res.isOk && res.data) {
      const data = res?.data || {}
      setList(data?.pyramidAgentInviteeList || data?.areaAgentInviteeList || data?.threeLevelAgentInviteeList || [])
      setPagination({ ...pagination, total: data.total })
    }
  }
  const { run: searchUid, loading } = useRequest(AgentCenterHisInviteeQuery, { debounceWait: 300, manual: true })
  /**
   * 获取区域等级
   */
  const getsRegionRating = async (visibleShow: boolean) => {
    if (visibleShow && regionList.length <= 1) {
      const res = await getAgentSystemAreaAgentLevel({})
      if (res.isOk && res.data) {
        const data = res.data
        setRegionList(val => {
          const newValue = [...val]
          data.length > 0 &&
            data?.forEach(req => {
              newValue.push({ id: req, name: `V ${req}` })
            })
          return newValue
        })
      }
    }
  }

  /**
   * 区域代理选择事件
   */
  const onRegionEvents = (e: number) => {
    state.current = { ...state.current, rebateLevel: e }
    searchUid()
  }

  /**
   * 实名认证选择事件
   */
  const onRealEvents = (e: number) => {
    state.current = { ...state.current, isRealName: e }
    searchUid()
  }

  /**
   * UID 搜索事件
   */
  const onInput = e => {
    setUidValue(e)
    state.current = { ...state.current, searchUid: e }
    searchUid()
  }

  /**
   * 表格排序事件
   */
  const onTableSortingMethod = (_page, row) => {
    let sortValue: number | null = null
    if (row.field) {
      state.current.sort = TableSortEnumeration[row.field]
      switch (row.direction) {
        case sortEnumeration.descend:
          sortValue = AgentTableSortingEnumeration.ReverseOrder
          break
        case sortEnumeration.ascend:
          sortValue = AgentTableSortingEnumeration.PositiveOrder
          break
        default:
          sortValue = null
      }
      setRegisterDateSort(sortValue)
    }
  }

  // 分页事件
  const handlePaginationOnChange = (pageNum, pageSize) => {
    setPagination({ ...pagination, current: pageNum, pageSize })
    setPaginatedData({ ...paginatedData, pageNum, pageSize })
  }

  /**
   * 比例确定事件
   */
  const { run: onAddOrUpdate, loading: loadingModal } = useRequest(
    async () => {
      const res = await getAgentCenterSetRebateRatio({
        uid: String(currentUid),
        rebateRatio: productList.map(row => ({
          selfRatio: Number(row.total || 0) - Number(row?.Comparison || 0),
          childRatio: Number(row.Comparison),
          productCd: row.productCd,
        })),
      })
      if (res.isOk && res.data) {
        Message.success(t`user.field.reuse_40`)
        setIsShowSetRatio(false)
        searchUid()
      }
    },
    { manual: true }
  )

  /**
   * 比例方法
   */
  const proportionalMethod = productRebateList => {
    let data = [] as any
    if (productRebateList.length > 0) {
      props.ratio.forEach(res => {
        productRebateList.forEach(resKey => {
          if (res.codeVal === resKey.productCd) {
            data.push({
              codeKey: res.codeKey,
              selfRatio: resKey.selfRatio,
              Comparison: resKey.childRatio || 0,
              productCd: resKey.productCd,
              total: Number(resKey?.selfRatio) + Number(resKey?.childRatio),
            })
          }
        })
      })
    }
    return data
  }

  /**
   * 金字塔表格比例修改事件
   */
  const onIconEven = e => {
    setCurrentUid(e.uid)
    setCloneList(e.productRebateList)
    setProductList(val => {
      const data = [...proportionalMethod(e?.productRebateList || [])]
      return data
    })
    setIsShowSetRatio(true)
  }

  /**
   * 滑块事件
   */
  const onSliderChange = (productCd, val) => {
    const copyList = cloneDeep(productList)
    copyList.forEach(res => {
      if (productCd === res.productCd) {
        res.Comparison = val
      }
    })
    setProductList(copyList)
  }

  useImperativeHandle(ref, () => ({
    getCenterHisInviteeQuery: uidCode => {
      state.current = {
        ...state.current,
        isRealName: 0,
        rebateLevel: 0,
        searchUid: null,
        uid: +uidCode || +state.current.uid,
      }
      AgentCenterHisInviteeQuery()
      setUidValue(undefined)
    },
  }))

  useEffect(() => {
    searchUid()
  }, [paginatedData, registerDateSort])

  return (
    <div className={style.scoped}>
      <div className="hisbroker-from-box">
        <div className="hisbroker-from">
          <InputNumber
            onChange={onInput}
            hideControl
            value={uidValue}
            className="search-input"
            prefix={
              <div className={style.icon}>
                <Icon name="search" className="input-search-icon" hasTheme />
              </div>
            }
            placeholder={t`features_agent_agency_center_invitation_details_index_5101534`}
          />
          {pageContext.urlParsed.search?.model === AgentModeEnumeration.area && (
            <>
              <span className="hisbroker-from-span">{t`features_agent_invitation_v3_invitation_formfilter_v3_index_xocibthwhg`}</span>
              <Select
                onChange={e => onRegionEvents(e)}
                onVisibleChange={visibleShow => getsRegionRating(visibleShow)}
                value={state.current.rebateLevel}
                className="hisbroker-select"
                arrowIcon={<Icon name="arrow_open" hasTheme className="assets-select-icon" width={8} height={8} />}
              >
                {regionList.map((row, index) => (
                  <Option key={index} value={row.id}>
                    {row.name}
                  </Option>
                ))}
              </Select>
            </>
          )}
          <span className="hisbroker-from-span">{t`features_agent_agency_center_invitation_details_index_5101536`}</span>
          <Select
            onChange={e => onRealEvents(e)}
            value={state.current.isRealName}
            className="hisbroker-select"
            arrowIcon={<Icon name="arrow_open" hasTheme className="assets-select-icon" width={8} height={8} />}
          >
            {realsTaList.map((row, index) => {
              return (
                <Option key={index} value={row.value}>
                  {row.name}
                </Option>
              )
            })}
          </Select>
        </div>
        <div>
          <Icon className="hisbroker-filter-btn" onClick={() => setVisible(true)} hasTheme name="asset_record_filter" />
        </div>
      </div>

      <div className={style['tabel-scoped']}>
        <div className="table-container">
          <Table
            onChange={(_page, row) => {
              onTableSortingMethod(_page, row)
            }}
            rowKey={record => `${record?.uid || ''}`}
            className="table"
            columns={GetBrokerTableColumnList(props.ratio, props.onInviteEvents, props.foundation, onIconEven)}
            data={list}
            loading={loading}
            border={false}
            pagination={{ ...pagination, onChange: handlePaginationOnChange }}
            scroll={{
              y: 226,
            }}
            renderPagination={paginationNode => (
              <div className="table-pagination">
                <div>{paginationNode}</div>
                <div className="table-pagination-extra">{t`features_agent_manage_index_5101442`}</div>
              </div>
            )}
          />
        </div>
      </div>

      <HisPersonalModal
        visible={visible}
        onSecondary={val => {
          setVisible(false)
          state.current = { ...state.current, ...val }
          AgentCenterHisInviteeQuery()
        }}
        onHideVisible={() => setVisible(false)}
      />
      <ManageSetScale
        loading={loadingModal}
        productRebateList={cloneList}
        onIsShowSetRatio={setIsShowSetRatio}
        productList={productList}
        touchId={'1'}
        isShowSetRatio={isShowSetRatio}
        AddOrUpdate={() => {
          onAddOrUpdate()
        }}
        onSliderChange={(productCd, val) => {
          onSliderChange(productCd, val)
        }}
      />
    </div>
  )
}

export default forwardRef(HiSbrokerList)
