import { convertTime } from './tool'

export default function convertList (data: string[], scale: CanvasTimeLineTheme02.Scale) {
  
  const cache: Record<string, {
    value: string,
    data: string[]
  }> = {}
  
  for(let index = 0; index<data.length; index++) {
    const value = data[index]
    
    const time = convertTime(new Date(value).getTime())
    let prefix = ''
    
    if(scale === 'year') {
      prefix = `${time.year}`
    } else if(scale === 'month') {
      prefix = `${time.year}-${time.month}`
    } else if(scale==='day') {
      prefix = `${time.year}-${time.month}-${time.day}`
    } else if(scale === 'hour'){
      prefix = `${time.year}-${time.month}-${time.day} ${time.hour}`     
    } else if(scale === 'minute'){
      prefix = `${time.year}-${time.month}-${time.day} ${time.hour}:${time.minute}`
    } 
    
    if(!cache[prefix]) {
      cache[prefix] = {
        value,
        data: []
      }
    }

    cache[prefix].data.push(value)
    
  }

  const res = []
  for(let key in cache) {
    res.push(cache[key])
  }

  res.sort(function (a, b) {
    return new Date(a.value).getTime() - new Date(b.value).getTime()
  })


  return res
}