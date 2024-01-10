
/**
 * 获取用户可用券及 VIP 费率
 */
export interface VipCouponListReq {
    /** 使用场景枚举字典值 */
    businessScene: string;
}

export interface VipCouponListResp {
    /** 是否是 VIP */
    isVipUser: boolean;
    /** vip 折扣费率（实际值） */
    vipFeeRate: string;
    /** 券列表 */
    coupons: IVipCoupon[];
}

export interface IVipCoupon {
    /** 卡券 ID */
    id: string;
    /** 卡劵类型使用业务场景，字典值 */
    businessScene: string;
    /** 优惠券面值选 */
    couponValue: number;
    /** 领取时间戳 */
    assignByTime: number;
    /** 是否指定币种 是 enable 否 disable */
    coinStatus: string;
    /** 抵扣方式，direct 直接抵扣 rate 比例折扣 */
    useDiscountRule: string;
    /** 是否支持和会员叠加使用 是 enable 否 disable */
    useOverlayVipStatus: string;
    /** 当有使用门槛时，不为空，大于 0 */
    useThreshold: number;
    /** 是否有使用门槛 是 enable 否 disable */
    useRuleStatus: string;
    /** 卡劵类型 code ,字典值 */
    couponCode: string;
    /** 失效时间戳 */
    invalidByTime: number;
    /** 指定币种 id */
    coinId: string;
    /** 指定币种 symbol */
    coinSymbol: string;
    /** 比例折扣时，必填。60 表示 60% */
    useDiscountRuleRate: string;
    /** 卡劵分类类型 code ,字典值 */
    couponType: string;
    /** 卡券模板 ID */
    couponTemplateId: string;
    /** 活动名称 */
    activityName: string;
    /** 抵扣金额，前端用 */
    directFee?: string | number
    /** 福利类型 activity 活动类，mission 任务类，*/
    welfareType: string
}

export type ICoupons = {
    /** 选择的优惠券的 id */
    couponId: number;
    /** 选择的优惠券的 couponType */
    couponType: string;
    /** 选择的优惠券的 couponCode */
    couponCode: string;
}