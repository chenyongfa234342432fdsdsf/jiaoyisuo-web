import { AssetsRouteEnum, FinancialRecordLogTypeEnum, getFinancialRecordLogTypeEnumName } from '@/constants/assets'
import { AssetsLayout } from '@/features/assets/assets-layout'
import { AssetsHeader } from '@/features/assets/common/assets-header'
import { FinancialRecord } from '@/features/assets/financial-record'
import { generateAssetsDefaultSeoMeta } from '@/helper/assets'
import { usePageContext } from '@/hooks/use-page-context'
import { useAssetsStore } from '@/store/assets'
import { t } from '@lingui/macro'
import { useEffect } from 'react'

export function Page() {
  const pageContext = usePageContext()
  const logTypeId = Number(pageContext?.urlParsed?.search?.type)
  const assetsStore = useAssetsStore()
  const { financialRecordTabType, updateFinancialRecordTabType } = { ...assetsStore }

  useEffect(() => {
    updateFinancialRecordTabType(logTypeId || FinancialRecordLogTypeEnum.main)
  }, [logTypeId])

  let selectedMenuId
  switch (financialRecordTabType) {
    case FinancialRecordLogTypeEnum.futures:
      selectedMenuId = AssetsRouteEnum.futures
      break
    case FinancialRecordLogTypeEnum.main:
      selectedMenuId = AssetsRouteEnum.coins
      break
    case FinancialRecordLogTypeEnum.c2c:
      selectedMenuId = AssetsRouteEnum.c2c
      break
    default:
      selectedMenuId = AssetsRouteEnum.coins
      break
  }
  return (
    <AssetsLayout
      selectedMenuId={selectedMenuId}
      header={
        <AssetsHeader
          title={
            <>
              {t`assets.financial-record.title`} ({getFinancialRecordLogTypeEnumName(financialRecordTabType)})
            </>
          }
          showRight={false}
        />
      }
    >
      <FinancialRecord />
    </AssetsLayout>
  )
}

export async function onBeforeRender(pageContext: PageContext) {
  const pageProps = {}
  const layoutParams = {
    footerShow: true,
    headerShow: true,
    fullScreen: true,
  }
  return {
    pageContext: {
      unAuthTo: '/login?redirect=/assets/financial-record',
      pageProps,
      layoutParams,
      documentProps: generateAssetsDefaultSeoMeta({
        title: t`assets.financial-record.title`,
      }),
    },
  }
}
