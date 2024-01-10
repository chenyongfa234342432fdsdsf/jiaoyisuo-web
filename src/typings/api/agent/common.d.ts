/**
 * 接口 [是否黑名单用户查询↗]
 */
export interface IAgentIsBlackReq {}
export interface IAgentIsBlackResp {
  /** 拉黑原因 */
  reason: string
  /** 是否拉黑 */
  inBlacklist: boolean
}

