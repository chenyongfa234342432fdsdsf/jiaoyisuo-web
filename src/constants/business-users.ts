import { isChainstar } from '@/helper/env'

// chainstar business user
export const chainstarBConfig = {
  iconfontFile: 'iconfont_chainstar_2023_12_19_00_19.js',
  ossFolder: '/newbit-chainstar',
}

// monkey business user
export const monkeyBConfig = {
  iconfontFile: 'iconfont_2023_12_18_16_46.js',
  ossFolder: '',
}

// fusion mode
export const fusionModeBConfig = {
  iconfontFile: 'iconfont_merge_mode_2023_09_20_19_06.js',
}

export const getBConfig = () => {
  if (isChainstar) return chainstarBConfig
  return monkeyBConfig
}
