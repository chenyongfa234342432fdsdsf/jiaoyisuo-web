import { t } from '@lingui/macro'
import C2CCenter from '@/features/c2c/center'
import C2cTab from '@/features/c2c/trade/c2c-tab'
import { useC2CAdvertiseStore } from '@/store/c2c/advertise'
import { getC2cDefaultSeoMeta } from '@/helper/c2c/trade'
import { useMount } from 'ahooks'

function Page() {
  const { getAdCodeDictionary, fetchAdvertiseEnums } = useC2CAdvertiseStore()

  useMount(() => {
    fetchAdvertiseEnums()
    getAdCodeDictionary()
  })

  return (
    <C2cTab>
      <C2CCenter />
    </C2cTab>
  )
}

async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      unAuthTo: '/login?redirect=/c2c/center',
      pageProps,
      layoutParams,
      documentProps: await getC2cDefaultSeoMeta(
        t`features_c2c_trade_buy_tab_header_buytabheader_-hcvqfo20nqgpiid7vub5`
      ),
    },
  }
}

export { onBeforeRender, Page }
