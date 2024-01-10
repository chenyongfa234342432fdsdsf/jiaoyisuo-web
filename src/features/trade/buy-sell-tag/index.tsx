import classNames from 'classnames'

function BuySellTag(props) {
  const { isModeBuy } = props
  return (
    <span
      className={classNames({
        'py-0.5 px-1 inline-flex items-center justify-center rounded-sm text-xs': true,
        'text-buy_up_color bg-buy_up_color_special_02': isModeBuy,
        'text-sell_down_color bg-sell_down_color_special_02': !isModeBuy,
      })}
    >
      {props.children}
    </span>
  )
}

export default BuySellTag
