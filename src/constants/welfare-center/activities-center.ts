export enum ActivitiesType {
  // 进行中的活动
  Started = 'processing',
  // 已结束的活动
  Ended = 'ends',
}

export enum StatusCode {
  // 尚未开始
  not_started = 'not_started',
  // 即将开始
  coming_soon = 'coming_soon',
  // 进行中
  processing = 'processing',
  // 已结束
  ends = 'ends',
}
