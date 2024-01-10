/**
 * 财务记录 - 合约财务记录详情
 */
import { t } from '@lingui/macro'
import { formatDate } from '@/helper/date'
import { getTextFromStoreEnums } from '@/helper/store'
import { useAssetsStore } from '@/store/assets'
import { FinancialRecordTypeEnum, RecordExpenseDetailsList, RecordTransactionDetailsList } from '@/constants/assets'
import { EntrustTypeEnum } from '@/constants/order'
import { PerpetualMigrateTypeEnum, getEntrustTypeEnumName } from '@/constants/assets/futures'
import { formatCurrency } from '@/helper/decimal'
import { IncreaseTag } from '@nbit/react'
import { IListEnum, RecordDetailsLayout } from '../common/details-layout'

function FuturesLogDetails() {
  const { financialRecordDetail, assetsEnums } = useAssetsStore()

  const {
    typeInd,
    createdByTime,
    updatedByTime,
    side,
    groupName = '--',
    operationType = '',
    toGroupName = '--',
    lever,
    entrustTypeInd,
    price,
    size,
    tradeSize,
    tradePrice,
    realizedProfit,
    quoteCoinShortName,
    baseCoinShortName,
    migrateMargin,
    migrateType = '',
    orderTypeInd,
    orderStatus,
    transferIn,
    transferOut,
  } = financialRecordDetail || {}

  let infoList: IListEnum[] = []
  const createTimeItem = [
    { label: t`assets.financial-record.creationTime`, content: createdByTime ? formatDate(createdByTime) : '--' },
    { label: t`assets.financial-record.completionTime`, content: updatedByTime ? formatDate(updatedByTime) : '--' },
  ]

  // 平仓/开仓/强制平仓/强制减仓
  if (RecordTransactionDetailsList.indexOf(typeInd) > -1) {
    infoList = [
      { label: t`features_assets_futures_index_futures_list_index_5101349`, content: groupName },
      {
        label: t`features/orders/filters/future-0`,
        content: getTextFromStoreEnums(String(side), assetsEnums.financialRecordTypeCttSideList.enums), // getTransactionDirectionName(side),
      },
      {
        label: t`features_assets_financial_record_record_detail_record_details_info_index_5101563`,
        content: `${lever}X`,
      },
      {
        label: t`features/trade/trade-order-confirm/index-1`,
        content:
          entrustTypeInd && String(entrustTypeInd) === String(EntrustTypeEnum.market)
            ? getEntrustTypeEnumName(entrustTypeInd)
            : `${formatCurrency(price)} ${quoteCoinShortName}`,
      },
      {
        label: t`order.columns.entrustType`,
        content: getTextFromStoreEnums(orderTypeInd || '', assetsEnums.financialRecordTypeCttOrderList.enums),
      },
      {
        label: t`order.filters.status.label`,
        content: getTextFromStoreEnums(orderStatus || '', assetsEnums.financialRecordTypeEntrustStatusList.enums),
      },
      { label: t`features/trade/trade-order-confirm/index-3`, content: `${formatCurrency(size)} ${baseCoinShortName}` },
      { label: t`order.columns.logCount`, content: `${formatCurrency(tradeSize)} ${baseCoinShortName}` },
      {
        label: t`features/orders/details/future-1`,
        content: createdByTime ? formatDate(createdByTime) : '--',
      },
      { label: t`assets.financial-record.completionTime`, content: updatedByTime ? formatDate(updatedByTime) : '--' },
      {
        label: t`order.columns.averagePrice`,
        content: formatCurrency(tradePrice),
      },
      {
        label: t`features/orders/order-columns/future-2`,
        content: (
          <span>
            <IncreaseTag hasPrefix={false} value={realizedProfit} /> {quoteCoinShortName}
          </span>
        ),
      },
    ]
  } else if (typeInd === FinancialRecordTypeEnum.migrate) {
    // 迁移
    infoList = [
      {
        label: t`features_assets_financial_record_record_detail_record_details_info_index_a1opfywree1fcds6maplg`,
        content: groupName,
      },
      {
        label: t`features_assets_financial_record_record_detail_record_details_info_index_5j2eqzfwqqomw0pxbyojy`,
        content: toGroupName,
      },
      {
        label:
          migrateType === PerpetualMigrateTypeEnum.merge
            ? t`features_assets_financial_record_record_detail_record_details_info_index_5101581`
            : t`features_assets_financial_record_record_detail_record_details_info_index_5101575`,
        content: `${migrateMargin} ${quoteCoinShortName || '--'}`,
      },
      {
        label: t`assets.coin.trade-records.table.type`,
        content: getTextFromStoreEnums(migrateType, assetsEnums.financialRecordTypePerpetualMigrateList.enums),
      },
      ...createTimeItem,
    ]
  } else if (
    typeInd === FinancialRecordTypeEnum.futuresTransfer ||
    typeInd === FinancialRecordTypeEnum.spotFuturesTransfer
  ) {
    // 合约划转
    infoList = [
      {
        label: t`features_assets_financial_record_record_detail_record_details_info_index_a1opfywree1fcds6maplg`,
        content: transferOut || t`features_c2c_center_coin_switch_index_msuc6zmu2dxzocr_5wzmr`,
      },
      {
        label: t`features_assets_financial_record_record_detail_record_details_info_index_zykzsnba75qynejc48cdt`,
        content: transferIn || t`features_c2c_center_coin_switch_index_msuc6zmu2dxzocr_5wzmr`,
      },
      {
        label: t`features_assets_financial_record_record_detail_record_details_info_index_ii3vigoelumbckpppw85o`,
        content: getTextFromStoreEnums(operationType, assetsEnums.financialRecordTypeOperationList.enums),
      },
      ...createTimeItem,
    ]
  } else if (typeInd === FinancialRecordTypeEnum.rechargeBond || typeInd === FinancialRecordTypeEnum.extractBond) {
    // 保证金充值/保证金提取
    infoList = [
      { label: t`features_assets_futures_index_futures_list_index_5101349`, content: groupName },
      {
        label: `${
          typeInd === FinancialRecordTypeEnum.rechargeBond
            ? t`features_assets_financial_record_record_detail_record_details_info_index_5101567`
            : t`features_assets_financial_record_record_detail_record_details_info_index_5101568`
        }`,
        content: getTextFromStoreEnums(operationType, assetsEnums.financialRecordTypeOperationList.enums),
      },
      ...createTimeItem,
    ]
  } else if (RecordExpenseDetailsList.indexOf(typeInd) > -1) {
    // 资金费用/强平返还/强平手续费/开仓手续费/平仓手续费/平仓盈亏/锁仓手续费
    infoList = [
      { label: t`features_assets_futures_index_futures_list_index_5101349`, content: groupName },
      {
        label: t`features/orders/order-columns/holding-0`,
        content: getTextFromStoreEnums(String(side), assetsEnums.financialRecordTypeCttPositionSideList.enums),
      },
      {
        label: t`features_assets_financial_record_record_detail_record_details_info_index_5101563`,
        content: lever ? `${lever}X` : '--',
      },
      ...createTimeItem,
    ]
  } else if (typeInd === FinancialRecordTypeEnum.benefitsInjection) {
    //  穿仓保险金注入
    infoList = [
      { label: t`features_assets_futures_index_futures_list_index_5101349`, content: groupName },
      ...createTimeItem,
    ]
  }

  return <RecordDetailsLayout list={infoList} />
}

export { FuturesLogDetails }
