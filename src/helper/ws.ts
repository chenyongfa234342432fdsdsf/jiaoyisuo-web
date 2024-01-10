import { getWsContractType, WsTypesEnum } from '@/constants/ws'
import { getBusinessId } from './common'

function getBothSpotAndContractTypes(type: WsTypesEnum) {
  return [type, getWsContractType(type)]
}

export function getOptionWsContractCode(code: string) {
  return `${getBusinessId()}_${code}`
}

export { getBothSpotAndContractTypes }
