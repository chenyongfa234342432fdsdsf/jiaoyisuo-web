import { t } from '@lingui/macro'
import { getC2cOrderShortPageRoutePath, getC2cOrderC2CPageRoutePath, getC2cOrderBidPageRoutePath } from '@/helper/route'

const getBuyTitleTab = () => {
  return [
    {
      key: 'ShortcutCoins',
      title: t`features_c2c_new_common_c2c_new_nav_index_5101352`,
      url: `${getC2cOrderShortPageRoutePath()}`,
    },
    { key: 'BuyCoins', title: `C2C ${t`trade.c2c.trade`}`, url: `${getC2cOrderC2CPageRoutePath()}` },
    {
      key: 'BidTrade',
      title: t`features_c2c_trade_c2c_tab_c2ctab_y1sy2mcgcr`,
      url: `${getC2cOrderBidPageRoutePath()}`,
    },
  ]
}

export { getBuyTitleTab }
