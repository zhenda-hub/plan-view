import { TimeLevel, TimePattern } from '@/types/planning'

export const TIME_LEVELS: TimeLevel[] = [
  TimeLevel.DECADE,
  TimeLevel.FIVE_YEAR,
  TimeLevel.THREE_YEAR,
  TimeLevel.YEAR,
  TimeLevel.QUARTERLY,
  TimeLevel.MONTHLY,
  TimeLevel.WEEKLY
]

export const TIME_PATTERNS: Record<TimeLevel, TimePattern> = {
  [TimeLevel.DECADE]: {
    level: TimeLevel.DECADE,
    units: 10,
    label: '10年',
    duration: 120 // 10 years in months
  },
  [TimeLevel.FIVE_YEAR]: {
    level: TimeLevel.FIVE_YEAR,
    units: 5,
    label: '5年',
    duration: 60
  },
  [TimeLevel.THREE_YEAR]: {
    level: TimeLevel.THREE_YEAR,
    units: 3,
    label: '3年',
    duration: 36
  },
  [TimeLevel.YEAR]: {
    level: TimeLevel.YEAR,
    units: 12,
    label: '1年',
    duration: 12
  },
  [TimeLevel.QUARTERLY]: {
    level: TimeLevel.QUARTERLY,
    units: 4,  // 4 quarters
    label: '季度',
    duration: 3
  },
  [TimeLevel.MONTHLY]: {
    level: TimeLevel.MONTHLY,
    units: 1,
    label: '月度',
    duration: 1
  },
  [TimeLevel.WEEKLY]: {
    level: TimeLevel.WEEKLY,
    units: 1,
    label: '周',
    duration: 0.25 // 1 week = 0.25 months
  }
}

export const LEVEL_LABELS: Record<TimeLevel, string> = {
  [TimeLevel.DECADE]: '10年视图',
  [TimeLevel.FIVE_YEAR]: '5年规划',
  [TimeLevel.THREE_YEAR]: '3年里程碑',
  [TimeLevel.YEAR]: '年度计划',
  [TimeLevel.QUARTERLY]: '季度计划',
  [TimeLevel.MONTHLY]: '月度计划',
  [TimeLevel.WEEKLY]: '周计划'
}
