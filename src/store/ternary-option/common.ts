enum TernaryOptionBizEnum {
  spot = 'option',
}

enum TernaryOptionTypeEnum {
  notice = 'option_order',
}

export const TernaryOptionDepthSubs = () => {
  return {
    biz: TernaryOptionBizEnum.spot,
    type: TernaryOptionTypeEnum.notice,
  }
}

enum PlanEntrustedBizEnum {
  spot = 'option',
}

enum PlanEntrustedTypeEnum {
  notice = 'option_plan_order',
}

export const PlanEntrustedDepthSubs = () => {
  return {
    biz: PlanEntrustedBizEnum.spot,
    type: PlanEntrustedTypeEnum.notice,
  }
}
