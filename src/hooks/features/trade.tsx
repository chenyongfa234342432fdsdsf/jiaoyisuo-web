import { Modal } from '@nbit/arco'
import { useMount } from 'react-use'
import TradeServiceTerms from '@/features/trade/trade-service-terms'
import TradeFuturesOpen, { ITradeFuturesOpenRef } from '@/features/trade/trade-futures-open'
import TradeFuturesGuideContent from '@/features/trade/trade-futures-guide-content'
import { useUserStore } from '@/store/user'
import { useRef } from 'react'
import { link } from '@/helper/link'
import { t } from '@lingui/macro'
import { useLayoutStore } from '@/store/layout'
import { UserFuturesTradeStatus } from '@/constants/user'
import { useFuturesStore } from '@/store/futures'

interface ICheckFuturesProps {
  isMount?: boolean
  isOk?: any
  isProfessionalVersion?: boolean
}
/**
 * @description:校验合约开通
 * @return checkFutures 校验函数
 */
export function useCheckFutures(props?: ICheckFuturesProps) {
  const isMount = props?.isMount
  const userStore = useUserStore()
  const { isLogin, userInfo } = userStore
  const { setOpenQuestionsMsg } = useFuturesStore()
  const { columnsDataByCd } = useLayoutStore()
  const { headerData } = useLayoutStore()
  const isProfessionalVersion = !!props?.isProfessionalVersion
  const tradeFuturesOpenRef = useRef<ITradeFuturesOpenRef>()
  function openFuturesQuestionsModal() {
    Modal.destroyAll()
    Modal?.confirm?.({
      icon: null,
      maskClosable: false,
      title: (
        <div>
          <div className="text-2xl">
            {isProfessionalVersion ? t`hooks_features_trade_47sfunxsot` : t`features/trade/future/index-2`}
          </div>
          {!isProfessionalVersion && (
            <div className="subtitle text-text_color_02 mb-2 text-sm mt-1">{t`features/trade/future/index-3`}</div>
          )}
        </div>
      ),
      style: { width: '720px' },
      content: <TradeFuturesOpen isProfessionalVersion={isProfessionalVersion} ref={tradeFuturesOpenRef} />,
      closable: true,
      hideCancel: true,
      okText: isProfessionalVersion
        ? t`features_trade_trade_service_terms_index_sa5vzuo3io`
        : t`features_trade_futures_trade_form_index_5101431`,
      onOk: () => {
        return new Promise((resolve, reject) => {
          tradeFuturesOpenRef.current?.form
            .validate()
            .then(() => {
              const _msg = tradeFuturesOpenRef.current?.msg
              setOpenQuestionsMsg(_msg)
              if (_msg) {
                reject()
                return
              }
              resolve(1)
              /** 如果是升级版本 则不弹出服务条款 */
              if (isProfessionalVersion) {
                props?.isOk && props.isOk()
                return
              }
              const confirm = Modal?.confirm?.({
                icon: null,
                maskClosable: false,
                title: t`user.validate_form_10`,
                style: { width: '420px' },
                closable: true,
                content: (
                  <TradeServiceTerms
                    onCancel={() => confirm?.close()}
                    onOk={() => {
                      confirm?.close()
                      props?.isOk && props.isOk()
                    }}
                  >
                    <span>
                      <span
                        className="text-brand_color cursor-pointer"
                        onClick={() => {
                          if (columnsDataByCd?.contract_user_agreement?.webUrl) {
                            link(columnsDataByCd?.contract_user_agreement?.webUrl, { target: true })
                          }
                        }}
                      >
                        {t({
                          id: 'features/trade/future/index-4',
                          values: { 0: headerData?.businessName },
                        })}
                      </span>
                      {t`features/trade/future/index-5`}
                      <span
                        className="text-brand_color cursor-pointer"
                        onClick={() => {
                          if (columnsDataByCd?.risk_warning_statement?.webUrl) {
                            link(columnsDataByCd?.risk_warning_statement?.webUrl, { target: true })
                          }
                        }}
                      >
                        {t`features/trade/future/index-6`}
                      </span>
                    </span>
                  </TradeServiceTerms>
                ),
                footer: null,
              })
            })
            .catch(() => {
              reject(new Error(t`hooks_features_trade_t8wkl8zslx`))
            })
        })
      },
      onCancel: () => {
        setOpenQuestionsMsg('')
      },
    })
  }
  function openCheckFuturesModal(callback?: () => void) {
    Modal.destroyAll()
    Modal?.confirm?.({
      icon: null,
      maskClosable: false,
      title: <div className="text-2xl text-center">{t`hooks_features_trade_mnlqc5z0qg`}</div>,
      style: { width: 360 },
      content: <TradeFuturesGuideContent />,
      onOk: () => {
        callback && callback()
      },
      onCancel: () => {},
      cancelText: t`hooks_features_trade_6k2ofybsae`,
      okText: t`hooks_features_trade_6iy79tvo64`,
    })
  }
  function checkFutures() {
    if (isLogin && !(userInfo?.isOpenContractStatus === UserFuturesTradeStatus.open)) {
      Modal?.confirm?.({
        icon: null,
        maskClosable: false,
        title: t`features/trade/future/index-0`,
        okText: t`hooks_features_trade_5101433`,
        content: t`features/trade/future/index-1`,
        onOk: () => {
          openCheckFuturesModal()
        },
      })
    }
  }
  useMount(() => {
    isMount && checkFutures()
  })
  return { checkFutures, openCheckFuturesModal, openFuturesQuestionsModal }
}
