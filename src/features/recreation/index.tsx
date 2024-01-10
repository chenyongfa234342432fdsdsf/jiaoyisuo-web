import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useSize } from 'ahooks'
import { HandleRecreationEntrance } from '@/features/user/utils/common'
import FullScreenLoading from '@/features/user/components/full-screen-loading'
import { link } from '@/helper/link'
import { t } from '@lingui/macro'
import styles from './index.module.css'

enum CommandsEnum {
  jumpToLogin = 'jumpToLogin', // 跳转到登录
  jumpToHome = 'jumpToHome', // 跳转到首页
}

/** 默认高度 */
const defaultHeight = 844

/** web 嵌入 h5 是一种临时解决方案，最终会由 web 自己的娱乐区替代 */
function EntertainmentArea() {
  const [loading, setLoading] = useState<boolean>(true)
  const [iframeUrl, setIframeUrl] = useState<string>('')
  const [currentHeight, setCurrentHeight] = useState<number>(defaultHeight)

  const iframeWrapRef = useRef<any>(null)
  const iframeRef = useRef<any>(null)

  const size = useSize(iframeWrapRef)

  const handleListenerEvent = (event: MessageEvent) => {
    if (event?.data === CommandsEnum.jumpToLogin) {
      link('/login')
      return
    }

    if (event?.data === CommandsEnum.jumpToHome) {
      link('/')
    }
  }

  const getRecreationEntranceUrl = async () => {
    const url = await HandleRecreationEntrance()
    setIframeUrl(url)
  }

  useEffect(() => {
    const iframe = iframeRef.current

    iframe.addEventListener('load', () => setLoading(false))

    return () => {
      iframe.removeEventListener('load', () => {})
    }
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleListenerEvent)

    return () => {
      window.removeEventListener('message', handleListenerEvent)
    }
  }, [])

  useLayoutEffect(() => {
    getRecreationEntranceUrl()
  }, [])

  useLayoutEffect(() => {
    if (size?.height) {
      const newSizeHeight = size?.height || 0 - 24
      newSizeHeight > defaultHeight ? setCurrentHeight(defaultHeight) : setCurrentHeight(newSizeHeight - 48)
    }
  }, [size?.height])

  return (
    <section className={`entertainment-area ${styles.scoped}`}>
      <div className="entertainment-area-wrap" ref={iframeWrapRef}>
        <iframe
          title={t`features_recreation_index_oqhxipaffm`}
          src={iframeUrl}
          width={390}
          height={currentHeight}
          ref={iframeRef}
        />
      </div>

      <FullScreenLoading isShow={loading} />
    </section>
  )
}

export default EntertainmentArea
