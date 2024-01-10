import { useRef, useState } from 'react'
import { t } from '@lingui/macro'
import { AssetsRouteEnum, FinancialRecordLogTypeEnum } from '@/constants/assets'
import { AssetsLayout, ChildrenClassNameEnum } from '@/features/assets/assets-layout'
import { FuturesAccountIndex } from '@/features/assets/futures/index'
import { AssetsHeader } from '@/features/assets/common/assets-header'
import TradeSidebarSetting from '@/features/trade/trade-setting/common/sidebar'
import FuturesAutomaticMarginCallDrawer from '@/features/trade/trade-setting/futures/automatic-margin-call/sidebar'
import Icon from '@/components/icon'
import Link from '@/components/link'
import { Button } from '@nbit/arco'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import { useContractPreferencesStore } from '@/store/user/contract-preferences'
import { UserContractVersionEnum } from '@/constants/user'
import { generateAssetsDefaultSeoMeta } from '@/helper/assets'
import CreateNewAccount from '@/features/future/create-new-account'

export function Page() {
  /** 偏好设置 */
  const [visibleFuturesSetting, setVisibleFuturesSetting] = useState(false)
  /** 自动追加保证金 */
  const [visibleAutoAddMargin, setVisibleAutoAddMargin] = useState(false)
  /** 是否刷新内部组件 */
  const [isRefresh, setIsRefresh] = useState(false)
  /** 新建账户 */
  const createAccountNameRef = useRef<Record<'setOpenAccountActionSheet', () => void>>()

  /** 获取合约开通状态 */
  const assetsFuturesStore = useAssetsFuturesStore()
  const {
    assetsFuturesOverview: { isOpen = false, isAutoAdd = false },
  } = { ...assetsFuturesStore }
  /** 合约偏好设置 */
  const contractPreferenceStore = useContractPreferencesStore()
  const { perpetualVersion } = contractPreferenceStore.contractPreference

  return (
    <AssetsLayout
      selectedMenuId={AssetsRouteEnum.futures}
      header={
        <AssetsHeader
          title={t`assets.index.overview.contract_assets`}
          headerChildren={
            isOpen && (
              <>
                <Icon name="asset_icon_record" hasTheme />
                <Link
                  href={`/assets/financial-record?type=${FinancialRecordLogTypeEnum.futures}`}
                >{t`assets.deposit.financialRecord`}</Link>
              </>
            )
          }
          rightChildren={
            isOpen ? (
              <>
                <Button
                  className="mr-6"
                  type="secondary"
                  onClick={() => {
                    setVisibleFuturesSetting(true)
                  }}
                >
                  {t`modules_assets_futures_index_page_5101345`}
                </Button>
                {perpetualVersion === UserContractVersionEnum.professional && isAutoAdd && (
                  <Button
                    className="mr-6"
                    type="secondary"
                    // disabled={!isAutoAdd}
                    onClick={() => {
                      setVisibleAutoAddMargin(true)
                    }}
                  >
                    {t`modules_assets_futures_index_page_5101346`}
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={() => {
                    createAccountNameRef.current?.setOpenAccountActionSheet()
                  }}
                >{t`modules_assets_futures_index_page_6zn40sey2p`}</Button>
              </>
            ) : (
              <div></div>
            )
          }
        />
      }
    >
      <FuturesAccountIndex isRefresh={isRefresh} />
      {/* 合约偏好 */}
      {visibleFuturesSetting && (
        <TradeSidebarSetting
          visible={visibleFuturesSetting}
          setVisible={setVisibleFuturesSetting}
          onSuccess={() => {
            setIsRefresh(!isRefresh)
          }}
          isTutorial
        />
      )}
      {/* 追加保证金 */}
      {visibleAutoAddMargin && (
        <FuturesAutomaticMarginCallDrawer
          maskShow
          visible={visibleAutoAddMargin}
          setVisible={setVisibleAutoAddMargin}
          onSuccess={() => {
            setIsRefresh(!isRefresh)
          }}
        />
      )}
      {/* 新建账户 */}
      {/* {visibleCreateAccount &&  */}
      <CreateNewAccount ref={createAccountNameRef} />
      {/* } */}
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
      unAuthTo: '/login?redirect=/assets/futures',
      pageProps,
      layoutParams,
      documentProps: generateAssetsDefaultSeoMeta({
        title: t`assets.index.overview.contract_assets`,
      }),
    },
  }
}
