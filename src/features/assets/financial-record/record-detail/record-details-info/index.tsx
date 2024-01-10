/**
 *记录详情 - 详情
 */
import { t } from '@lingui/macro'
import {
  FinancialRecordStateEnum,
  FinancialRecordTypeEnum,
  RecordRechargeTypeList,
  RecordRebateTypeList,
  RecordC2CTypeList,
  RecordFeeTypeList,
  RecordFusionTypeList,
  RecordOptionTypeList,
  RecordRecreationTypeList,
} from '@/constants/assets'
import { useAssetsStore } from '@/store/assets'
import styles from './index.module.css'
import { RechargeInfo } from './spot-recharge'
import { SpotFeeInfo } from './spot-feeinfo'
import { WithdrawFeeInfo } from './withdraw-feeinfo'
import { RebateDetail } from './rebate-details'
import { C2CDetails } from './c2c-details'
import { FusionDetails } from './fusion-details'
import { CreateTimeItem } from './common/create-time-item'
import { FuturesLogDetails } from './futures-log-details'
import { DerivativeLogDetails } from './derivative-log-details'

export function RecordDetailsInfo() {
  const { financialRecordDetail } = useAssetsStore()
  const { typeInd, statusCd, reason } = financialRecordDetail || {}

  return (
    <div className={styles.scoped}>
      {/* 充值/冲正/提币/pay */}
      {RecordRechargeTypeList.indexOf(typeInd) > -1 && <RechargeInfo />}

      {/* 现货手续费 */}
      {+typeInd === +FinancialRecordTypeEnum.spotCommission && <SpotFeeInfo />}

      {/* C2C 记录详情 */}
      {RecordC2CTypeList.includes(typeInd) && <C2CDetails />}

      {/* 提币手续费和其他手续费 */}
      {RecordFeeTypeList.indexOf(typeInd) > -1 && <WithdrawFeeInfo />}

      {/* 合约财务记录 */}
      {RecordRechargeTypeList.indexOf(typeInd) === -1 && RecordFeeTypeList.indexOf(typeInd) === -1 && (
        <FuturesLogDetails />
      )}

      {/* 衍生品记录 - 三元期权/娱乐区-财务记录详情 */}
      {(RecordOptionTypeList.indexOf(typeInd) > -1 || RecordRecreationTypeList.indexOf(typeInd) > -1) && (
        <DerivativeLogDetails />
      )}

      {/* 代理商返佣 */}
      {RecordRebateTypeList.indexOf(typeInd) > -1 && <RebateDetail />}

      {/* 融合模式记录详情 */}
      {RecordFusionTypeList.includes(typeInd) && <FusionDetails />}

      {/* 不在财务记录类型白名单的，走默认配置 */}
      {!FinancialRecordTypeEnum[typeInd] && <CreateTimeItem cssName="details-item-info" />}

      {/* 失败原因 */}
      {statusCd === FinancialRecordStateEnum.fail && (
        <div
          className={
            RecordRechargeTypeList.indexOf(typeInd) > -1 || RecordFeeTypeList.indexOf(typeInd) > -1
              ? 'detail-item'
              : 'details-item-info'
          }
        >
          <div className="label">{t`features_assets_financial_record_record_detail_index_2736`}</div>
          <div className="value">{reason}</div>
        </div>
      )}
    </div>
  )
}
