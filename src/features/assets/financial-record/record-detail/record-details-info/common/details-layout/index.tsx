import { ReactNode } from 'react'

export interface IListEnum {
  label: string
  content: ReactNode | string
}

interface IRecordDetailsLayout {
  list: IListEnum[]
}
/**
 * 详情 layout 渲染组件
 * @param prop
 * @returns
 */
export function RecordDetailsLayout(prop: IRecordDetailsLayout) {
  const { list } = prop
  const onRenderItem = data => {
    return (
      <>
        {data.map((item, index) => {
          return (
            <div className="details-item-info" key={index}>
              <span className="label">{item.label}</span>
              <span className="value">{item.content}</span>
            </div>
          )
        })}
      </>
    )
  }

  return onRenderItem(list)
}
