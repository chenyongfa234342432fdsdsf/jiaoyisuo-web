import { t } from '@lingui/macro'
import { Modal, Message } from '@nbit/arco'
import classNames from 'classnames'
import { useState, forwardRef, useImperativeHandle } from 'react'
import Icon from '@/components/icon'
import { getV1CouponCouponUsedDetailApiRequest } from '@/apis/welfare-center'
import {
  DiscountRule,
  CouponStatus,
  welfareCenterImgUrl,
  CouponTypeAccount,
  CouponType,
} from '@/constants/welfare-center'
import { YapiGetV1CouponListData } from '@/typings/yapi/CouponListV1GetApi'
import { formatDate } from '@/helper/date'
import { useUpdateEffect } from 'ahooks'
import ListEmpty from '@/components/list-empty'
import { useCopyToClipboard } from 'react-use'
import {
  getCardCouponLimitText,
  OpenVisibleInstructionModal,
  getActivityName,
} from '@/features/welfare-center/welfare-center'
import LazyImage, { Type } from '@/components/lazy-image'
import { YapiGetV1CouponCouponUsedDetailData } from '@/typings/yapi/CouponCouponUsedDetailV1GetApi'
import styles from './index.module.css'

type CouponTypeIconUrlNameObj = { [key: string]: object }

function CouponsUsingInstructionsModal(_, ref) {
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  /** 券的详情 */
  const [cardParamsDetail, setCardParamsDetail] = useState<YapiGetV1CouponListData>()

  /** 券的使用详情 */
  const [cardDetail, setCardDetail] = useState<YapiGetV1CouponCouponUsedDetailData>()

  const [state, copyToClipboard] = useCopyToClipboard()

  /** 获取卡片分类，卡劵名称，卡劵类型使用业务场景数据字典 */
  const [cardNameAndSceneListCode, setCardNamAndSceneListCode] = useState<OpenVisibleInstructionModal>()

  /** 获取不同卡券的 icon 名对应的对象 */
  const [couponTypeIconUrlNameObj, setCouponTypeIconUrlNameObj] = useState<CouponTypeIconUrlNameObj>()

  const setClosModal = () => {
    setModalVisible(false)
  }

  const onCancleModal = () => {
    setModalVisible(false)
  }

  const onCopy = val => {
    if (!val) {
      return
    }
    copyToClipboard(val)
    state.error ? Message.error(t`user.secret_key_02`) : Message.success(t`user.secret_key_01`)
  }

  useImperativeHandle(ref, () => ({
    openVisibleInstructionModal(
      props: YapiGetV1CouponListData,
      cardNameAndSceneList: OpenVisibleInstructionModal,
      couponTypeIconUrlName: CouponTypeIconUrlNameObj
    ) {
      setModalVisible(true)
      setCardParamsDetail({ ...props })
      setCardNamAndSceneListCode(cardNameAndSceneList)
      setCouponTypeIconUrlNameObj(couponTypeIconUrlName)
    },
  }))

  /** 获取券的使用的情况详情 */
  const getCardDetailRequestChange = async () => {
    const { isOk, data } = await getV1CouponCouponUsedDetailApiRequest({ id: String(cardParamsDetail?.id) })
    if (isOk) {
      setCardDetail(data)
    }
  }

  useUpdateEffect(() => {
    getCardDetailRequestChange()
  }, [cardParamsDetail])

  const getBusinessScene = () => {
    return cardNameAndSceneListCode?.cardSceneListCode?.find(item => item?.codeVal === cardDetail?.businessScene)
      ?.codeKey
  }

  /** 判断券类型是否是体验金，如果是的话则展示 buy_up_color */
  const getMoneyColor = () => {
    return cardDetail?.couponType === CouponType.voucher ? 'text-buy_up_color' : 'text-sell_down_color'
  }

  /** 不同的券所展示标题文字的集合 */
  const getFeeTitleChange = cardDetails => {
    return {
      [CouponType.voucher]: {
        firstTitle: t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_ywppda2jrf`,
        secondTitle: t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_56ppk9heaa`,
        threeTitle: t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_6osw_vukjz`,
        headerTitle: t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_xh0owyzv99`,
      },
      [CouponType.fee]: {
        firstTitle: t`order.columns.logFee`,
        secondTitle: t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_kb8mhd4vi7`,
        threeTitle: t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_7sdloypta3`,
        headerTitle: t({
          id: 'features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_0eswpvwsnf',
          values: { 0: getBusinessScene() },
        }),
      },
      [CouponType.insurance]: {
        firstTitle: t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index__eg9d1gkwt`,
        secondTitle: t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_kb8mhd4vi7`,
        threeTitle: t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_6osw_vukjz`,
        headerTitle: t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_rtc41qdiey`,
      },
    }[cardDetails?.couponType]
  }

  return (
    <div className={classNames(styles.scoped)}>
      <Modal visible={modalVisible} closable={false} footer={null} className={styles.scoped}>
        <div className="modal-header">
          <div className="flex">
            <span className="text-xl text-text_color_01 font-medium">{t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_tcosnuknys`}</span>
          </div>
          <div className="modal-header-icon">
            <Icon name="close" hasTheme onClick={setClosModal} />
          </div>
        </div>
        <div className="py-2 px-3 rounded bg-bg_sr_color text-text_color_02 text-sm flex justify-between mb-4">
          <span>
            {t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_pdcxxuebyy`}
            {cardDetail?.orderId}
          </span>
          <Icon name="copy" hasTheme className="text-base" onClick={() => onCopy(cardDetail?.orderId)} />
        </div>
        <div className="card-coupon-item-container">
          {/* 是否展示已使用图标 */}
          {cardDetail?.status === CouponStatus?.used && (
            <div className="card-coupon-item-right-top-image">
              <div className="card-coupon-item-left-text">{t`features_welfare_center_card_coupon_center_all_card_coupon_index_p8zvowtew6`}</div>
              <LazyImage src={`${welfareCenterImgUrl}/image_wellcenter_used_green_surround`} imageType={Type.png} />
            </div>
          )}
          <div className="card-coupon-item-left-image">
            <LazyImage src={`${welfareCenterImgUrl}/available_welfare_edge`} imageType={Type.png} />
          </div>

          <div className="card-coupon-item">
            <div className="card-coupon-item-left">
              <div className="card-coupon-item-icon">
                <Icon name={couponTypeIconUrlNameObj?.airdrop_coins_coupon?.[1]} />
              </div>
              <div className="card-coupon-item-left-detail">
                <div className="card-coupon-num">
                  {cardDetail?.useDiscountRule === DiscountRule.direct
                    ? `${cardDetail?.couponValue} ${cardDetail?.couponSymbol}`
                    : t({
                        id: 'features_welfare_center_card_coupon_center_card_redemption_center_index_x3cr0hiz8q',
                        values: { 0: cardDetail?.useDiscountRuleRate },
                      })}
                </div>
                {cardDetail?.useThreshold && (
                  <div className="card-coupon-condition">
                    {getCardCouponLimitText(cardDetail?.couponCode)}
                    {t`features_welfare_center_card_coupon_center_card_redemption_center_index__a4tsch0po`}
                    {cardDetail?.useThreshold} {cardDetail?.couponSymbol}
                  </div>
                )}
                <div className="card-coupon-money">
                  {
                    cardNameAndSceneListCode?.cardNameListCode?.find(item => item?.codeVal === cardDetail?.couponCode)
                      ?.codeKey
                  }
                  {/* {t`features_welfare_center_card_coupon_center_all_card_coupon_index_uvc1ndmrwx`} */}
                  {/* {OverlayVipStatus.enable === item?.useOverlayVipStatus && (
                          <span>{t`features_welfare_center_card_coupon_center_all_card_coupon_index_dlsnll9d9_`}</span>
                        )} */}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 w-full">
            <div className="card-coupon-item-bottom">
              {cardDetail?.status !== CouponStatus.used ? (
                <div>
                  {t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_b_usgsxmfn`}
                  {cardDetail?.invalidByTime && formatDate(Number(cardDetail?.invalidByTime))}
                </div>
              ) : (
                <div>
                  {t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_w0edgeofox`}
                  {cardDetail?.usedByTime && formatDate(Number(cardDetail?.usedByTime))}
                </div>
              )}

              <div className="card-coupon-item-bottom-right">
                {getActivityName({ name: cardDetail?.activityName, type: cardDetail?.welfareType })}
              </div>
            </div>
          </div>
        </div>

        {/* <div className="px-3 py-2.5 bg-brand_color_light_bg rounded flex justify-between mb-4">
          <span className="text-text_color_01 text-xs">{getFeeTitleChange(cardDetail)?.headerTitle}</span>
          <span className={classNames('text-xs', getMoneyColor())}>
            {cardDetail?.useDiscountRule === DiscountRule.rate
              ? t({
                  id: 'features_vip_vip_tier_vip_tier_table_tier_table_schema_nf8y2qgofq',
                  values: { 0: cardDetail?.valueSecond },
                })
              : `${formatCurrency(cardDetail?.valueSecond, 2)} USD`}
          </span>
        </div> */}

        <div className="coupon-trade-detail">
          <div className="coupon-trade-detail-item">
            <div className="coupon-trade-detail-label">{t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_qptxhqohni`}</div>
            <div className="flex">
              <span className="text-text_color_01">
                {
                  cardNameAndSceneListCode?.cardSceneListCode?.find(item => item?.codeVal === cardDetail?.businessScene)
                    ?.codeKey
                }
              </span>
              <div className="rounded-sm text-xs text-brand_color bg-brand_color_special_02 p-0.5 ml-1">
                {
                  cardNameAndSceneListCode?.businessLineListCode?.find(
                    item => item?.codeVal === cardDetail?.businessLine
                  )?.codeKey
                }
              </div>
            </div>
          </div>
          <div className="coupon-trade-detail-item">
            <div className="coupon-trade-detail-label">{t`features_c2c_center_coin_switch_index_3rawstucyu0jlw1lxln_i`}</div>
            <div className="text-text_color_01">
              {cardDetail?.accountName === CouponTypeAccount.ASSET
                ? t`features_c2c_center_coin_switch_index_msuc6zmu2dxzocr_5wzmr`
                : cardDetail?.accountName}
            </div>
          </div>
          <div className="coupon-trade-detail-item">
            <div className="coupon-trade-detail-label">{t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_snr37ptkzm`}</div>
            <div className="text-text_color_01">
              {cardDetail?.usedByTime && formatDate(Number(cardDetail?.usedByTime))}
            </div>
          </div>
          <div className="coupon-trade-detail-item">
            <div className="coupon-trade-detail-label">{t`features_c2c_advertise_post_advertise_index_4yidfqk_wu8ypinnwmsd7`}</div>
            <div className="text-text_color_01">
              {
                cardNameAndSceneListCode?.businessTypeCode?.find(item => item?.codeVal === cardDetail?.businessType)
                  ?.codeKey
              }
            </div>
          </div>
        </div>
        {cardDetail?.valueFirst ? (
          <div className="mt-4">
            <div className="coupon-trade-container">
              <div className="coupon-trade-item text-text_color_02">{getFeeTitleChange(cardDetail)?.firstTitle}</div>
              <div className="coupon-trade-item text-text_color_02">{getFeeTitleChange(cardDetail)?.secondTitle}</div>
              <div className="coupon-trade-item text-text_color_02">{getFeeTitleChange(cardDetail)?.threeTitle}</div>
            </div>

            <div className="coupon-trade-container mt-4">
              <div className="coupon-trade-item text-text_color_01">
                {cardDetail?.valueFirst} {cardDetail?.valueSymbol}
              </div>
              <div className={classNames('coupon-trade-item', getMoneyColor())}>
                {cardDetail?.useDiscountRule === DiscountRule.rate
                  ? t({
                      id: 'features_welfare_center_card_coupon_center_card_redemption_center_index_x3cr0hiz8q',
                      values: { 0: cardDetail?.valueSecond },
                    })
                  : `${cardDetail?.valueSecond} ${cardDetail?.valueSymbol}`}
              </div>
              <div className="coupon-trade-item text-text_color_01">
                {cardDetail?.valueThird} {cardDetail?.valueSymbol}
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 flex justify-center w-full">
            <ListEmpty
              text={t`features_welfare_center_card_coupon_center_coupons_using_instructions_modal_index_rshkfu_z0s`}
              className={styles.wrapper}
            />
          </div>
        )}

        <div className="modal-footer">
          <div className="modal-footer-cancel" onClick={onCancleModal}>
            {t`user.field.reuse_09`}
          </div>
          <div className="modal-footer-primary" onClick={onCancleModal}>
            {t`assets.common.saveComfirm`}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default forwardRef(CouponsUsingInstructionsModal)
