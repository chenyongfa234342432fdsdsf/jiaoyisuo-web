import Icon from '@/components/icon'
import { useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Modal } from '@nbit/arco'
import { t } from '@lingui/macro'
import { debounce } from 'lodash'
import cn from 'classnames'
import { replaceEmpty } from '@/helper/filters'
import { setFutureGroupCreate } from '@/apis/future/common'
import { useFuturesStore } from '@/store/futures'
import { oss_svg_image_domain_address } from '@/constants/oss'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { IncreaseTag } from '@nbit/react'
import { useNavigateOwnParams } from '@/hooks/use-navigate-own-params'
import { formatCurrency, formatNumberDecimal } from '@/helper/decimal'
import { UserUpsAndDownsColorEnum } from '@/constants/user'
import { useCommonStore } from '@/store/common'
import { useUserStore } from '@/store/user'
import { YapiGetV1PerpetualGroupListData } from '@/typings/yapi/PerpetualGroupListV1GetApi.d'
import { YapiPostV1PerpetualGroupCreateData } from '@/typings/yapi/PerpetualGroupCreateV1PostApi.d'
import { useAcountBgAndColor, AcountBgAndColor } from '../use-acount-bg-and-color'
import style from './index.module.css'

type NewCreateGroup = YapiPostV1PerpetualGroupCreateData

type Props = {
  excludeContractGroupId?: number | string
  setSelectContractGroup?: (item: YapiGetV1PerpetualGroupListData) => void
  showCreateNewGroup?: boolean
  setCreateNewGroupDetail?: (item: NewCreateGroup | { type: string }) => void
  futureGroupModeClick?: boolean
  selectedfutureGroup?: YapiGetV1PerpetualGroupListData | { type: string }
}

function FutureGroupModal(props: Props, ref) {
  const {
    excludeContractGroupId,
    setSelectContractGroup,
    showCreateNewGroup = true,
    setCreateNewGroupDetail,
    futureGroupModeClick,
    selectedfutureGroup,
  } = props

  const { isMergeMode } = useCommonStore()

  const { navigateOwnLink } = useNavigateOwnParams()

  const { acountBgAndColor, accountShowTextList } = useAcountBgAndColor()

  // const useStore = useUserStore()

  // const { personalCenterSettings } = useStore

  const {
    futuresCurrencySettings: { offset = 2 },
  } = useAssetsFuturesStore()

  const futureState = useFuturesStore()

  const {
    updateContractGroup,
    selectedContractGroup,
    contractGroupList: contractFutureGroupList,
    getContractGroupList,
  } = futureState

  const [contractGroupVisible, setContractGroupVisible] = useState<boolean>(false)

  // const [selectIndex, setSelectIndex] = useState<number>()

  const [contractGroupList, setContractGroupList] = useState<YapiGetV1PerpetualGroupListData[]>([])

  const [selectPrepareIndex, setPrepareIndex] = useState<number | string>()

  // const setConstractSelectIndex = (e, index) => {
  //   e.stopPropagation()
  //   setSelectIndex(index === selectIndex ? undefined : index)
  // }

  const selectReturnContractIndex = index => {
    if (index || index === 0) {
      const contractGroups = contractGroupList[index]
      if (setSelectContractGroup) {
        setSelectContractGroup(contractGroups)
        excludeContractGroupId === (selectedContractGroup as YapiGetV1PerpetualGroupListData)?.groupId &&
          updateContractGroup({ groupName: '' })
      } else {
        updateContractGroup(contractGroups)
        navigateOwnLink(
          { selectgroup: contractGroups?.groupId },
          {
            keepScrollPosition: true,
            overwriteLastHistoryEntry: true,
          }
        )
      }

      setContractGroupVisible(false)
    }
  }

  const setContractChange = (index: number) => {
    if (futureGroupModeClick) {
      selectReturnContractIndex(index)
    } else {
      setPrepareIndex(index === selectPrepareIndex ? undefined : index)
    }
  }

  const getSelectContractIndex = (contractGroupsList, selectedGroup) => {
    const selectContractIndex = contractGroupsList.findIndex(
      item => item.groupId === (selectedGroup as YapiGetV1PerpetualGroupListData)?.groupId
    )
    return selectContractIndex
  }

  const getFuturePerpetualListRequest = async (groupList?: YapiGetV1PerpetualGroupListData[]) => {
    const selectGroupList = groupList || contractFutureGroupList
    const contractGroupsList =
      selectGroupList?.filter(item => {
        return item.groupId !== excludeContractGroupId
      }) || []

    setContractGroupList(contractGroupsList)

    if (!excludeContractGroupId) {
      const selectContractIndex = getSelectContractIndex(contractGroupsList, selectedContractGroup)
      setPrepareIndex(selectContractIndex < 0 ? undefined : selectContractIndex)
    } else {
      if ((selectedfutureGroup as Record<'type', string>)?.type === 'new') {
        setPrepareIndex('new')
      } else {
        const selectContractIndex = getSelectContractIndex(contractGroupsList, selectedfutureGroup)
        setPrepareIndex(selectContractIndex < 0 ? undefined : selectContractIndex)
      }
    }
  }

  // const showProfitOrLoss = amount => {
  //   if (!amount) {
  //     return
  //   } else if (amount === '0') {
  //     return false
  //   }
  //   return amount?.indexOf('-') > -1
  // }

  const combineContractGroup = async () => {
    if (excludeContractGroupId && contractGroupVisible) {
      if (contractGroupList?.length > 0 && selectedfutureGroup) {
        getFuturePerpetualListRequest(contractGroupList)
      } else {
        const data = await getContractGroupList()
        data && getFuturePerpetualListRequest(data)
      }
    }
  }

  useEffect(() => {
    combineContractGroup()
  }, [excludeContractGroupId, contractGroupVisible])

  useEffect(() => {
    if (contractGroupVisible && !excludeContractGroupId) {
      getFuturePerpetualListRequest()
    }
  }, [contractGroupVisible, contractFutureGroupList])

  useEffect(() => {
    if (!contractGroupVisible) {
      setPrepareIndex(undefined)
      // setSelectIndex(undefined)
    }
  }, [contractGroupVisible])

  // const getOssImageChange = (contractGroup, lost, prolit) => {
  //   return showProfitOrLoss(contractGroup?.unrealizedProfit)
  //     ? personalCenterSettings?.colors === UserUpsAndDownsColorEnum.greenUpRedDown
  //       ? lost
  //       : prolit
  //     : personalCenterSettings?.colors === UserUpsAndDownsColorEnum.greenUpRedDown
  //     ? prolit
  //     : lost
  // }

  const setProfitContractGroup = (contractGroup: any, index: number) => {
    return (
      <div
        className={cn(
          'profit-contract-group cursor-pointer',
          {
            expanded: index === selectPrepareIndex,
          }
          // {
          //   'profit-contract-group-green': !showProfitOrLoss(contractGroup?.unrealizedProfit),
          //   'profit-contract-group-red': showProfitOrLoss(contractGroup?.unrealizedProfit),
          //   'contract-select-group-content':
          //     index === selectPrepareIndex && !showProfitOrLoss(contractGroup?.unrealizedProfit),
          //   'contract-select-group-content-red':
          //     index === selectPrepareIndex && showProfitOrLoss(contractGroup?.unrealizedProfit),
          // }
        )}
        onClick={() => setContractChange(index)}
        key={contractGroup?.groupId}
      >
        <div className={cn('group-item')}>
          <div className="group-item-type">
            <span style={{ ...acountBgAndColor?.[contractGroup?.accountType] }}>
              {accountShowTextList?.find(item => item?.codeVal === contractGroup?.accountType)?.codeKey}
            </span>
          </div>
          <div className="group-item-icon">
            <Icon name={`agreement_${index === selectPrepareIndex ? 'select' : 'unselect'}`} />
          </div>
          <div className="mt-3">{contractGroup.groupName}</div>
          <div className="group-item-detail">
            <div>
              <div className="text-text_color_02 text-xs">
                {t`features_assets_futures_common_migrate_modal_index_5101344`}({contractGroup?.baseCoin})
              </div>
              <div className="text-sm text-text_color_01 font-medium">
                {formatCurrency(contractGroup.marginAvailable, offset)}
              </div>
            </div>
            <div>
              <div className="text-text_color_02 text-xs">
                {t`features/orders/order-columns/holding-6`}({contractGroup?.baseCoin})
              </div>
              <div className="text-sm">
                <IncreaseTag kSign digits={offset} value={contractGroup.unrealizedProfit} />
              </div>
            </div>
          </div>
          {/* <div className={cn('profit-total-content', { 'contract-select-show': index === selectIndex })}>
          <span
            className={cn('profit-total-income', {
              'profit-total-income-bg': showProfitOrLoss(contractGroup?.unrealizedProfit),
            })}
          >
            <span>{t`features/orders/order-columns/holding-6`}</span>
          </span>
          {index === selectPrepareIndex && (
            <span className="profit-select-img">
              <img
                src={`${oss_svg_image_domain_address}contract-selected-${getOssImageChange(
                  contractGroup,
                  'lost',
                  'prolit'
                )}.png`}
                alt=""
              />
            </span>
          )}
          <span className="contract-group-label">
            <IncreaseTag digits={Number(offset)} value={contractGroup?.unrealizedProfit} />
            <span>{replaceEmpty(contractGroup?.baseCoin)}</span>
          </span>
          <img
            src={`${oss_svg_image_domain_address}${getOssImageChange(
              contractGroup,
              'red',
              'green'
            )}-contract-group-open.png`}
            alt=""
          />
          <span
            className={cn('contract-group', {
              'contract-group-unrealized-profit': showProfitOrLoss(contractGroup?.unrealizedProfit),
            })}
          >
            {replaceEmpty(contractGroup?.groupName)}
          </span>
          <div className="contract-group-icon-line"></div>
          <span className="contract-group-icon" onClick={e => setConstractSelectIndex(e, index)}>
            {index !== selectIndex ? (
              <Icon name="select_isolated_margin_dropdown" />
            ) : (
              <Icon name="choose_isolated_margin_collapse" />
            )}
          </span>
        </div>
        {selectIndex === index && (
          <div className="contract-group-content">
            <div className="group-content-item">
              <span>{t`features_future_future_group_modal_index_tln_dwbipbcx2tf11ckkf`}</span>
              <span>
                {replaceEmpty(formatCurrency(contractGroup?.groupAsset, Number(offset)))}
                <span className="pl-0.5">{replaceEmpty(contractGroup?.baseCoin)}</span>
              </span>
            </div>
            <div className="group-content-item">
              <span>{t`features_future_future_group_modal_index_3gllo0ymxz8prcry1onvi`}</span>
              <span>
                {replaceEmpty(formatCurrency(contractGroup?.positionAsset, Number(offset)))}
                <span className="pl-0.5">{replaceEmpty(contractGroup?.baseCoin)}</span>
              </span>
            </div>
            <div className="group-content-item">
              <span>{t`features_assets_futures_common_migrate_modal_index_5101344`}</span>
              <span>
                {replaceEmpty(formatCurrency(contractGroup?.marginAvailable, Number(offset)))}
                <span className="pl-0.5">{replaceEmpty(contractGroup?.baseCoin)}</span>
              </span>
            </div>
            <div className="group-content-item">
              <span>{t`features_assets_futures_index_total_assets_index_g5e9brvddw9m8lxs1szf8`}</span>
              <span>
                {replaceEmpty(formatCurrency(contractGroup?.lockCoinAsset, Number(offset)))}
                <span className="pl-0.5">{replaceEmpty(contractGroup?.baseCoin)}</span>
              </span>
            </div>
          </div>
        )} */}
        </div>
      </div>
    )
  }

  const setModalCancal = () => {
    setContractGroupVisible(false)
  }

  const setCreateContractGroupChange = debounce(async () => {
    if (setCreateNewGroupDetail) {
      // const { isOk, data } = await setFutureGroupCreate({ isAutoAdd: false })
      // if (isOk && data) {
      //   setCreateNewGroupDetail(data)
      // }
      setCreateNewGroupDetail({ type: 'new' })
    } else {
      updateContractGroup({ groupName: '' })
    }
    setContractGroupVisible(false)
  }, 500)

  const setCreateContractGroup = item => {
    if (futureGroupModeClick) {
      selectReturnContractIndex(item)
    } else {
      setPrepareIndex(item === selectPrepareIndex ? undefined : item)
    }
  }

  const setModalOk = debounce(() => {
    if (selectPrepareIndex === 'new') {
      setCreateContractGroupChange()
    } else {
      selectReturnContractIndex(selectPrepareIndex)
    }
  }, 500)

  const setNewContractGroup = () => {
    return (
      <div className="sticky left-0 rounded-b-lg top-0 z-10 cursor-pointer">
        <div className="h-2 w-full absolute left-0 top-0 bg-card_bg_color_03"></div>
        <div className="new-contract-group-contaner">
          <div
            className={cn('new-contract-group', {
              'contract-select-group-content-new': selectPrepareIndex === 'new',
            })}
            onClick={() => setCreateContractGroup('new')}
          >
            {/* {selectPrepareIndex === 'new' && (
              <span className="profit-select-img">
                <img src={`${oss_svg_image_domain_address}contract-selected-creates.png`} alt="" />
              </span>
            )} */}
            <span className="contract-group-label">
              {isMergeMode ? t`constants/order-5` : t`helper_trade_vlkiz873mu`}
            </span>
            {/* <div className="contract-group-img">
              <img src={`${oss_svg_image_domain_address}new-contract-group-create.png`} alt="" />
            </div> */}
            <span className="contract-group-icon">
              <Icon name="next_arrow" hasTheme />
            </span>
          </div>
        </div>
      </div>
    )
  }

  useImperativeHandle(ref, () => ({
    openContractGroup() {
      setContractGroupVisible(true)
    },
    closeContractGroup() {
      setContractGroupVisible(false)
    },
  }))

  return (
    <div>
      <Modal
        className={style['future-group-modal']}
        onCancel={setModalCancal}
        onOk={setModalOk}
        afterOpen={() => getContractGroupList()}
        visible={contractGroupVisible}
        okButtonProps={{
          disabled: !selectPrepareIndex && selectPrepareIndex !== 0,
        }}
        // afterOpen={}
        closeIcon={<Icon className="future-group-closeicon" name="close" hasTheme />}
        unmountOnExit
        title={t`features_trade_future_select_group_index_rwkx7oq_k5`}
        footer={futureGroupModeClick ? null : undefined}
      >
        <div className="future-group-container">
          {contractGroupList?.length < 26 && showCreateNewGroup && setNewContractGroup()}
          {contractGroupList?.map((item, index) => {
            return setProfitContractGroup(item, index)
          })}
        </div>
      </Modal>
    </div>
  )
}

export default forwardRef(FutureGroupModal)
