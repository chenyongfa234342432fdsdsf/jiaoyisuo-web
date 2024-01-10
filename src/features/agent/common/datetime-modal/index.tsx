import { Button, DatePicker, Modal } from '@nbit/arco'
import { useState } from 'react'
import { t } from '@lingui/macro'
import { formatDatePickerData } from '@/helper/agent'
import dayjs from 'dayjs'
import { HandleDisableEndDate } from '@/features/user/utils/common'
import styles from './index.module.css'

export default function DatetimeModal({ onsubmit, visible, setvisible }) {
  const setDisableDate = (currentDate: dayjs.Dayjs) => {
    const endTime = dayjs().endOf('date').valueOf()
    return HandleDisableEndDate(currentDate, endTime)
  }

  const [datetime, setdatetime] = useState<ReturnType<typeof formatDatePickerData>>()

  return (
    <Modal
      className={styles['datetime-modal']}
      visible={visible}
      onCancel={() => setvisible(false)}
      title={t`features_agent_common_datetime_modal_index_ta6yf24nli`}
      okButtonProps={{
        value: t`components_chart_header_data_2622`,
      }}
      footer={
        <>
          <Button onClick={() => setvisible(false)}>{t`trade.c2c.cancel`}</Button>
          <Button onClick={() => onsubmit(datetime)} type="primary">
            {t`user.field.reuse_10`}
          </Button>
        </>
      }
    >
      <DatePicker.RangePicker
        popupVisible
        className={'ta-date-picker'}
        // value={formatToDatePicker(chartFilterSetting)}
        onChange={v => {
          setdatetime(formatDatePickerData(v))
        }}
        style={{ minWidth: 210, height: 30 }}
        separator={t`features/assets/saving/history-list/index-0`}
        disabledDate={setDisableDate}
      />
    </Modal>
  )
}
