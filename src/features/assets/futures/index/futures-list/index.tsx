import { t } from '@lingui/macro'
import { Button, Message, TableColumnProps } from '@nbit/arco'
import { link } from '@/helper/link'
import AssetsTable from '@/features/assets/common/assets-table'
import Icon from '@/components/icon'
import { IncreaseTag } from '@nbit/react'
import { AssetsEncrypt } from '@/features/assets/common/assets-encrypt'
import { formatCurrency } from '@/helper/decimal'
import { FuturesAccountResp } from '@/typings/api/assets/futures'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { getFuturesDetailPageRoutePath } from '@/helper/route/assets'
import { AssetsTransferTypeEnum } from '@/constants/assets/futures'
import { FuturesGuideIdEnum } from '@/constants/future/trade'
import AssetsFuturesTransfer from '@/features/assets/common/transfer/assets-futures-transfer'
import { getAccountTypeColor } from '@/helper/assets/futures'
import { useState } from 'react'
import { useContractMarketStore } from '@/store/market/contract'
import { getTextFromStoreEnums } from '@/helper/store'
import { getTradeFuturesRoutePath } from '@/helper/route/trade'
import { NoDataElement } from '@/features/orders/order-table-layout'
import classNames from 'classnames'
import { AssetWsSubscribePageEnum } from '@/constants/assets'
import { useCommonStore } from '@/store/common'
import { I18nsEnum } from '@/constants/i18n'
import { useFutureQuoteDisplayDigit } from '@/hooks/features/assets'
import styles from './index.module.css'

interface IFuturesListProps {
  loading?: boolean
  assetsListData: FuturesAccountResp[] | undefined
  onSuccess?: (val: any) => void
  height?: number | string
  /** 组件使用页面：trade、other */
  fromPage?: string
}
function FuturesList(props: IFuturesListProps) {
  const { loading, assetsListData, height, onSuccess, fromPage = AssetWsSubscribePageEnum.other } = props
  const [visibleTransfer, setVisibleTransfer] = useState(false)
  const assetsFuturesStore = useAssetsFuturesStore()
  const offset = useFutureQuoteDisplayDigit()
  const {
    futuresCurrencySettings: { currencySymbol },
    futuresTransferModal,
    updateFuturesTransferModal,
    futuresEnums,
  } = {
    ...assetsFuturesStore,
  }
  const { locale, isMergeMode } = useCommonStore()

  const futuresStore = useContractMarketStore()
  const currentSymbolName = futuresStore?.currentCoin?.symbolName || futuresStore.defaultCoin.symbolName
  const getDefaultTradeUrl = groupId => {
    const url = getTradeFuturesRoutePath(currentSymbolName as string, undefined, groupId)
    return url
  }

  const handleTransferClick = (groupId: string, type: AssetsTransferTypeEnum) => {
    setVisibleTransfer(true)
    updateFuturesTransferModal({
      groupId,
      type,
    })
  }

  /** 划转回调 */
  const onTransferCallBackFn = async () => {
    setVisibleTransfer(false)
    onSuccess && onSuccess(true)
  }

  const cellStyle: any = {
    headerCellStyle: {
      textAlign: 'right',
    },
    bodyCellStyle: {
      textAlign: 'right',
    },
  }

  const columns: TableColumnProps[] = [
    {
      title: t`features_c2c_center_coin_switch_index_3rawstucyu0jlw1lxln_i`,
      dataIndex: 'groupName',
      sorter: false,
      render: (col, record) => (
        <div
          className="group-name"
          onClick={() => {
            link(getFuturesDetailPageRoutePath(record.groupId))
          }}
        >
          <div className="name">{record.groupName}</div>
          <Icon name="next_arrow" hasTheme className="next-icon" />
        </div>
      ),
    },
    {
      title: t`features_assets_futures_index_futures_list_index_057lv_wqnq`,
      dataIndex: 'accountType',
      sorter: false,
      ...cellStyle,
      render: (col, record) => (
        <span className="account-type" style={getAccountTypeColor(record.accountType)}>
          {getTextFromStoreEnums(record?.accountType || '', futuresEnums.perpetualAccountTypeEnum.enums)}
        </span>
      ),
    },
    {
      title: t`features/orders/order-columns/holding-6`,
      dataIndex: 'unrealizedProfit',
      sorter: true,
      ...cellStyle,
      render: (col, record) => (
        <AssetsEncrypt
          content={
            <div className="info-cell-value">
              <IncreaseTag
                value={record.unrealizedProfit}
                delZero={false}
                kSign
                hasPrefix
                digits={offset}
                isRound={false}
              />
              {(!isMergeMode || fromPage === AssetWsSubscribePageEnum.trade) && (
                <span className="ml-2">{record.baseCoin}</span>
              )}
            </div>
          }
        />
      ),
    },
    // {
    //   title: t`features_assets_futures_index_futures_list_index_hqr-fsvktjorznca7igrg`,
    //   sorter: true,
    //   ...cellStyle,
    //   dataIndex: 'groupTotalAsset',
    //   render: (col, record) => (
    //     <AssetsEncrypt
    //       content={
    //         <>
    //           {formatCurrency(record.groupTotalAsset, offset)}
    //           <span className="ml-2">{record.baseCoin}</span>
    //         </>
    //       }
    //     />
    //   ),
    // },
    // {
    //   title: t`assets.common.position_assets_new`,
    //   sorter: true,
    //   ...cellStyle,
    //   dataIndex: 'positionCoinAsset',
    //   render: (col, record) => (
    //     <AssetsEncrypt
    //       content={
    //         <>
    //           {formatCurrency(record.positionCoinAsset, offset)}
    //           <span className="ml-2">{record.baseCoin}</span>
    //         </>
    //       }
    //     />
    //   ),
    // },
    {
      title: t`features_assets_futures_index_futures_list_index_o6xr_tqvdn`,
      sorter: true,
      ...cellStyle,
      dataIndex: 'marginAvailable',
      render: (col, record) => (
        <AssetsEncrypt
          content={
            <div className="info-cell-value">
              {formatCurrency(record.marginAvailable, offset)}
              {(!isMergeMode || fromPage === AssetWsSubscribePageEnum.trade) && (
                <span className="ml-2">{record.baseCoin}</span>
              )}
            </div>
          }
        />
      ),
    },
    // {
    //   title: t`features_assets_futures_index_total_assets_index_wadnkn6hxo3kzwjzjkahr`,
    //   sorter: true,
    //   ...cellStyle,
    //   dataIndex: 'lockCoinAsset',
    //   render: (col, record) => (
    //     <AssetsEncrypt
    //       content={
    //         <div>
    //           {isNaN(record.lockCoinAsset) ? (
    //             '--'
    //           ) : (
    //             <div>
    //               {formatCurrency(record.lockCoinAsset, offset)} <span className="ml-2">{record.baseCoin}</span>
    //             </div>
    //           )}
    //         </div>
    //       }
    //     />
    //   ),
    // },
    {
      title: t`order.columns.action`,
      sorter: false,
      fixed: 'right',
      ...cellStyle,
      width: locale === I18nsEnum['en-US'] ? 320 : 240,
      render: (col, record) => (
        <div className="opt-item">
          <Button
            type="secondary"
            onClick={e => {
              handleTransferClick(record.groupId, AssetsTransferTypeEnum.to)
              e.stopPropagation()
            }}
          >{t`constants/assets/futures-5`}</Button>
          <Button
            // disabled={+record.groupAsset <= 0}
            type="secondary"
            className={classNames({
              'is-disabled': +record.groupAsset <= 0,
            })}
            onClick={e => {
              e.stopPropagation()
              if (Number(record.groupAsset) <= 0) {
                Message.warning(t`features_assets_futures_index_futures_list_index_2sqfbaaefo`)
                return
              }
              handleTransferClick(record.groupId, AssetsTransferTypeEnum.from)
            }}
          >{t`constants/assets/futures-6`}</Button>
          <Button
            type="primary"
            onClick={e => {
              e.stopPropagation()
              link(getDefaultTradeUrl(record.groupId))
            }}
          >{t`features/assets/margin/all/assets-list/index-7`}</Button>
        </div>
      ),
    },
  ]

  function getTableScrollVal() {
    if (fromPage === AssetWsSubscribePageEnum.trade && assetsListData && assetsListData?.length > 0) {
      return {
        x: 800,
        y: height,
      }
    } else {
      return {
        y: height || 480,
      }
    }
  }
  return (
    <div className={styles.scoped}>
      <div
        className={classNames(
          'futures-list-root',
          // theme === ThemeEnum.dark ? 'assets-table-dark' : 'assets-table-light',
          {
            // 'arco-table-body-full': true,
            // 'auto-width': fromPage === AssetWsSubscribePageEnum.trade,
            'no-data': assetsListData?.length === 0,
          }
        )}
        id={FuturesGuideIdEnum.accountDetails}
      >
        <AssetsTable
          // loading={loading}
          rowKey={record => `${record.groupId}`}
          columns={columns}
          data={assetsListData}
          border={false}
          pagination={false}
          noDataElement={<NoDataElement isFuture loading={loading} />}
          scroll={getTableScrollVal()}
          sortable
          // autoWidth={fromPage === AssetWsSubscribePageEnum.trade}
          // minWidthWithColumn={false}
          // fitByContent={fromPage === AssetWsSubscribePageEnum.trade}
          // onRow={record => {
          //   return {
          //     onClick: () => {
          //       link(getFuturesDetailPageRoutePath(record.groupId))
          //     },
          //   }
          // }}
        />
      </div>
      {visibleTransfer && (
        <AssetsFuturesTransfer
          type={futuresTransferModal?.type}
          coinId={futuresTransferModal?.coinId}
          groupId={futuresTransferModal?.groupId}
          currencySymbol={currencySymbol}
          visible={visibleTransfer}
          setVisible={setVisibleTransfer}
          onSubmitFn={onTransferCallBackFn}
        />
      )}
    </div>
  )
}

export { FuturesList }
