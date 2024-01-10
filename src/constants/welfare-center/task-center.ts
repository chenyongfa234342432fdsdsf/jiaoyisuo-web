import { t } from '@lingui/macro'

export enum TaskType {
  // 挑战任务
  Challenge = 'challenge',
  // 成就任务
  Achievement = 'achievements',
  // 任务记录
  Record = 'record',
}

export enum RecordType {
  // 已完成
  Finished = 'finished',
  // 未完成
  Unfinished = 'undone',
  // 进行中
  Processing = 'processing',
}

export enum MissionType {
  // 合约交易
  contract_transfer = 'contract_transfer',
  // 现货交易
  spot_goods = 'spot_goods',
  // 入金
  transfer_input = 'transfer_input',
  // c2c 交易
  transfer_c2c = 'transfer_c2c',
  // 完成 kyc 认证
  kyc_authorized = 'kyc_authorized',
  // 绑定手机号
  mobile_bind = 'mobile_bind',
  // 开启全部账号安全认证
  account_security_authorized = 'account_security_authorized',
  // 现货交易手续费
  spot_fee = 'spot_fee',
  // 合约交易手续费
  contract_fee = 'contract_fee',
  // 开通手机系统通知
  mobile_notification_on = 'mobile_notification_on',
}

export enum CompareType {
  gt = '>',
  lt = '<',
  eq = '=',
  ge = '≥',
  le = '≤',
}

export enum IssueStatus {
  // 未发放
  not_issued = 'not_issued',
  // 已发放
  issued = 'issued',
}

export const getMissionName = (key, compare, value, unit) => {
  return {
    [MissionType.contract_transfer]: `${t`constants_welfare_center_task_center_zoulytinpg`} ${
      CompareType[compare]
    } ${value} ${unit}`,
    [MissionType.spot_goods]: `${t`constants_welfare_center_task_center_dlkqawzpe4`} ${
      CompareType[compare]
    } ${value} ${unit}`,
    [MissionType.spot_fee]: `${t`constants_assets_index_2741`} ${CompareType[compare]} ${value} ${unit}`,
    [MissionType.contract_fee]: `${t`constants_assets_index_2742`} ${CompareType[compare]} ${value} ${unit}`,
    [MissionType.transfer_input]: `${t`constants_welfare_center_task_center_kizdivwjkp`} ${
      CompareType[compare]
    } ${value} ${unit}`,
    [MissionType.kyc_authorized]: t`features_welfare_center_task_center_components_task_item_index_z28bewbpoh`,
    [MissionType.mobile_bind]: t`features_welfare_center_task_center_components_task_item_index_ts0qqtbr5t`,
    [MissionType.account_security_authorized]: t`features_welfare_center_task_center_components_task_item_index_dcvzwtele4`,
    [MissionType.mobile_notification_on]: t`features_welfare_center_task_center_components_task_item_index_2bkrcwryv3`,
  }[key]
}
