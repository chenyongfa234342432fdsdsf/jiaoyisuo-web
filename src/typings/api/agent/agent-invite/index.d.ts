/**
 * 邀请返佣 - 相关接口
 */

export interface IBaseReq {}

export interface IBaseOptResp {
    /**  操作是否成功 */
    isSuccess: boolean
}

/**
 * 默认邀请码接口入参及出参
 */
export interface IAgentInviteCodeDefaultReq {}
export interface IAgentInviteCodeDefaultResp {
    id: number
    /** 邀请码 */
    invitationCode: string
    /** 区域代理 - 返佣比例 */
    area: IAreaRatioData|null
    /** 三级代理 - 返佣比例 */
    threeLevel: IThreeLevelData|null
    /** 金字塔 - 返佣比例 */
    pyramid: IPyramidData|null
    /** 返佣类型：pyramid, area, threeLevel */
    agentLine: string[]
    /** 邀请码 slogan */
    slogan: string
}
export interface IAreaRatioData {
    /** 返佣比例 */
    ratio: string
    /** 等级 */
    grade: number
}
export interface IThreeLevelData {
    /** 等级 */
    grade: number
    /** 一级返佣 */
    firstLevelRatio: string
    /** 二级返佣 */
    secondLevelRatio: string
    /** 三级返佣 */
    thirdLevelRatio: string
}
export interface IPyramidData {
    /** 产品线 */
    products: IIPyramidProductsData[]
    /** 名称 */
    name: string
    /** 申请通过 true=显示，false=不显示 (未进行首次分配) */
    showPyramidSetting: boolean
}
export interface IIPyramidProductsData {
    /** 自返佣 */
    selfRatio: number
    /** 好友返佣 */
    childRatio: number
    /** 产品线 code */
    productCd: string
}

/**
 * 接口 [邀请返佣 - 金字塔返佣申请信息↗](https://yapi.nbttfc365.com/project/44/interface/api/18429) 的 **请求类型**
 */
export interface IAgentPyramidApplyInfoReq {}

export interface IAgentPyramidApplyInfoResp {
    /** 是否显示申请金字塔代理商模式的 banner; true=显示，false=不显示 */
    showBanner: boolean
    /** 申请状态：-1=未申请，0=审核中，1=申请通过，2=申请未通过 */
    applyStatus: number
    /** 拒绝原因 id, 申请不通过时取该值 */
    rejectReasonId: number
    /** 申请通过后取该值，产品线列表 */
    products?: IAgentPyramidApplyInfoProducts[]
    /** 拒绝原因 */
    rejectReason?: string

}

export interface IAgentPyramidApplyInfoProducts {
    /** 产品线 */
    productCd: string
    /** 自身返佣比例 */
    selfRatio: number
    /** 好友返佣比例 */
    childRatio: number
}

/**
 * 代理商返佣规则
 */
export interface IAgentRebateRuleReq {}
export interface IAgentRebateRuleResp {
    /** 金字塔返佣规则 */
    pyramid: string
    /** 三级返佣规则 */
    threeLevel: string
    /** 区域返佣规则 */
    area: string
}

/**
 * 接口 [邀请返佣 - 查询海报文案↗](https://yapi.nbttfc365.com/project/44/interface/api/18554) 的 **返回类型**
 */
export interface IAgentSloganResp {
    slogan: string
}

/**
 * 接口 [邀请返佣 - 修改邀请码返佣比例↗](https://yapi.nbttfc365.com/project/44/interface/api/18404) 的 **请求类型**
 */
export interface IPyramidInviteCodeRatioReq {
    /** 邀请码 id */
    invitationCodeId: number
    ratios: IPyramidInviteCodeRatios[]
}
export interface IPyramidInviteCodeRatios {
    /** 产品线 code, 数据字典 agent_product_cd */
    productCd: string
    /** 自身返佣比例 */
    selfRatio: number
    /** 好友返佣比例 */
    childRatio: number
}

/**
 *  接口 [邀请返佣 - 返佣阶梯规则↗](https://yapi.nbttfc365.com/project/44/interface/api/18189) 的 **请求类型**
 */
export interface IRebateLadderReq {
    /** 模式*/
    model: string
}
export interface IRebateLadderResp {
    /** 用户 id */
    uid: number
    /** 升级规则 */
    upgrade: string
    /** 当前用户等级 */
    live: string
    /** 降级规则 */
    demotion: string
    /** 代理商结算币种 */
    currencySymbol: string
    /** 精度 */
    currencyOffset: string
    /** 三级返佣 */
    threeLiveRebateRatioList: IThreeLiveRebateRatioList[]
    /** 区域返佣 */
    areaRebateRatioList: IAreaRebateRatioList[]
    /** 邀请人数 */
    teamSize?: number
    /** 团队业务量 */
    volumeOfBusiness?: string
    /** 自身业务量 */
    meBusinessVolume?: string
}
export interface IThreeLiveRebateRatioList {
    /** 级别 */
    live: string
    /** 一级返佣比例 */
    oneRebateRatio: string
    /** 二级返佣比例 */
    twoRebateRatio: string
    /** 三级返佣比例 */
    threeRebateRatio: string
    /** 升降级规则 */
    conData: IUpDownCondition
}

export interface IAreaRebateRatioList {
    /** 级别 */
    live: string
    /** 返佣比例 */
    rebateRatio: string
    /** 升降级规则 */
    conData: IUpDownCondition
}
/**
* 升降级规则对象
*/
export interface IUpDownCondition {
    /** 组与规则之间关系 */
    contion: string
    /** 组 */
    upDownLiveDataGroupRespDTO: string[]
    /** 规则 */
    upDownLiveDataRespDTO: IUpDownLiveDataRespDTO[]
}

export interface IUpDownLiveDataRespDTO {
    codeKey?: string
    con?: string
    condition?: string
    val?: string
}

