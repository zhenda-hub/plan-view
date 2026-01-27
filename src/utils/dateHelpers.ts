import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import { TimeLevel } from '@/types/planning'

dayjs.extend(weekOfYear)
dayjs.extend(quarterOfYear)

/**
 * Get the start of a time period based on level
 */
export function getPeriodStart(date: Date, level: TimeLevel): Date {
  const d = dayjs(date)

  switch (level) {
    case TimeLevel.DECADE:
      return d.startOf('year').year(Math.floor(d.year() / 10) * 10).toDate()
    case TimeLevel.FIVE_YEAR:
      return d.startOf('year').year(Math.floor(d.year() / 5) * 5).toDate()
    case TimeLevel.THREE_YEAR:
      return d.startOf('year').year(Math.floor(d.year() / 3) * 3).toDate()
    case TimeLevel.YEAR:
      return d.startOf('year').toDate()
    case TimeLevel.QUARTERLY:
      return d.startOf('quarter').toDate()
    case TimeLevel.MONTHLY:
      return d.startOf('month').toDate()
    case TimeLevel.WEEKLY:
      return d.startOf('week').toDate()
    default:
      return d.startOf('day').toDate()
  }
}

/**
 * Get the end of a time period based on level
 */
export function getPeriodEnd(date: Date, level: TimeLevel): Date {
  const d = dayjs(date)

  switch (level) {
    case TimeLevel.DECADE:
      return d.endOf('year').year(Math.floor(d.year() / 10) * 10 + 9).toDate()
    case TimeLevel.FIVE_YEAR:
      return d.endOf('year').year(Math.floor(d.year() / 5) * 5 + 4).toDate()
    case TimeLevel.THREE_YEAR:
      return d.endOf('year').year(Math.floor(d.year() / 3) * 3 + 2).toDate()
    case TimeLevel.YEAR:
      return d.endOf('year').toDate()
    case TimeLevel.QUARTERLY:
      return d.endOf('quarter').toDate()
    case TimeLevel.MONTHLY:
      return d.endOf('month').toDate()
    case TimeLevel.WEEKLY:
      return d.endOf('week').toDate()
    default:
      return d.endOf('day').toDate()
  }
}

/**
 * Format date based on time level
 */
export function formatDateByLevel(date: Date, level: TimeLevel): string {
  const d = dayjs(date)

  switch (level) {
    case TimeLevel.DECADE:
    case TimeLevel.FIVE_YEAR:
    case TimeLevel.THREE_YEAR:
      return d.format('YYYY年')
    case TimeLevel.YEAR:
      return d.format('YYYY年MM月')
    case TimeLevel.QUARTERLY:
      return d.format('YYYY年[Q]Q季度')
    case TimeLevel.MONTHLY:
      return d.format('YYYY年MM月')
    case TimeLevel.WEEKLY:
      return d.format('YYYY年MM月 第w周')
    default:
      return d.format('YYYY-MM-DD')
  }
}
