import { cloneEasy, observeDomResize, padStart } from '@bestime/utils'
import convertList from './convertList';

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

export function findTimeItem (list: ReturnType<typeof convertList>, data: string) {
  let result, isFind;

  for(let a = 0; a<list.length; a++) {
    for(let b=0;b<list[a].data.length;b++) {
      if(list[a].data[b].value === data) {
        isFind = true
        result = list[a].data[b]
        break;
      }
    }
    if(isFind) {
      break;
    }
  }
  return result
}