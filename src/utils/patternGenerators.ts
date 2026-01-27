import dayjs from 'dayjs'
import { TimeLevel } from '@/types/planning'

/**
 * 生成季度视图数据 - 4个季度，每个季度显示3个月
 */
export function generateQuarterlyPattern(startDate: Date) {
  const quarters = []
  const start = dayjs(startDate).startOf('year')

  for (let q = 0; q < 4; q++) {
    const quarterStart = start.add(q * 3, 'month')
    const months = []

    // 每个季度包含3个月
    for (let m = 0; m < 3; m++) {
      const monthStart = quarterStart.add(m, 'month')
      months.push({
        label: monthStart.format('MM月'),
        value: monthStart.format('YYYY-MM'),
        start: monthStart.toDate(),
        end: monthStart.endOf('month').toDate()
      })
    }

    quarters.push({
      label: `第${q + 1}季度`,
      value: `Q${q + 1}`,
      months,
      start: quarterStart.toDate(),
      end: quarterStart.add(2, 'month').endOf('month').toDate()
    })
  }

  return quarters
}

/**
 * 生成月度视图数据 - 显示当月的所有天
 */
export function generateMonthlyPattern(startDate: Date) {
  const start = dayjs(startDate).startOf('month')
  const daysInMonth = start.daysInMonth()
  const days = []

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStart = start.date(d)
    days.push({
      label: `${d}日`,
      value: dayStart.format('YYYY-MM-DD'),
      start: dayStart.toDate(),
      end: dayStart.endOf('day').toDate(),
      dayOfWeek: dayStart.day() // 0-6, 周日到周六
    })
  }

  return {
    label: start.format('YYYY年MM月'),
    value: start.format('YYYY-MM'),
    days,
    start: start.toDate(),
    end: start.endOf('month').toDate()
  }
}

/**
 * 生成周视图数据 - 显示一周7天（周一到周日）
 */
export function generateWeeklyPattern(startDate: Date) {
  const start = dayjs(startDate).startOf('week').add(1, 'day') // 从周一开始
  const days = []

  for (let d = 0; d < 7; d++) {
    const dayStart = start.add(d, 'day')
    days.push({
      label: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][d],
      value: dayStart.format('YYYY-MM-DD'),
      start: dayStart.toDate(),
      end: dayStart.endOf('day').toDate()
    })
  }

  return {
    label: start.format('YYYY年MM月') + ' 第' + start.week() + '周',
    value: start.format('YYYY-[W]ww'),
    days,
    start: start.toDate(),
    end: start.add(6, 'day').endOf('day').toDate()
  }
}

/**
 * 根据时间层级获取模式数据
 */
export function getPatternData(level: TimeLevel, startDate: Date) {
  switch (level) {
    case TimeLevel.QUARTERLY:
      return generateQuarterlyPattern(startDate)
    case TimeLevel.MONTHLY:
      return generateMonthlyPattern(startDate)
    case TimeLevel.WEEKLY:
      return generateWeeklyPattern(startDate)
    default:
      return null
  }
}
