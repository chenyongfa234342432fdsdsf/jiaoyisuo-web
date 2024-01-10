/**
 * 时间判断方法
 * @param {string} startDate 开始时间
 * @param {string} endDate 结束时间
 * @return {boolean}
 */
export const isDateIntervalValid = (startDate, endDate) => {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const monthDiff = Number(Math.abs(start - end) / 1000 / 60 / 60 / 24)
  return !(monthDiff > 366)
}
