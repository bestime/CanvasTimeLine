import { cloneEasy, observeDomResize, padStart } from '@bestime/utils'

export function convertTime(timeStamp: number) {
  const date = new Date(timeStamp);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    milliSecond: date.getMilliseconds()
  };
}

export function formatTime(data: ReturnType<typeof convertTime>) {
  const year = padStart(data.year, 4, '0');
  const month = padStart(data.month, 2, '0');
  const day = padStart(data.day, 2, '0');
  const hour = padStart(data.hour, 2, '0');
  const minute = padStart(data.minute, 2, '0');
  const second = padStart(data.second, 2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}