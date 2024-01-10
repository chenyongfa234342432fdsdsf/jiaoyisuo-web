import styles from './index.module.css'
import SearchCoin from './coin-search'
import HideLess from './hide-less'
/** 币种搜索 & 隐藏零额资产 */
function SearchWrap({ onSearchChangeFn, onHideLessFn }: { onSearchChangeFn(val): void; onHideLessFn(val): void }) {
  return (
    <div className={styles.scoped}>
      <div className="mr-8">
        <SearchCoin onSearchChangeFn={onSearchChangeFn} />
      </div>
      <div className="flex items-center">
        <HideLess onHideLessFn={onHideLessFn} />
      </div>
    </div>
  )
}

export { SearchWrap }
