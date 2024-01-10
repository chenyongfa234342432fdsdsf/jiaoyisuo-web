import { Button, Carousel } from '@nbit/arco'
import SignInWith from '@/features/user/login/component/sign-in-with'
import { useUserStore } from '@/store/user'
import Icon from '@/components/icon'
import { isChainstar } from '@/helper/env'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { useRequest } from 'ahooks'
import { getV1HomeCarouselList2ApiRequest } from '@/apis/home'
import { useEffect } from 'react'
import { YapiGetV1HomeCarousel2ListData } from '@/typings/yapi/HomeCarouselList2V1GetApi'
import RedirectButton from '@/components/redirect-button'
import { link } from '@/helper/link'
import LazyImage from '@/components/lazy-image'
import { isEmpty } from 'lodash'
import { getC2cFastTradePageRoutePath, getC2cTopupPageRoutePath } from '@/helper/route'
import { t } from '@lingui/macro'
import styles from './index.module.css'

function HeroBanner() {
  const isMergeMode = getMergeModeStatus()

  const { data, run, loading } = useRequest(getV1HomeCarouselList2ApiRequest, { manual: true })
  const list =
    data?.data?.list
      ?.filter(e => e.isAppOnly !== 1)
      ?.sort((a, b) => {
        if (a?.sortCode && b?.sortCode) return a.sortCode - b.sortCode
        return +1
      }) || []
  useEffect(() => {
    run({})
  }, [])

  let Pane = MonkeyBannerPane

  if (isChainstar) Pane = ChainstarBannerPane

  if (isMergeMode) Pane = MergeModeBannerPane

  if (isEmpty(list) && !loading) return <div></div>

  return (
    <Carousel
      autoPlay
      className={`${styles['hero-banner']}`}
      showArrow={'never'}
      indicatorType="dot"
      // icons={{
      //   prev: <Icon name="back_black" />,
      //   next: <Icon className="rotate-180" name="back_black" />,
      // }}
    >
      {list?.map((e, i) => (
        <Pane {...e} key={i} />
      ))}
    </Carousel>
  )
}

function CommonBannerPane(
  props: YapiGetV1HomeCarousel2ListData & { style?: any; className?: string; ButtonGroup: typeof MonkeyBtnGroup }
) {
  const { style, className, ButtonGroup, imageUrl, ...rest } = props
  const { carouselTitle, remarks, webTargetUrl, webImage } = rest || {}
  const isMergeMode = getMergeModeStatus()

  const { isLogin } = useUserStore()

  return (
    <div style={style} className={`${className} ${styles['banner-pane']}`}>
      {imageUrl && isMergeMode && <LazyImage className="banner-bg" src={imageUrl} />}
      <div className="pane-container">
        <div className="pane-text-container">
          <div className="pane-title">{carouselTitle}</div>
          <div className="pane-subtitle">{remarks}</div>
          {!isMergeMode && (
            <RedirectButton className="mb-10">
              <span
                className="text-text_color_01"
                onClick={() => webTargetUrl && link(webTargetUrl)}
              >{t`features_api_service_index_5101414`}</span>
            </RedirectButton>
          )}
          {ButtonGroup && <ButtonGroup {...rest} />}
        </div>
        {webImage && <LazyImage className="banner-img" src={webImage} />}
      </div>
    </div>
  )
}

function CommonButtonGroup({ defaultGroup, loginGroup }) {
  const { isLogin } = useUserStore()

  return isLogin ? loginGroup : defaultGroup
}

function SignInButtons() {
  return (
    <div className={styles['banner-sign-in']}>
      <Button long type="primary" onClick={() => link('/register')}>
        {t`features_user_register_index_kb0nvbyly_`}
      </Button>
      <SignInWith
        dividerText={t`features_home_hero_banner_index_q3hzuz0bur`}
        appleBtnText="Apple"
        googleBtnText="Google"
      />
    </div>
  )
}

function RechargeBuyButtons() {
  return (
    <div className="flex flex-row space-x-4">
      <Button className={'w-36'} type="primary" onClick={() => link(getC2cTopupPageRoutePath())}>
        {t`features_home_hero_banner_index_flh6elz9z2`}
      </Button>
      <Button
        className={'w-36'}
        type={'outline'}
        onClick={() => link(getC2cFastTradePageRoutePath())}
      >{t`features_layout_components_header_menu_prlscastgac3bk5dbodin`}</Button>
    </div>
  )
}

// ====================================================== //
// ==================== monkey banner =================== //
// ====================================================== //

function MonkeyBtnGroup(props) {
  const { webTargetUrl } = props
  return (
    <CommonButtonGroup
      defaultGroup={<SignInButtons />}
      loginGroup={
        <Button long className={'monkey-btn'} type="primary" onClick={() => webTargetUrl && link(webTargetUrl)}>
          {t`features_api_service_index_5101414`}
        </Button>
      }
      {...props}
    />
  )
}

function MonkeyBannerPane(props) {
  const { className, ...rest } = props
  return <CommonBannerPane {...rest} className={`${className} !bg-bg_color !bg-none`} ButtonGroup={MonkeyBtnGroup} />
}

// ====================================================== //
// ================== chainstar banner ================== //
// ====================================================== //

function ChainStarBtnGroup(props) {
  return <CommonButtonGroup defaultGroup={<SignInButtons />} loginGroup={<RechargeBuyButtons />} {...props} />
}

function ChainstarBannerPane(props) {
  return <CommonBannerPane {...props} ButtonGroup={ChainStarBtnGroup} />
}

// ====================================================== //
// ====================== TT banner ===================== //
// ====================================================== //

function MergeModeBtnGroup(props) {
  const { webTargetUrl } = props
  return (
    <CommonButtonGroup
      defaultGroup={
        <Button
          className={'merge-mode-btn'}
          onClick={() => webTargetUrl && link(webTargetUrl)}
        >{t`features_home_hero_banner_index_ou8yiseue6`}</Button>
      }
      loginGroup={
        <Button
          className={'merge-mode-btn'}
          onClick={() => webTargetUrl && link(webTargetUrl)}
        >{t`features_home_hero_banner_index_ou8yiseue6`}</Button>
      }
      {...props}
    />
  )
}

function MergeModeBannerPane(props) {
  return <CommonBannerPane {...props} ButtonGroup={MergeModeBtnGroup} />
}

export default HeroBanner
