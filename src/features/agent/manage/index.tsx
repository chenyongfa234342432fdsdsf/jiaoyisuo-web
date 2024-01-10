import { useState, useRef, useEffect } from 'react'
import { useLayoutStore } from '@/store/layout'
import { useCommonStore } from '@/store/common'
import { Button, Table, Tooltip, Message, TableColumnProps, PaginationProps, Empty } from '@nbit/arco'
import { t } from '@lingui/macro'
import { oss_svg_image_domain_address } from '@/constants/oss'
import Icon from '@/components/icon'
import LazyImage, { Type } from '@/components/lazy-image'
import { useCopyToClipboard } from 'react-use'
import { QRCodeCanvas } from 'qrcode.react'
import { cloneDeep, isNumber } from 'lodash'

import {
  fetchInvitationCodeQuery,
  fetchInvitationCodes,
  fetchProductRatio,
  fetchInvitationCodeAdd,
  fetchEditDefaultInvCode,
  fetchBlacklistQuery,
  fetchInvitationRatio,
  fetchDefaultInvCode,
  fetchApplydelete,
  fetchProductList,
} from '@/apis/agent/agent-invite/apply'
import {
  IApplyInvitationCodeList,
  AgeninvitationCodesDate,
  AgentProductRatioDate,
} from '@/typings/api/agent/agent-invite/apply'
import { link } from '@/helper/link'
import { formatDate } from '@/helper/date'
import { useAgentUserInBlacklist } from '@/hooks/features/agent'
import { getCodeDetailList } from '@/apis/common'
import CustomModal from '../modal'
import styles from './index.module.css'

import { getHost } from '../utils/host'
import ManageModelName from './manage-model-name'
import ManageSetScale from './manage-set-scale'
import ManageFriendsList from './manage-friends-list'
import ManageModelDelete from './manage-model-delete'

function UserPersonalCenterAgentManage() {
  useAgentUserInBlacklist()
  const exportRef = useRef<HTMLDivElement | null>(null)
  const { headerData } = useLayoutStore()
  const { locale } = useCommonStore()
  const { imgWebLogo } = headerData || { imgWebLogo: '' }
  const [pagination, setPagination] = useState<PaginationProps>({
    total: 0,
    current: 1,
    showTotal: true,
    showJumper: true,
    sizeCanChange: true,
    hideOnSinglePage: false,
  }) // 分页配置
  const [total, setTotal] = useState<number>(0) // 剩余可创建邀请码数
  const [formModal, setFormModal] = useState({
    name: '', // 邀请码名称
    ratios: [], // 产品线信息
    isDefault: false, // 是否默认
    childRatio: 0, // 好友比例
  })
  const [list, setList] = useState<IApplyInvitationCodeList[]>([]) // 管理邀请码列表
  const [curr, setCurr] = useState<IApplyInvitationCodeList>() // 临时存储当前选中的对象，用于弹窗这部分的关联数据 (避免 for 循环重复查找数组里面的对象)
  const [touchId, setTouchId] = useState<string>('') // '' 表示添加新邀请码，'233' 表示设置金字塔佣金比例
  const [isShow, setShow] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isShowSetRatio, setIsShowSetRatio] = useState<boolean>(false) // 设置金字塔佣金比例 Modal 弹窗
  const [isDeleteShowModal, setDeleteShowModal] = useState<boolean>(false)
  const [isShowFriendModal, setShowFriendModal] = useState<boolean>(false)
  const [isShowPoster, setIsShowPoster] = useState<boolean>(false)
  const [isShowQrcode, setIsShowQrcode] = useState<boolean>(false)
  const [analysisList, setAnalysisList] = useState<AgeninvitationCodesDate[]>([]) // 邀请好友数据
  const [productList, setProductList] = useState<AgentProductRatioDate[]>([]) // 产品线数据
  const [agentProducObj, setAgentProducObj] = useState({}) // 产品线数据字典
  const [state, copyToClipboard] = useCopyToClipboard()
  const codesTotal = 100 // 邀请码总数
  const [listCopy, setListCopy] = useState<AgentProductRatioDate[]>([])
  /**
   * 是否黑名单
   */
  const getBlockNot = async () => {
    const row = await fetchBlacklistQuery({})
    if (row.isOk && row.data) {
      return row.data?.inBlacklist
    }
  }

  /**
   * 查询邀请码列表对应的好友
   */
  const getCheckInvitation = async row => {
    const res = await fetchInvitationCodes({ invitationCode: row?.invitationCode })
    if (res.isOk && res.data) {
      setAnalysisList(res.data?.list || [])
    }
  }

  const agentInviteQueryMax = async () => {
    const res = await fetchProductRatio({})
    const row = await getCodeDetailList({ codeVal: 'agent_product_cd_ratio' })
    const resList = await fetchProductList({})
    const socialmediaList = row.data || []
    // 将数据字典转换为对象
    const objectResult = socialmediaList.reduce((result, item) => {
      result[item?.codeVal] = item
      return result
    }, {})
    setAgentProducObj(objectResult)
    if (res.isOk && res.data) {
      // 用产品线做筛选
      let filterList =
        resList.data?.map(resKey => {
          let rowObj = objectResult[String(resKey)]
          rowObj.selfRatio = 0
          res.data?.products.forEach(proKey => {
            if (proKey.productCd === String(resKey)) {
              rowObj.selfRatio = proKey?.selfRatio || 0
              rowObj.total = Number(proKey?.selfRatio) + Number(proKey?.childRatio || 0)
            }
          })
          rowObj.Comparison = 0
          rowObj.productCd = resKey
          return rowObj
        }) || []
      setListCopy(cloneDeep(filterList))
      setProductList(filterList || [])
      // 展示删选后的产品线在表格
      let conversionList = filterList.map(rowKey => {
        return {
          title: rowKey?.codeKey || '',
          dataIndex: '',
          render: (col, record) =>
            record.products && record.products.length > 0 ? (
              record.products.map((res, index) => (
                <div className="table-ceil" key={index}>
                  {res.productCd === rowKey?.codeVal && (
                    <div className="flex">
                      <div className="table-ceil-text">
                        {t({
                          id: 'features_agent_manage_index_5101433',
                          values: { 0: `${res.selfRatio}%`, 1: `${res.childRatio}%` },
                        })}
                      </div>
                      <div className="table-ceil-icon">
                        <Icon
                          name="rebates_edit"
                          hasTheme
                          fontSize={16}
                          onClick={() => {
                            onEditRatio(record)
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="table-ceil">--</div>
            ),
        }
      })
      setColumns(prevArray => {
        const newArray = [...prevArray]
        if (conversionList.length > 0) {
          newArray.splice(1, 0, ...conversionList)
        }
        return newArray
      })
    }
  }

  /**
   * 邀请码列表查询
   * */
  const inviteManagePageList = async (page = '1', pageSize = '10') => {
    const res = await fetchInvitationCodeQuery({ page, pageSize })
    if (res.isOk && res.data) {
      setPagination({ ...pagination, total: res.data?.total ?? 0 })
      setTotal(res.data?.total ?? 0) // 兼容后端数据结构为 null 的情况
      setList(res.data?.list ?? [])
    }
  }

  const getManageInviteRemove = async id => {
    const res = await fetchApplydelete({
      invitationCodeId: id,
    })
    if (res.isOk) {
      setDeleteShowModal(false)
      inviteManagePageList()
      Message.success(t`features_agent_manage_index_g9zineeqvgipwgkpg4o3z`)
    }
  }

  useEffect(() => {
    agentInviteQueryMax()
    inviteManagePageList()
    return () => {}
  }, [])

  /**
   * 设置默认邀请码
   */
  const setDefault = async record => {
    const res = await fetchDefaultInvCode({
      invitationCodeId: record.id,
    })
    if (res.isOk && res.data) {
      Message.success(t`features/user/personal-center/settings/converted-currency/index-0`)
      inviteManagePageList()
    }
  }

  /**
   * 修改邀请码名称代码
   */
  const updateInvitationCodeName = async () => {
    const res = await fetchEditDefaultInvCode({ name: curr?.name, invitationCodeId: curr?.id as number })
    if (res.isOk && res.data) {
      setShow(false)
      Message.success(t`features/user/personal-center/settings/converted-currency/index-0`)
      inviteManagePageList()
    }
  }

  /**
   * 修改邀请码事件
   */
  const onEditInvitationEvent = async record => {
    const block = await getBlockNot()
    if (block) {
      Message.warning(t`features_agent_manage_index_nttjjopcdc`)
      return
    }
    setCurr(record)
    setShow(true)
  }

  /**
   * 新增修改方法
   */
  const AddOrUpdate = async () => {
    if (touchId) {
      const res = await fetchInvitationRatio({
        invitationCodeId: curr?.id,
        ratios: productList.map(row => ({
          productCd: row.productCd,
          selfRatio: Number(row?.total || 0) - Number(row?.Comparison || 0),
          childRatio: row.Comparison as number,
        })),
      })
      if (res.isOk && res.data) {
        setIsShowSetRatio(false)
        inviteManagePageList()
        Message.success(t`user.field.reuse_40`)
      }
      return
    }

    // 新增
    const res = await fetchInvitationCodeAdd({
      ratios: productList.map(row => ({
        productCd: row.productCd,
        selfRatio: Number(row?.selfRatio) - Number(row?.Comparison),
        childRatio: row.Comparison as number,
      })),
      name: formModal.name,
      isDefault: formModal.isDefault ? 1 : 2,
    })
    if (res.isOk && res.data) {
      Message.success(t`features_c2c_center_coll_pay_manage_index_bpbgaqekwf9eriwq3zik7`)
      setIsShowSetRatio(false)
      inviteManagePageList()
    }
  }

  const updateForm = record => {
    setTouchId(record.id)
    setFormModal({
      ...formModal,
    })
    setCurr(record)
    setIsShowSetRatio(true)
  }

  const handleCopy = (key: string) => {
    copyToClipboard(key)
    state.error ? Message.error(t`user.secret_key_02`) : Message.success(t`user.secret_key_01`)
  }

  function InvitationCodeNameChange(name) {
    setCurr({ ...curr!, name })
  }

  function onSliderChange(key, _percent) {
    const copyList = cloneDeep(productList)
    copyList.forEach(res => {
      if (key === res.productCd) {
        res.Comparison = _percent
      }
    })
    setProductList(copyList)
  }

  const onChangeTable = async pagi => {
    const { current, pageSize } = pagi
    setLoading(true)
    await inviteManagePageList(current, pageSize)
    setPagination({ ...pagination, current })
    setLoading(false)
  }

  /**
   * 修改表格比例事件
   */
  const onEditRatio = async record => {
    const block = await getBlockNot()
    if (block) {
      Message.info(t`features_agent_referral_ratio_modal_index_cper1sch7t`)
      return
    }
    setProductList(val => {
      const info = [...val]
      info.forEach(rowValue => {
        rowValue.selfRatio = 0
        record.products.forEach(rowKey => {
          if (rowValue.productCd === rowKey.productCd) {
            rowValue.Comparison = rowKey?.childRatio || 0
            rowValue.selfRatio = rowKey?.selfRatio
            rowValue.total = Number(rowKey?.selfRatio) + Number(rowKey?.childRatio)
          }
        })
      })
      return info
    })
    updateForm(record)
  }

  // 添加邀请码事件
  const onAddInvitationCode = async () => {
    const infoCopy = cloneDeep(listCopy)
    const block = await getBlockNot()
    if (block) {
      Message.warning(t`features_agent_manage_index_uw6tmqpzfp`)
      return
    }
    setIsShowSetRatio(true)
    setProductList(infoCopy)
    setTouchId('')
    setFormModal({
      name: '',
      ratios: [],
      isDefault: false,
      childRatio: 0,
    })
  }
  const [columns, setColumns] = useState<TableColumnProps[]>([
    {
      title: t`features_agent_manage_index_wsavb4wy6a`,
      dataIndex: 'name',
      fixed: 'left',
      width: 182,
      render: (col, record) => (
        <div className="table-ceil">
          <Tooltip content={record.name}>
            <div className="table-ceil-name">{record.name}</div>
          </Tooltip>
          <div className="table-ceil-icon">
            <Icon
              name="rebates_edit"
              hasTheme
              fontSize={16}
              onClick={() => {
                onEditInvitationEvent(record)
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: t`features_agent_index_5101364`,
      width: 142,
      dataIndex: 'sharecode',
      render: (col, record) => (
        <div className="table-ceil">
          <div className="table-ceil-text">{record.invitationCode || '--'}</div>
          <div className="table-ceil-icon">
            <Icon
              name="icon_agent_invite_copy"
              hasTheme
              fontSize={16}
              onClick={() => handleCopy(record.invitationCode)}
            />
          </div>
        </div>
      ),
    },
    {
      title: t`features_agent_manage_index_5101436`,
      width: 120,
      dataIndex: 'invitedNum',
      render: (col, record) => (
        <div className="table-ceil">
          <div className="table-ceil-text">{record?.invitedNum || 0}</div>
          <div className="table-ceil-icon">
            <Icon
              name="rebates_details"
              hasTheme
              fontSize={16}
              onClick={() => {
                setTouchId(record.id)
                setCurr(record)
                setShowFriendModal(true)
                getCheckInvitation(record)
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: t`assets.coin.trade-records.table.date`,
      dataIndex: 'createtime',
      render: (col, record) => <div className="table-ceil-text">{formatDate(record.createdByTime) || '--'}</div>,
    },
    {
      title: t`order.columns.action`,
      fixed: 'right',
      width: 260,
      render: (col, record) => (
        <div className="table-ceil">
          <div className="table-ceil-box">
            {record.isDefault === 1 ? (
              <div className="table-ceil-isdefault">{t`features_agent_manage_index_5101437`}</div>
            ) : (
              <div className="table-ceil-text" onClick={() => setDefault(record)}>
                {t`features_agent_manage_index_5101438`}
              </div>
            )}
          </div>
          <div className="table-ceil-box">
            <div
              className="table-ceil-text"
              onClick={() => handleCopy(`${getHost()}/${locale}/register?invitationCode=${record.invitationCode}`)}
            >
              {t`features_agent_manage_index_5101439`}
            </div>
          </div>
          <div className="table-ceil-delete-icon">
            {record.isDefault !== 1 && (
              <Icon
                name="rebates_delete"
                hasTheme
                fontSize={18}
                onClick={() => {
                  setTouchId(record.id)
                  setCurr(record)
                  setDeleteShowModal(true)
                }}
              />
            )}
          </div>
        </div>
      ),
    },
  ])

  return (
    <section className={`personal-center-agent ${styles.scoped}`}>
      <div className="header">
        <div className="header-box">
          <div className="l">{t`features_agent_index_5101365`}</div>
          <div className="r">
            <Button className="button" type="primary" onClick={() => onAddInvitationCode()}>
              {t`features_agent_manage_index_5101440`}
            </Button>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="section-text">
          {t`features_agent_manage_index_5101441`}: <span>{Number(codesTotal - total)}</span>
        </div>
        <div className="table-container">
          {list && list.length > 0 ? (
            <Table
              className="table"
              rowKey={record => `${record.id}`}
              loading={loading}
              columns={columns}
              data={list}
              border={false}
              scroll={{
                x: 1600,
                y: 226,
              }}
              onChange={onChangeTable}
              pagination={pagination}
              renderPagination={paginationNode => (
                <div className="table-pagination">
                  <div>{paginationNode}</div>
                  <div className="table-pagination-extra">{t`features_agent_manage_index_5101442`}</div>
                </div>
              )}
            />
          ) : (
            <Empty
              className={'empty'}
              icon={
                <LazyImage
                  className="nb-icon-png"
                  whetherManyBusiness
                  hasTheme
                  imageType={Type.png}
                  src={`${oss_svg_image_domain_address}icon_default_no_order`}
                  width={80}
                  height={80}
                />
              }
              description={t`trade.c2c.noData`}
            />
          )}
        </div>
      </div>
      {/* 修改邀请码名称 */}
      <ManageModelName
        isShow={isShow}
        value={curr?.name}
        onCloseHide={() => {
          setShow(false)
        }}
        InvitationCodeNameChange={InvitationCodeNameChange}
        updateInvitationCodeName={updateInvitationCodeName}
      />
      {/* 好友列表 */}
      <ManageFriendsList
        analysisList={analysisList}
        isShowFriendModal={isShowFriendModal}
        onShowFriendModal={() => {
          setShowFriendModal(false)
        }}
      />
      {/* 邀请码删除 */}
      <ManageModelDelete
        currValue={curr}
        isDeleteShowModal={isDeleteShowModal}
        onManageInviteRemove={() => {
          getManageInviteRemove(curr?.id)
        }}
        onDeleteShowModal={() => {
          setDeleteShowModal(false)
        }}
      />
      {/* 设置金字塔比例 */}
      <ManageSetScale
        productList={productList}
        onSliderChange={(key, _percent) => {
          onSliderChange(key, _percent)
        }}
        AddOrUpdate={() => {
          AddOrUpdate()
        }}
        onCheboxFormModal={val => {
          setFormModal({ ...formModal, isDefault: val as boolean })
        }}
        onChangeFormModal={val => {
          setFormModal({ ...formModal, name: val as string })
        }}
        formModal={formModal}
        isShowSetRatio={isShowSetRatio}
        touchId={touchId}
        onIsShowSetRatio={() => {
          setIsShowSetRatio(false)
        }}
      />
      {/* 分享海报 */}
      <CustomModal style={{ width: 480 }} className={styles['agent-manage-modal']} visible={isShowPoster}>
        <div className="poster">
          <div className="poster-header">
            <div className="poster-close-icon">
              <Icon name="close" hasTheme fontSize={18} onClick={() => setIsShowPoster(false)} />
            </div>
          </div>

          <div className="poster-content">
            <div
              style={{
                background: `url("${oss_svg_image_domain_address}${'agent/poster_bj.png?x-oss-process=image/auto-orient,1/quality,q_50'}") center center no-repeat`,
                backgroundSize: 'cover',
              }}
              className="poster-image"
              ref={exportRef}
            >
              <div className="poster-header-title">
                <LazyImage
                  // 设置大小防止闪动
                  height={26}
                  width={26}
                  className="poster-header-logo"
                  src={imgWebLogo}
                  // LOGO 直接显示图片，这里不需要 lazy load
                  visibleByDefault
                  whetherPlaceholdImg={false}
                />
                {'MONKEY Global'}
              </div>

              <div className="poster-text">{t`features_agent_index_5101417`}</div>
              <div className="poster-share">{t`features_agent_index_5101418`}</div>
              <div className="poster-qrcode">
                <QRCodeCanvas style={{ width: '80px', height: '80px' }} value={'asdasdasd'} />
              </div>
            </div>
          </div>

          {/* 下载海报功能暂时禁用 */}
          {/* <div className="poster-footer">
            <Button className="button" type="primary" onClick={() => exportAsImage(exportRef.current, 'test')}>
              {'下载海报'}
            </Button>
          </div> */}
        </div>
      </CustomModal>
      {/* 二维码分享 */}
      <CustomModal style={{ width: 320 }} className={styles['agent-manage-modal']} visible={isShowQrcode}>
        <div
          className="qrcode-share"
          style={{
            background: `url("${oss_svg_image_domain_address}${'agent/qr_code_bj.png?x-oss-process=image/auto-orient,1/quality,q_50'}") center center no-repeat`,
            backgroundSize: 'cover',
          }}
        >
          <div className="qrcode-share-close-icon">
            <Icon name="rebates_close" fontSize={32} onClick={() => setIsShowQrcode(false)} />
          </div>

          <div className="qrcode-share-header">
            <div className="qrcode-share-header-title">
              <LazyImage
                // 设置大小防止闪动
                height={26}
                width={26}
                className="qrcode-share-header-logo"
                src={imgWebLogo}
                // LOGO 直接显示图片，这里不需要 lazy load
                visibleByDefault
                whetherPlaceholdImg={false}
              />
              {'MONKEY Global'}
            </div>

            <div className="qrcode-share-text">{t`features_agent_index_5101417`}</div>
          </div>

          <div className="qrcode-share-content">
            <div className="qrcode-share-qrcode">
              <QRCodeCanvas style={{ width: '248px', height: '248px' }} value={'sddsddsddsddsddsddsddsddsddsddsdd'} />
            </div>

            <div className="qrcode-share-invitation-code">
              {t`features_agent_index_5101364`}
              <span className="qrcode-share-invitation-code-highlight">{'SADKL235A'}</span>
            </div>
          </div>
        </div>
      </CustomModal>
    </section>
  )
}

export default UserPersonalCenterAgentManage
