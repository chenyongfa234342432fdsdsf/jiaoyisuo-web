import { create } from 'zustand'
import { createTrackedSelector } from 'react-tracked'
import produce from 'immer'
import { devtools } from 'zustand/middleware'
import {
  IAgentInviteCodeDefaultResp,
  IAgentPyramidApplyInfoResp,
  IRebateLadderResp,
} from '@/typings/api/agent/agent-invite'
import { IAgentIsBlackResp } from '@/typings/api/agent/common'
import { AgentDictionaryTypeEnum } from '@/constants/agent/agent-invite'
import { IStoreEnum } from '@/typings/store/common'
import { getCodeDetailListBatch } from '@/apis/common'
import { IApplyInvitationCodeList, AgentProductRatioDate } from '@/typings/api/agent/agent-invite/apply'

type IStore = ReturnType<typeof getStore>

function getStore(set, get) {
  return {
    /** 默认邀请码信息 */
    defaultInviteCodeData: <IAgentInviteCodeDefaultResp | null>null,
    updateDefaultInviteCodeData: newDefaultInviteCodeData =>
      set(
        produce((store: IStore) => {
          store.defaultInviteCodeData = newDefaultInviteCodeData
        })
      ),
    /** 邀请码列表 */
    inviteCodeList: <IApplyInvitationCodeList[]>[],
    updateInviteCodeList: newInviteCodeList =>
      set(
        produce((store: IStore) => {
          store.inviteCodeList = newInviteCodeList
        })
      ),
    /** 金字塔产品最大返佣比例 */
    productRadio: [] as AgentProductRatioDate[],
    updateProductRadio: newProductRadio =>
      set(
        produce((store: IStore) => {
          store.productRadio = newProductRadio
        })
      ),
    /** 区域返佣阶梯 */
    rebateLadderArea: {} as IRebateLadderResp,
    updateRebateLadderArea: newRebateLadderArea =>
      set(
        produce((store: IStore) => {
          store.rebateLadderArea = newRebateLadderArea
        })
      ),
    /** 三级返佣阶梯 */
    rebateLadderThreeLevel: {} as IRebateLadderResp,
    updateRebateLadderThreeLevel: newRebateLadderThreeLevel =>
      set(
        produce((store: IStore) => {
          store.rebateLadderThreeLevel = newRebateLadderThreeLevel
        })
      ),
    /** 是否黑名单用户 */
    isBlackListData: {} as IAgentIsBlackResp,
    updateIsBlackListData: newIsBlackListData =>
      set(
        produce((store: IStore) => {
          store.isBlackListData = newIsBlackListData
        })
      ),
    /** 金字塔代理申请入口展示条件、申请状态等 */
    pyramidAgentApplyData: {} as IAgentPyramidApplyInfoResp,
    updatePyramidAgentApplyData: newPyramidAgentApplyData =>
      set(
        produce((store: IStore) => {
          store.pyramidAgentApplyData = newPyramidAgentApplyData
        })
      ),
    /** 是否展示金字塔返佣比例设置弹框 */
    visiblePyramidRebateSetting: false,
    updateVisiblePyramidRebateSetting: newVisiblePyramidRebateSetting =>
      set(
        produce((store: IStore) => {
          store.visiblePyramidRebateSetting = newVisiblePyramidRebateSetting
        })
      ),
    /** 是否展示区域代理返佣阶梯弹框 */
    visibleAreaRebateModal: false,
    updateVisibleAreaRebateModal: newVisibleAreaRebateModal =>
      set(
        produce((store: IStore) => {
          store.visibleAreaRebateModal = newVisibleAreaRebateModal
        })
      ),
    /** 是否展示三级代理返佣阶梯弹框 */
    visibleThreeLevelRatioModal: false,
    updateVisibleThreeLevelRatioModal: newVisibleThreeLevelRatioModal =>
      set(
        produce((store: IStore) => {
          store.visibleThreeLevelRatioModal = newVisibleThreeLevelRatioModal
        })
      ),
    /** 代理商所需数据字典 */
    agentEnums: {
      /** 返佣类型 */
      agentRebateTypeCdEnum: {
        codeKey: AgentDictionaryTypeEnum.rebateTypeCd,
        enums: [],
      } as IStoreEnum,
      /** 产品线 - 显示返佣/手续费描述 */
      agentProductCdRatioEnum: {
        codeKey: AgentDictionaryTypeEnum.agentProductCdRatio,
        enums: [],
      } as IStoreEnum,
      /** 产品线 - 仅展示产品名 */
      agentProductCdShowRatioEnum: {
        codeKey: AgentDictionaryTypeEnum.agentProductCdShowRatio,
        enums: [],
      } as IStoreEnum,
      /** 代理模式/代理类型 */
      agentTypeCodeEnum: {
        codeKey: AgentDictionaryTypeEnum.agentTypeCode,
        enums: [],
      } as IStoreEnum,
      /** 代理商审核状态 */
      approvalStatusIndEnum: {
        codeKey: AgentDictionaryTypeEnum.approvalStatusInd,
        enums: [],
      } as IStoreEnum,
      /** 代理等级规则 - 区域和三级返佣阶梯规则 */
      // agentGradeRulesEnum: {
      //   codeKey: AgentDictionaryTypeEnum.agentGradeRules,
      //   enums: [],
      // } as IStoreEnum,
      /** 代理等级规则 - 区域返佣阶梯规则 */
      agentAreaGradeRulesEnum: {
        codeKey: AgentDictionaryTypeEnum.agentAreaGradeRules,
        enums: [],
      } as IStoreEnum,
      /** 代理等级规则 - 三级返佣阶梯规则 */
      agentThreeGradeRulesEnum: {
        codeKey: AgentDictionaryTypeEnum.agentThreeGradeRules,
        enums: [],
      } as IStoreEnum,
      /** 代理等级规则 - 区域和三级等级 */
      agentGradeEnum: {
        codeKey: AgentDictionaryTypeEnum.agentGrade,
        enums: [],
      } as IStoreEnum,
    },
    async fetchAgentEnums() {
      const state: IStore = get()
      const data = await getCodeDetailListBatch(Object.values(state.agentEnums).map(item => item.codeKey))
      set(
        produce((draft: IStore) => {
          const items = Object.values(draft.agentEnums)
          items.forEach((item, index) => {
            item.enums = data[index].map(enumValue => {
              return {
                label: enumValue.codeKey,
                value:
                  parseInt(enumValue.codeVal, 10).toString() === enumValue.codeVal
                    ? parseInt(enumValue.codeVal, 10)
                    : enumValue.codeVal,
              }
            })
          })
        })
      )
    },
  }
}

const baseAgentInviteV3Store = create(devtools(getStore, { name: 'market-agent-invite-store' }))

const useAgentInviteV3Store = createTrackedSelector(baseAgentInviteV3Store)

export { useAgentInviteV3Store, baseAgentInviteV3Store }
