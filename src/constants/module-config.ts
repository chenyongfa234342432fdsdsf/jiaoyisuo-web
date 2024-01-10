/** 头部菜单枚举 */
export enum ModuleEnum {
  /** 现货 */
  spot = 'spot',
  /** 合约 */
  contract = 'contract',
  /** c2c */
  c2c = 'c2c',
  /** 娱乐区 */
  entertainment = 'entertainment',
  /** 三元期权 */
  options = 'options',
  /** 行情 */
  markets = 'markets',
}

export const spotModuleRoutes = ['/trade', '/orders/spot', '/markets/spot']
export const contractModuleRoutes = ['/futures', '/orders/future', '/assets/futures', '/markets/futures']

export const ModuleByRoute = {
  '/trade': ModuleEnum.spot,
  '/futures': ModuleEnum.contract,
  '/c2c': ModuleEnum.c2c,
  '/ternary-option': ModuleEnum.options,
  '/markets': ModuleEnum.markets,
  '/recreation': ModuleEnum.entertainment,
}
