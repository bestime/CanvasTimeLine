import { cloneEasy, observeDomResize, padStart } from '@bestime/utils'
import { debounce, throttle } from 'lodash-es';
const centerLineColor = '#ffcc00';
const canvasHeight = 60
const scaleEnableColor = 'green';
const scaleDisabledColor = 'red';
const mouseInfoColor = '#d7d7d7';
const timeTextFont = '12px serif';

type TimeKey = keyof ReturnType<typeof convertTime>

function formatTime(data: ReturnType<typeof convertTime>) {
  const year = padStart(data.year, 4, '0');
  const month = padStart(data.month, 2, '0');
  const day = padStart(data.day, 2, '0');
  const hour = padStart(data.hour, 2, '0');
  const minute = padStart(data.minute, 2, '0');
  const second = padStart(data.second, 2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function convertTime(timeStamp: number) {
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


function parseStep (data: CanvasTimeLine.Step): {
  step: number,
  scale:string
  parent:string
} {
  let step = 0
  let scale = 'second'
  let parent = 'minute'
  switch (data) {
    case 'second':
      step = 1000;
      scale = 'second';
      parent = 'minute'
      break;
    case 'minute':
      step = 1000 * 60;
      scale = 'minute';
      parent = 'hour'
      break;
  }

  return {
    step,
    scale,
    parent
  }
}

export default class CanvasTimeLine{
  private _canvas: HTMLCanvasElement
  private _range = [0, 0]
  _options: CanvasTimeLine.Options
  private _datetime = new Date().getTime()
  _times = [] as string[];
  _ctx: CanvasRenderingContext2D;
  _pressX = 0
  _isMouseDown = false
  _pressTime = 0
  _step = parseStep('second')
  _mouseX: number | undefined;


  constructor (canvas: HTMLCanvasElement, options?: CanvasTimeLine.Options) {
    this._onMouseup = this._onMouseup.bind(this)
    this._onMouesmove = throttle(this._onMouesmove.bind(this), 17)
    this._emitTime = throttle(this._emitTime.bind(this), 200)
    this._canvas = canvas
    this._ctx = canvas.getContext('2d')!
    this._options = Object.assign({
      style: {
        backgroundColor: 'black'
      },
      precision: 'second'
    }, options)

    this._step = parseStep(this._options.precision)

    this.updateSize()
    this.setStyle(this._options.style)
    // this.draw = debounce(this.draw, 16)

    this._initDrag()

    // observeDomResize(this._canvas, () => {
    //   this.updateSize()
    // }, 'width', 100)
  }

  draw () {
    this._times = []
    const width = this._canvas.offsetWidth
    this._ctx.clearRect(0, 0, width, canvasHeight);
    const left = Math.ceil(width / 2); 
    this._drawScaleInfo(width, left)    
    this._drawCenterLine(left)
    this._drawMouseInfo()
  }

 
  _initDrag () {
    this._canvas.onmousedown =(ev)=>{
      this._isMouseDown = true
      this._pressTime = this._datetime
      this._pressX = ev.clientX
      document.removeEventListener('mouseup', this._onMouseup)
      document.removeEventListener('mousemove', this._onMouesmove)
      document.addEventListener('mouseup', this._onMouseup)
      document.addEventListener('mousemove', this._onMouesmove)
    }

    this._canvas.onmousemove = (ev) => {
      // if(this._isMouseDown) return;
      const boundary = this._canvas.getBoundingClientRect();
      this._mouseX = ev.clientX - boundary.left;

      this.draw()
    }

    this._canvas.onmouseout = this._canvas.onmouseleave = () => {
      this._mouseX = undefined
      this.draw()
    }

    this._canvas.ondblclick = (ev) => {
      const boundary = this._canvas.getBoundingClientRect();
      const x = ev.clientX - boundary.left;
      this.setDateTime(this._times[x]);
      this._emitTime()
    };
  }

  _emitTime () {

    console.log("时间改变", formatTime(convertTime(this._datetime)))
  }

  _drawMouseInfo() {
    // if(this._isMouseDown) return;
    if (typeof this._mouseX !== 'number' || !this._times[this._mouseX]) return;
    const x = this._mouseX;

    const color = mouseInfoColor;

    // 绘制鼠标移动的刻度
    this._ctx.beginPath();
    this._ctx.strokeStyle = color;
    this._ctx.lineWidth = 1;
    this._ctx.moveTo(x - 0.5, 0);
    this._ctx.lineTo(x - 0.5, 30);
    this._ctx.stroke();
    this._ctx.closePath();

    // 绘制鼠标移动的文本
    const width = this._canvas.offsetWidth;

    // 设置文字绘制的起点坐标，保证绘制在可视区域内
    let textLeft = x - 50;
    textLeft = Math.min(textLeft, width - 115);
    textLeft = Math.max(textLeft, 2);

    this._ctx.beginPath();
    this._ctx.fillStyle = color;
    this._ctx.font = timeTextFont;
    this._ctx.fillText(this._times[x], textLeft, 42);
    this._ctx.closePath();
  }

  _onMouesmove (ev: MouseEvent) {
    const x = ev.clientX - this._pressX
    this._datetime = this._pressTime - x * this._step.step
    this.draw()
  }

  _onMouseup () {
    
    this._isMouseDown = false
    document.removeEventListener('mouseup', this._onMouseup)
    document.removeEventListener('mousemove', this._onMouesmove)
    this._emitTime()
  }

  _drawScaleInfo (width: number, left: number) {
 
    const drawBeginTime = this._datetime - left * this._step.step;
    this._ctx.lineWidth = 1;
    for (let a = 0; a < width; a++) {
      this._ctx.beginPath();
      
      const stamp = drawBeginTime + a * this._step.step;
      const time = convertTime(stamp);

      this._times.push(formatTime(time));
      
      // 10像素绘制一个刻度
      if (time[this._step.scale as TimeKey] % 10 !== 0) continue;
      const isLabel = time[this._step.scale as TimeKey] === 0

      // 10个小刻度绘制一个文本
      const scaleHeight = isLabel ? 14 : 8;
      
      let color = this._checkEnableTime(stamp) ? scaleEnableColor : scaleDisabledColor;

      this._ctx.strokeStyle = color;
      let x = a - 0.5;
      this._ctx.moveTo(x, 0);
      this._ctx.lineTo(x, scaleHeight);
      this._ctx.stroke();
      this._ctx.closePath();

      if (isLabel) {
      
        this._ctx.beginPath();
        this._ctx.fillStyle = color;
        this._ctx.font = timeTextFont;
        this._ctx.fillText(
          `${padStart(time[this._step.parent as TimeKey], 2, '0')}:${padStart(time[this._step.scale as TimeKey], 2, '0')}`,
          a - 16,
          26
        );
        this._ctx.closePath();
      }
    }
  }

  _drawCenterLine(x: number) {
    // 绘制鼠标移动的刻度
    this._ctx.beginPath();
    this._ctx.strokeStyle = centerLineColor;
    this._ctx.lineWidth = 2;
    this._ctx.moveTo(x, 0);
    this._ctx.lineTo(x, 43);
    this._ctx.stroke();
    this._ctx.closePath();

    // 绘制鼠标移动的文本
    this._ctx.beginPath();
    this._ctx.fillStyle = centerLineColor;
    this._ctx.font = timeTextFont;
    this._ctx.fillText(this._times[x], x - 50, 55);
    this._ctx.closePath();


  }

  _checkEnableTime(date: number) {
    if (typeof this._range[0] === 'number' && date < this._range[0]) {
      return false;
    } else if (typeof this._range[1] === 'number' && date > this._range[1]) {
      return false;
    }

    return true;
  }

  setDateTime (datetime: string) {
    this._isMouseDown = false
    this._mouseX = undefined;
    this._datetime = new Date(datetime).getTime()
    this.draw()
    
  }

  setRange (start: string, end: string) {
    this._range[0] = new Date(start).getTime()
    this._range[1] = new Date(end).getTime()
    this.draw()
  }

  setStyle (data: CanvasTimeLine.Style) {
    this._options.style = data
    this._canvas.style['backgroundColor'] = this._options.style.backgroundColor
  }

  updateSize () {
    const width = this._canvas.offsetWidth
    this._canvas.style.height = canvasHeight + 'px'
    this._canvas.width = width
    this._canvas.height = canvasHeight
    this.draw()
  }

  dispose () {
    document.removeEventListener('mouseup', this._onMouseup)
    document.removeEventListener('mousemove', this._onMouesmove)
  }
}