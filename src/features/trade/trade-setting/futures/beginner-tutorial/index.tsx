import { t } from '@lingui/macro'
import Icon from '@/components/icon'
import { link } from '@/helper/link'
import { useFuturesStore } from '@/store/futures'
import { useDefaultFuturesUrl } from '@/helper/market'
import { UserHandleIntroEnum } from '@/constants/user'
import { usePageContext } from '@/hooks/use-page-context'

function FuturesBeginnerTutorial({ onFuturesClose }: { onFuturesClose?: (isTrue: boolean) => void }) {
  const { urlParsed } = usePageContext()
  const futuresLink = useDefaultFuturesUrl()
  const { setIsFutureShow, resetIntroEnabled } = useFuturesStore()
  const handleOnClick = () => {
    const routeName = urlParsed?.pathname
    const isAssets = routeName?.includes(UserHandleIntroEnum.assets)
    if (isAssets) {
      link(futuresLink)
      setIsFutureShow(true)
      return
    }
    resetIntroEnabled()
    onFuturesClose?.(false)
  }

  return (
    <div className="list" onClick={handleOnClick}>
      <div className="label">{t`trade.c2c.tutorial`}</div>
      <div className="value">
        <Icon name="next_arrow" hasTheme />
      </div>
    </div>
  )
}

export default FuturesBeginnerTutorial
