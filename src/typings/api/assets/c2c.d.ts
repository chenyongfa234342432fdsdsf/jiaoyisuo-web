
/**
 * 资产-c2c 列表
 */
export type AssetsC2CListReq = {}

export type AssetsC2CListResp = {
  uid?: string;
  /** 币种 ID */
  coinId?: string;
  /** 币种代码 用于匹配汇率 */
  symbol?: string;
  /** 可用余额 */
  balance?: number;
  businessId?: number;
  /** 冻结金额 */
  freezeBalance?: number;
  /** 申请广告商真实冻结资产（赔付会扣减） */
  merchantFreezeBalance?:number
  appLogo: string;
  webLogo: string;
  coinName: string;
  coinFullName: string;
  usdBalance?: number;
}