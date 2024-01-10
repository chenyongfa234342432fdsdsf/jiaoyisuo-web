/**
 * 邀请返佣 - 代理商首页
 */
export function getAgentInviteRoutePath() {
  const url = `/agent`
  return url
}

/**
 * 代理中心首页
 */
export function getAgentCenterRoutePath() {
  const url = `/agent/agency-center`
  return url
}

/**
 * 申请金字塔介绍页
 */
export function getAgentApplyRoutePath() {
  const url = `/agent/apply`
  return url
}

/**
 * 申请金字塔信息录入和结果页
 */
export function getAgentJoinRoutePath() {
  const url = `/agent/join`
  return url
}

/**
 * 更多邀请详情
 */
export function getAgentMoreInviteDetailRoutePath(model?: string) {
  let url = `/agent/invitation-v3`
  if (model) {
    url += `?model=${model}`
  }
  return url
}

/**
 * 邀请码管理
 */
export function getAgentInviteCodeManage() {
  const url = `/agent/manage`
  return url
}

/**
 * 代理中心 - Ta 的邀请详情界面
 * @param model 代理模式 model
 * @param uid 用户 UID
 */
export function getAgentHisInvitationPageRoutePath(model: string, uid?: number): string {
  let url = `/agent/center/invite?model=${model || ''}`
  if (uid) {
    url += `&uid=${uid}`
  }
  return url
}
