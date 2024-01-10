import { t } from '@lingui/macro'
import { Button } from '@nbit/arco'
import WithdrawAction from '@/features/assets/common/withdraw-action'
import { link } from '@/helper/link'
import { TransferButton } from '@/features/assets/common/transfer/common/transfer-button'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { getModuleStatusByKey } from '@/helper/module-config'
import { ModuleEnum } from '@/constants/module-config'

interface AssetsHeaderRightProps {
  coinId?: string
  isTransfer?: boolean
}

function AssetsHeaderRight(props: AssetsHeaderRightProps) {
  const { coinId, isTransfer = true } = props
  const isMergeMode = getMergeModeStatus()
  const isShowC2C = getModuleStatusByKey(ModuleEnum.c2c)

  if (isMergeMode) return null
  return (
    <>
      {isTransfer && isShowC2C && <TransferButton />}
      <WithdrawAction coinId={coinId || ''} />
      <Button
        type="primary"
        onClick={() => {
          let depositUrl = '/assets/main/deposit'
          if (coinId) depositUrl += `?id=${coinId}`

          link(depositUrl)
        }}
      >
        {t`assets.common.deposit`}
      </Button>
    </>
  )
}

export { AssetsHeaderRight }
