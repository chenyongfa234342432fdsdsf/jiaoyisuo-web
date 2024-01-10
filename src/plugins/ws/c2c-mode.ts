import { isPublicC2cMode } from '@/helper/env'
import NbitWebSocket from './core'
import ws from '.'

const c2cWs = isPublicC2cMode ? new NbitWebSocket() : ws

export default c2cWs
