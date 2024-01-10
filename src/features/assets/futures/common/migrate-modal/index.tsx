/**
 * 合约 - 仓位迁移弹窗组件
 */
import { t } from '@lingui/macro'
import { useState, useRef, useEffect } from 'react'
import { useUpdateEffect, useLockFn, useDebounce } from 'ahooks'
import { Button, Message, Form, Input } from '@nbit/arco'
import AssetsPopUp from '@/features/assets/common/assets-popup'
import { getAmountByPercent, getPercentByAmount, getBuySellColor, getTradePairDetail } from '@/helper/assets/futures'
import AssetsPopupTips from '@/features/assets/common/assets-popup/assets-popup-tips'
import AssetsInputNumber from '@/features/assets/common/assets-input-number'
import {
  TransferInputTypeEnum,
  FuturePositionDirectionEnum,
  getFuturePositionDirectionEnumName,
} from '@/constants/assets/futures'
import styles from '@/features/assets/common/assets-popup/asset-popup-form/index.module.css'
import {
  postV1PerpetualPositionMigrateSizeApiRequest,
  postV1PerpetualPositionMigrateMarginApiRequest,
  postV1PerpetualPositionMigrateApiRequest,
  postV1PerpetualPositionCheckMinSizeApiRequest,
  postV1PerpetualPositionCheckMergeApiRequest,
  postV1PerpetualPositionCheckMigrateMarginApiRequest,
} from '@/apis/assets/futures/position'
import { IPositionListData, ITradePairDetailData } from '@/typings/api/assets/futures/position'
import FutureGroupModal from '@/features/future/future-group-modal'
import { getTradePairDetailApi } from '@/apis/assets/futures/common'
import { rateFilter } from '@/helper/assets'
import { CurrencySymbolEnum } from '@/constants/assets'
import { formatCurrency, formatNonExponential, formatNumberDecimal } from '@/helper/decimal'
import { useAssetsFuturesStore } from '@/store/assets/futures'
import classNames from 'classnames'
import Icon from '@/components/icon'
import { YapiGetV1PerpetualGroupListData } from '@/typings/yapi/PerpetualGroupListV1GetApi'
import { getMergeModeStatus } from '@/features/user/utils/common'
import { useFutureQuoteDisplayDigit } from '@/hooks/features/assets'
import SliderBar from '../slider'
import { PositionModalHeader } from '../position-modal-header'

interface MigrateModalProps {
  visible: boolean
  setVisible: (val: boolean) => void
  /** 仓位信息 */
  positionData: IPositionListData
  onSuccess?: (val?: any) => void
}

export function MigrateModal(props: MigrateModalProps) {
  const { visible, setVisible, positionData, onSuccess } = props || {}
  /** 仓位基本信息 */
  const {
    groupId = '',
    groupName = '',
    symbol = '',
    sideInd,
    lever,
    tradeId,
    positionId = '',
    size = 0,
    voucherAmount,
  } = positionData || {}
  /** 显示风险提示 - 当合约组风险率 > 安全系数 (0.95) 时，告知用户确认风险 */
  const [visibleRiskConfirm, setVisibleRiskConfirm] = useState(false)
  /** 当前迁移的组内是否存在同方向同倍数合约 */
  const [visibleMultiPositionConfirm, setVisibleMultiPositionConfirm] = useState(false)
  /** 仓位占比 */
  const [positionPercent, setPositionPercent] = useState(0)
  /** 保证金占比 */
  const [bailPercent, setBailPercent] = useState(0)
  /** 迁移按钮状态 */
  const [buttonDisable, setButtonDisable] = useState(true)
  const [loading, setLoading] = useState<boolean>(false)
  const isMergeMode = getMergeModeStatus()
  const FormItem = Form.Item
  const [form] = Form.useForm()

  const assetsFuturesStore = useAssetsFuturesStore()
  /** 商户设置的计价币的法币精度和法币符号，USD 或 CNY 等 */
  const {
    futuresCurrencySettings: { currencySymbol },
  } = { ...assetsFuturesStore }
  const offset = useFutureQuoteDisplayDigit()

  /** 合约币对详情 */
  const [tradePairDetailData, setTradePairDetailData] = useState<ITradePairDetailData | undefined>()
  const {
    /** 数量精度位 */
    amountOffset = 0,
    priceOffset = 0,
    /** 计价币名 */
    quoteSymbolName = '',
    /** 标的币名 */
    baseSymbolName = '',
  } = tradePairDetailData || {}
  /** 可迁移仓位数量 */
  const [availablePositionAmount, setAvailablePositionAmount] = useState(0)
  /** 可迁移保证金 */
  const [availableMargin, setAvailableMargin] = useState({ min: '0', max: '0' })

  /** 选择合约组 */
  const selectGroupRef = useRef<Record<'openContractGroup', () => void>>()
  const setSelectGroup = () => {
    selectGroupRef.current?.openContractGroup()
  }
  /** 选择的合约组 */
  const [selectedContractGroup, setSelectedContractGroup] = useState<
    YapiGetV1PerpetualGroupListData | { type: string }
  >()

  /** 仓位迁移--获取能迁移的保证金 */
  const getPositionMargin = async (amount?) => {
    const migrateCount = amount || form.getFieldValue('positionAmount')
    if (!migrateCount) {
      setAvailableMargin({ max: '0', min: '0' })
      return
    }
    const params = {
      positionId,
      fromGroupId: groupId,
      size: formatNonExponential(migrateCount),
    }
    const res = await postV1PerpetualPositionMigrateMarginApiRequest(params)
    const results = res.data
    if (res.isOk && results) {
      results && setAvailableMargin(results)
    }
  }

  /** 拖动 slide 计算数量 */
  const onSliderChange = async (_percent, maxVal, precision, key) => {
    const amount = getAmountByPercent(_percent, maxVal, precision)
    form.setFieldValue(key, amount)
    if (key === TransferInputTypeEnum.positionAmount) {
      setPositionPercent(_percent)
      // getPositionMargin(amount)
    } else {
      setBailPercent(_percent)
      form.setFieldValue('bail', amount)
    }
    // key === TransferInputTypeEnum.positionAmount ? setPositionPercent(_percent) : setBailPercent(_percent)

    const margin = Number(form.getFieldValue('bail'))
    amount && margin ? setButtonDisable(false) : setButtonDisable(true)
  }

  /** 输入数值，计算百分比 */
  const onInputChange = async (val, maxVal, key) => {
    const _percent = getPercentByAmount(val, maxVal)
    if (_percent >= 0) {
      /** 输入仓位数量 */
      if (key === TransferInputTypeEnum.positionAmount) {
        setPositionPercent(_percent)
        // await getPositionMargin()
        return
      }
      setBailPercent(_percent)
    }
  }

  /** 监听表单内容改变，校验通过时按钮亮起 */
  const onFormChange = async () => {
    try {
      await form.validate()
      setButtonDisable(false)
    } catch (e) {
      setButtonDisable(true)
    }
  }

  /** 仓位迁移 */
  const submitPositionMigrate = useLockFn(async (toGroupId?) => {
    setLoading(true)
    toGroupId = toGroupId || (selectedContractGroup as YapiGetV1PerpetualGroupListData)?.groupId
    try {
      const migrateCount = form.getFieldValue('positionAmount')
      const margin = form.getFieldValue('bail') || 0
      const params = {
        /**
         * 迁移的仓位 id
         */
        positionId,
        /**
         * 迁移的合约组
         */
        fromGroupId: groupId,
        /**
         * 目标合约组
         */
        toGroupId,
        /**
         * 迁移数量
         */
        size: formatNonExponential(migrateCount),
        /**
         * 迁移的保证金
         */
        margin: String(margin),
      }
      !toGroupId && delete params.toGroupId

      /** 仓位迁移提交 */
      const res = await postV1PerpetualPositionMigrateApiRequest(params)
      const { isOk, data } = res || {}

      if (!isOk) {
        setLoading(false)
        return false
      }

      if (data && !data.isSuccess) {
        Message.error(t`features_assets_futures_common_migrate_modal_index_5101511`)
        setLoading(false)
        setVisible(false)
        return false
      }

      form.clearFields()
      Message.success(t`features_orders_future_holding_migrate_716`)
      setLoading(false)
      setVisible(false)
      onSuccess && onSuccess()
      return true
    } catch (error) {
      Message.error(t`features_assets_main_assets_detail_trade_pair_index_2562`)
      setLoading(false)
      setVisible(false)
    }
  })

  /** 检测当前合约是否小于最小持仓量 - 被迁移合约仓位的剩余数量是否小于最小持仓数 */
  const checkPositionMinQuantity = async () => {
    const migrateCount = form.getFieldValue('positionAmount')

    if (Number(voucherAmount) > 0 && +migrateCount < +size) {
      Message.error(t`features_assets_futures_common_migrate_modal_index_mnkh6lo27f`)
      return
    }

    const params = {
      positionId,
      fromGroupId: groupId,
      size: formatNonExponential(migrateCount),
    }
    const res = await postV1PerpetualPositionCheckMinSizeApiRequest(params)
    if (!res.isOk) {
      return false
    }
    if (!res.data?.pass) {
      Message.error(t`features_assets_futures_common_transfer_modal_index_5101508`)
      return false
    }
    return true
  }

  /** 检测保证金是否充足 */
  const checkPositionMigrateMargin = async () => {
    const migrateCount = form.getFieldValue('positionAmount')
    const margin = form.getFieldValue('bail') || 0
    const params = {
      positionId,
      fromGroupId: groupId,
      /**
       * 迁移数量
       */
      size: formatNonExponential(migrateCount),
      /**
       * 迁移的保证金
       */
      margin: String(margin),
    }
    const res = await postV1PerpetualPositionCheckMigrateMarginApiRequest(params)
    if (!res.isOk) {
      return false
    }
    if (!res.data?.pass) {
      setVisibleMultiPositionConfirm(true)
      return false
    }
    return true
  }

  /** 检查是否有可合并的仓位 - 当前迁移的组内是否存在同方向同倍数合约 */
  const checkIsCanMerge = async toGroupId => {
    const params = {
      positionId,
      fromGroupId: groupId,
      /**
       * 目标合约组
       */
      toGroupId,
    }
    const res = await postV1PerpetualPositionCheckMergeApiRequest(params)
    if (!res.isOk) {
      return false
    }

    if (res.data?.lock) {
      Message.info(t`features_trade_futures_trade_form_index_sj9mln8ybc9op0vlabd1k`)
      return false
    }

    if (res.data?.exist) {
      setVisibleMultiPositionConfirm(true)
    }

    return true
  }

  /** 选择合约组回调方法  t`constants/order-5`  */
  const onSetSelectContractGroup = async data => {
    if (data?.type === 'new') {
      data = {
        ...data,
        groupId: '',
        groupName: isMergeMode ? t`constants/order-5` : t`features_orders_order_columns_future_ytrsqaunpz`,
      }
    }
    const selectGroupId = data?.groupId || ''
    /** 检查是否有可合并的仓位 - 当前迁移的组内是否存在同方向同倍数合约 */
    if (selectGroupId && !(await checkIsCanMerge(data.groupId))) {
      return false
    }

    setSelectedContractGroup(data)
    form.setFieldValue('groupName', data.groupName)
  }

  /** 提交方法 */
  const onFormSubmit = useLockFn(async () => {
    setLoading(true)
    // 当前合约小于最小持仓量
    if (!(await checkPositionMinQuantity())) {
      setLoading(false)
      return false
    }

    const toGroupId = (selectedContractGroup as YapiGetV1PerpetualGroupListData)?.groupId
    try {
      // 检测保证金是否充足
      if (!(await checkPositionMigrateMargin())) return false

      /** 检查是否有可合并的仓位 - 当前迁移的组内是否存在同方向同倍数合约 */
      // if (!(await checkIsCanMerge(toGroupId))) return false

      // 提交迁移
      await submitPositionMigrate(toGroupId)
      return true
    } catch (error) {
      Message.error(t`features_assets_main_assets_detail_trade_pair_index_2562`)
    }
    setLoading(false)
    return true
  })

  const initData = async () => {
    try {
      const params = {
        positionId,
        fromGroupId: groupId,
      }
      /** 获取币对详情，可迁移仓位数量 */
      const [tradePairDetailRes, migrateQuantityRes] = await Promise.all([
        getTradePairDetailApi({ symbol }),
        postV1PerpetualPositionMigrateSizeApiRequest(params),
      ])

      if (tradePairDetailRes.isOk) {
        setTradePairDetailData(tradePairDetailRes.data)
      }
      if (migrateQuantityRes.isOk) {
        setAvailablePositionAmount(Number(migrateQuantityRes.data?.quantity) || 0)
      }
    } catch (error) {
      Message.error(t`features_assets_main_assets_detail_trade_pair_index_2562`)
    }
  }

  useEffect(() => {
    initData()
  }, [symbol])

  const positionPercentDebounce = useDebounce(positionPercent, {
    wait: 300,
  })

  /** 根据输入的仓位数，获取可迁移保证金 */
  useUpdateEffect(() => {
    getPositionMargin()
  }, [positionPercentDebounce])

  return (
    <AssetsPopUp
      isResetCss
      visible={visible}
      title={null}
      footer={null}
      onCancel={() => {
        setVisible(false)
      }}
    >
      <PositionModalHeader title={t`constants/assets/common-9`} positionData={positionData} />
      <Form form={form} className={classNames(styles['asset-popup-form'], 'px-8 mt-6')} onValuesChange={onFormChange}>
        {/* 迁移至 */}
        <div className="form-item">
          <div className="form-labels">
            <span>{t`features_assets_futures_common_migrate_modal_index_qn_ftiifby`}</span>
          </div>
          <div
            className="form-input"
            onClick={() => {
              // 选择合约组
              setSelectGroup()
            }}
          >
            <FormItem
              field="groupName"
              rules={[
                {
                  required: true,
                  validator: (value, cb) => {
                    if (!value) {
                      return cb(t`features_assets_futures_common_migrate_modal_index_ddhmf0fiit`)
                    }
                    return cb()
                  },
                },
              ]}
              requiredSymbol={false}
            >
              <Input
                className="assets-input form-amount cursor-pointer"
                readOnly
                placeholder={t`features_assets_futures_common_migrate_modal_index_ddhmf0fiit`}
                suffix={<Icon name="next_arrow" hasTheme />}
              />
            </FormItem>
            {visibleMultiPositionConfirm && (
              <div className="form-item-desc">
                {t`features_assets_futures_common_migrate_modal_index_2gzlhxrhjn`}{' '}
                <span
                  className={
                    sideInd === FuturePositionDirectionEnum.openBuy ? 'text-buy_up_color' : 'text-sell_down_color'
                  }
                >
                  {symbol}
                  <span className="ml-1">{getFuturePositionDirectionEnumName(sideInd)}</span> {lever}X
                </span>
                <span className="ml-1">{t`features_assets_futures_common_migrate_modal_index_7_kltry_yu`}</span>
              </div>
            )}
          </div>
        </div>
        {/* 仓位数量 */}
        <div className="form-item">
          <div className="form-labels">
            <span>{t`features_orders_future_holding_migrate_717`}</span>
            <span>
              {t({
                id: 'features_assets_futures_common_migrate_modal_index_5101343',
                values: { 0: formatCurrency(availablePositionAmount, amountOffset, false), 1: baseSymbolName },
              })}
            </span>
          </div>
          <div className="form-input">
            <FormItem
              field="positionAmount"
              rules={[
                {
                  required: true,
                  validator: (value, cb) => {
                    if (!value) {
                      return cb(t`features_assets_futures_common_migrate_modal_index_5101341`)
                    } else if (value > availablePositionAmount) {
                      return cb(t`features_assets_futures_common_transfer_modal_index_5101507`)
                    }
                    return cb()
                  },
                },
              ]}
              requiredSymbol={false}
            >
              <AssetsInputNumber
                className="assets-input form-amount"
                placeholder={t`features_assets_futures_common_migrate_modal_index_5101341`}
                suffix={<div className="text-text_color_01">{baseSymbolName}</div>}
                precision={tradePairDetailData?.amountOffset}
                onChange={(val: number) => {
                  onInputChange(val, availablePositionAmount, TransferInputTypeEnum.positionAmount)
                }}
              />
            </FormItem>
            <div className="form-item-desc">
              {form.getFieldValue('positionAmount')
                ? `≈ ${rateFilter({
                    symbol: baseSymbolName,
                    amount: form.getFieldValue('positionAmount'),
                    unit: CurrencySymbolEnum.code,
                    rate: quoteSymbolName,
                  })}`
                : ''}
            </div>
          </div>
        </div>
        {/* 仓位数量比例 */}
        <div>
          <div className="form-item">
            <div className="form-labels">{t`features_orders_future_holding_migrate_719`}</div>
            <div className="form-slider">
              <SliderBar
                value={positionPercent}
                onChange={val => {
                  onSliderChange(val, availablePositionAmount, amountOffset, TransferInputTypeEnum.positionAmount)
                }}
                marks={{
                  0: '0',
                  25: '25',
                  50: '50',
                  75: '75',
                  100: '100',
                }}
              />
            </div>
          </div>
        </div>
        {/* 可用保证金 */}
        <div className="form-item">
          <div className="form-labels">
            <span>{t`features_assets_futures_common_migrate_modal_index_5101344`}</span>
            <span>
              {t({
                id: 'features_assets_futures_common_migrate_modal_index_5101343',
                values: { 0: formatNumberDecimal(availableMargin?.max, offset), 1: currencySymbol },
              })}
            </span>
          </div>

          <div className="form-input">
            <FormItem
              field="bail"
              rules={[
                {
                  required: true,
                  validator: (value, cb) => {
                    if (Number(value) < 0) {
                      return cb(t`features_assets_futures_common_migrate_modal_index_5101342`)
                    }
                    if (value > Number(availableMargin.max)) {
                      return cb(t`features_assets_futures_common_migrate_modal_index_5101512`)
                    }
                    if (value < Number(availableMargin.min)) {
                      return cb(t`features_assets_futures_common_migrate_modal_index_5101513`)
                    }
                    return cb()
                  },
                },
              ]}
              requiredSymbol={false}
            >
              <AssetsInputNumber
                className="assets-input form-amount"
                placeholder={t`features_assets_futures_common_migrate_modal_index_5101342`}
                suffix={
                  <div className="amount-opt">
                    <div className="coin-name">{currencySymbol}</div>
                  </div>
                }
                precision={offset}
                onChange={(val: number) => {
                  onInputChange(val, availableMargin?.max, TransferInputTypeEnum.bail)
                }}
              />
            </FormItem>
          </div>
        </div>
        {/* 可用保证金比例 */}
        <div className="form-item">
          <div className="form-labels">{t`features_assets_futures_common_migrate_modal_index_5101345`}</div>
          <div className="form-slider">
            <SliderBar
              value={bailPercent}
              onChange={val => {
                onSliderChange(val, availableMargin?.max, offset, TransferInputTypeEnum.bail)
              }}
              marks={{
                0: '0',
                25: '25',
                50: '50',
                75: '75',
                100: '100',
              }}
            />
          </div>
        </div>
        <div className="footer">
          <Button
            type="secondary"
            onClick={() => {
              setVisible(false)
            }}
          >
            {t`trade.c2c.cancel`}
          </Button>
          <Button type="primary" disabled={buttonDisable} onClick={onFormSubmit} loading={loading}>
            {t`constants/assets/common-9`}
          </Button>
        </div>
      </Form>
      <FutureGroupModal
        showCreateNewGroup
        setSelectContractGroup={onSetSelectContractGroup}
        setCreateNewGroupDetail={onSetSelectContractGroup}
        selectedfutureGroup={
          (selectedContractGroup as { type: string })?.type === 'new' ? { type: 'new' } : selectedContractGroup
        }
        ref={selectGroupRef}
        excludeContractGroupId={groupId}
      />
      {/* 触发风险提示 - 当合约组风险率 > 安全系数 (0.95) 时，告知用户确认风险 */}
      <AssetsPopupTips
        visible={visibleRiskConfirm}
        setVisible={setVisibleRiskConfirm}
        okText={t`features_trade_spot_index_2510`}
        onCancel={() => {
          setVisibleRiskConfirm(false)
        }}
        onOk={() => {
          setVisibleRiskConfirm(false)
        }}
        slotContent={<div>{t`features_orders_future_holding_migrate_712`}</div>}
      />
    </AssetsPopUp>
  )
}
