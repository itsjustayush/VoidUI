export interface DateTimeInfo {
  date: Date
  hours24: number
  hours12: number
  hours: number
  minutes: number
  seconds: number
  ampm: 'AM' | 'PM'
  day: number
  dayPadded: string
  monthNumber: number
  monthShort: string
  monthFull: string
  year: number
  weekDayShort: string
  weekDayFull: string
  greeting: string
}

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function getDateTimeInfo(d = new Date(), is24Hours = true): DateTimeInfo {
  const hours24 = d.getHours()
  const hours12 = hours24 % 12 || 12
  const hours = is24Hours ? hours24 : hours12
  const minutes = d.getMinutes()
  const seconds = d.getSeconds()
  const ampm = hours24 >= 12 ? 'PM' : 'AM'
  const day = d.getDate()
  const monthIdx = d.getMonth()
  const year = d.getFullYear()
  const dayOfWeekIdx = d.getDay()

  let greeting = 'Good day'
  if (hours24 >= 5 && hours24 < 12) {
    greeting = 'Good morning'
  } else if (hours24 >= 12 && hours24 < 17) {
    greeting = 'Good afternoon'
  } else if (hours24 >= 17 && hours24 < 22) {
    greeting = 'Good evening'
  } else {
    greeting = 'Late night'
  }

  return {
    date: d,
    hours24,
    hours12,
    hours,
    minutes,
    seconds,
    ampm,
    day,
    dayPadded: day.toString().padStart(2, '0'),
    monthNumber: monthIdx + 1,
    monthShort: MONTH_NAMES_SHORT[monthIdx],
    monthFull: MONTH_NAMES_FULL[monthIdx],
    year,
    weekDayShort: WEEKDAYS_SHORT[dayOfWeekIdx],
    weekDayFull: WEEKDAYS_FULL[dayOfWeekIdx],
    greeting,
  }
}

export function pad2(val: number): string {
  return val.toString().padStart(2, '0')
}

