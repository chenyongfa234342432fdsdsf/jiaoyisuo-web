import { MarkcoinRequest } from '@/plugins/request'
import { envUtils } from '@nbit/utils'
import axios from 'axios'
import { businessId, newbitEnv } from '@/helper/env'

const { getEnvS3MaintenanceApiUrl } = envUtils

export const getMaintenanceConfigFromS3: MarkcoinRequest = () => {
  return axios.request({
    baseURL: getEnvS3MaintenanceApiUrl(newbitEnv, businessId),
    method: 'GET',
  })
}
