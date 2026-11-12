/** 24-hour clock time, always two digits: 09:30, 18:00. */
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidTime(value: string): boolean {
  return TIME.test(value)
}

function toMinutes(value: string): number {
  const [hours = '0', minutes = '0'] = value.split(':')
  return Number(hours) * 60 + Number(minutes)
}

/** Negative when `a` is earlier than `b`, zero when equal. */
export function compareTimes(a: string, b: string): number {
  return toMinutes(a) - toMinutes(b)
}
