import { cloneEasy, observeDomResize, padStart } from '@bestime/utils';
import { debounce, first, last, mergeWith } from 'lodash-es';
import convertList, { type TimeItem } from './libs/convertList';
import { convertTime, findTimeItem } from './libs/tool';

function getDefaultOptions (): CanvasTimeLineTheme02.Options {
  return {
    scale: {
      type: 'day',
      height: 6,
      lineColor: '#fff',
      fontColor: '#fff',
      space: 70,
      bottom: 4,
      font: {
        size: 12,
        family: 'Microsoft YaHei'
      }
    },

    autoplay: {
      enabled: false,
      interval: 60
    },
    progress: {
      size: 6,
      padding: 1,
      backgroundActiveColor: '#4492d5',
      backgroundStaticColor: '#35323f',
      borderColor: '#000'
    },
    label: {}
  }
}

export default class CanvasTimeLineTheme02 {
  private _times: ReturnType<typeof convertList> = [];
  private _options: CanvasTimeLineTheme02.Options;
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _element: HTMLDivElement;
  private _pressX = 0;
  private _currentWidth = 0;
  private _originTimes: string[] = [];
  private _offsetX = {
    pre: 0,
    current: 0
  };

  private _currentPopper: HTMLDivElement;
  private _previewPopper: HTMLDivElement;
  private _playBtn: HTMLDivElement;
  private _canvasRoom: HTMLDivElement;
  private _bodyContainer: HTMLDivElement;
  private _canvasPadding: HTMLDivElement;
  private _outerProgress: HTMLSpanElement;
  private _currentTime: TimeItem | undefined;
  private _locking = false;
  private _timerAuto: any;
  private _timerObv: any;
  private _mousein = false;
  private _mouseLeaveDebFunc: ReturnType<typeof debounce> | undefined;
  private _canvasHeight = 0;
  private _obvHandler: ReturnType<typeof observeDomResize>;

  constructor(element: HTMLDivElement, options?: CanvasTimeLineTheme02.InputOptions) {
    this._options = mergeWith(getDefaultOptions(), options);
    element.classList.add('canvas-timeLine-theme02');
    this._element = element;

    this._onMouesmove = this._onMouesmove.bind(this);
    this._onMouseup = this._onMouseup.bind(this);

    this._bodyContainer = document.createElement('div');
    this._bodyContainer.className = 'body';

    this._currentPopper = document.createElement('div');
    this._currentPopper.className = 'current';

    this._previewPopper = document.createElement('div');
    this._previewPopper.className = 'preview';

    this._playBtn = document.createElement('div');
    this._playBtn.innerText = '播放';
    if (this._options.autoplay.enabled && this._options.autoplay.interval > 0) {
      this._playBtn.innerText = '暂停';
      this._bodyContainer.classList.add('playing');
    }
    this._playBtn.className = 'play';    

    this._canvasRoom = document.createElement('div');
    this._canvasRoom.className = 'canvas-room';    

    this._canvasPadding = document.createElement('div');    
    this._canvasPadding.className = 'canvas-padding';

    this._outerProgress = document.createElement('span');
    this._outerProgress.className = 'outer-progress';
    
    

    const canvas = document.createElement('canvas');
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d')!;

    

    this._canvasHeight =
      this._options.scale.font.size +
      this._options.scale.bottom +
      this._options.scale.height +
      this._options.progress.padding +
      this._options.progress.size;

    element.appendChild(this._bodyContainer);
    this._bodyContainer.appendChild(this._playBtn);
    this._canvasRoom.appendChild(canvas);
    this._canvasPadding.appendChild(this._canvasRoom)
    this._canvasPadding.appendChild(this._outerProgress)
    this._bodyContainer.appendChild(this._canvasPadding);
    this._bodyContainer.appendChild(this._currentPopper);
    this._bodyContainer.appendChild(this._previewPopper);

    this._playBtn.onclick = () => {
      if (this._options.autoplay.enabled) {
        this.stop();
      } else {
        this.play();
      }
      return this;
    };

    this._obvHandler = observeDomResize(
      this._element,
      () => {
        this._canvas.style.width = this._times.length * this._options.scale.space + 'px';
        clearTimeout(this._timerObv);
        this._timerObv = setTimeout(() => {
          this._scrollToCurrent();
        }, 30);
      },
      ['width', 'position'],
      100
    );

    

    this._initDrag();
    this._updateStyle();
    
  }

  _updateStyle () {    
    this._canvasRoom.style.borderTopWidth = this._options.progress.padding + 'px'
    this._canvasPadding.style.padding = [
      0,
      this._options.progress.padding + 'px'
    ].join(' ')

    this._outerProgress.style.backgroundColor = this._options.progress.borderColor

    const _outerProgHeight = this._options.progress.padding * 2 + this._options.progress.size
    this._outerProgress.style.height = _outerProgHeight + 'px'
    this._outerProgress.style.borderRadius = Math.ceil(_outerProgHeight/2) + 'px'
    
    const top = (this._playBtn.offsetHeight - this._options.progress.size-this._options.progress.padding*2) / 2
    if(top>0) {
      this._canvasPadding.style.marginTop = top + 'px';
      this._playBtn.style.marginTop = '0px';

    } else {
      this._canvasPadding.style.marginTop = '0px';
      this._playBtn.style.marginTop = -top + 'px';
    }
    
  }

  play() {
    clearTimeout(this._timerAuto);
    this._options.autoplay.enabled = true;
    this._playBtn.innerHTML = '暂停';
    this._bodyContainer.classList.add('playing');
    this._checkAutoPlay();
    return this;
  }

  stop() {
    clearTimeout(this._timerAuto);
    this._options.autoplay.enabled = false;
    this._playBtn.innerHTML = '播放';
    this._bodyContainer.classList.remove('playing');
    return this;
  }

  private _checkAutoPlay() {
    clearTimeout(this._timerAuto);
    if (this._options.autoplay.enabled && !this._mousein && this._options.autoplay.interval > 0) {
      this._timerAuto = setTimeout(() => {
        const time = this._findNextTime();
        this.setDateTime(time, false);
      }, this._options.autoplay.interval);
    }
  }

  private _getPrevTime() {
    let time = '';
    for (let a = this._times.length - 1; a >= 0; a--) {
      for (let b = this._times[a].data.length - 1; b >= 0; b--) {
        if (this._times[a].data[b].value === this._currentTime!.value) {
          if (b === 0) {
            if (a === 0) {
              time = this._currentTime!.value;
            } else {
              time = last(this._times[a - 1].data)!.value;
            }
          } else {
            time = this._times[a].data[b - 1].value;
          }
        }
      }
    }
    return time;
  }

  private _getNextTime() {
    let time = '';
    for (let a = 0; a < this._times.length; a++) {
      for (let b = 0; b < this._times[a].data.length; b++) {
        if (this._times[a].data[b].value === this._currentTime!.value) {
          if (b === this._times[a].data.length - 1) {
            if (a === this._times.length - 1) {
              time = this._currentTime!.value;
            } else {
              time = this._times[a + 1].data[0].value;
            }
          } else {
            time = this._times[a].data[b + 1].value;
          }
        }
      }
    }
    return time;
  }

  private _findNextTime() {
    let time = '';
    for (let a = 0; a < this._times.length; a++) {
      for (let b = 0; b < this._times[a].data.length; b++) {
        if (this._times[a].data[b].value === this._currentTime!.value) {
          if (b === this._times[a].data.length - 1) {
            if (a === this._times.length - 1) {
              time = this._times[0].data[0].value;
            } else {
              time = this._times[a + 1].data[0].value;
            }
          } else {
            time = this._times[a].data[b + 1].value;
          }
        }
      }
    }
    return time;
  }

  private  get _minLeftSpace() {
    return this._options.label.leftSpace ?? Math.floor(this._canvas.offsetWidth / 2);
  }

  private _onMouseup() {
    this._offsetX.pre = this._offsetX.current;
    document.removeEventListener('mouseup', this._onMouseup);
    document.removeEventListener('mousemove', this._onMouesmove);
  }

  private _onMouesmove(ev: MouseEvent) {
    const x = ev.clientX - this._pressX;
    let left = x + this._offsetX.pre + this._minLeftSpace;
    if (x < 0) {
      let current = Math.max(left, -(this._getMaxWidth() - this._canvasRoom.offsetWidth));
      this._offsetX.current = Math.min(current, 0);
    } else {
      this._offsetX.current = Math.min(left, 0);
    }

    this.draw();
  }

  private _initDrag() {
    this._canvas.onmousedown = ev => {
      this._mousein = true;
      this._pressX = ev.clientX + this._minLeftSpace;
      document.removeEventListener('mouseup', this._onMouseup);
      document.removeEventListener('mousemove', this._onMouesmove);
      document.addEventListener('mouseup', this._onMouseup);
      document.addEventListener('mousemove', this._onMouesmove);
    };

    this._canvas.onmousemove = ev => {
      this._mousein = true;
      const time = this._getMouseDatetime(ev.clientX, this._currentWidth);



      if (time) {   
        let currentScale = this._offsetX.current + this._getTimeTickWidth(time.value);
        const diff = currentScale - this._canvasRoom.offsetWidth
        // console.log("currentScale", currentScale, diff)
        if(currentScale<0) {
          currentScale = 0
        } else if(diff>0) {
          currentScale -= diff
        }

        if (!time.tipLabel) {
          time.tipLabel = this._options.label.formatter?.(time.value, time.index) ?? time.value;
        }

        this._previewPopper.innerText = time.tipLabel;
        this._previewPopper.style.display = 'block';
        const boundary = this._canvas.getBoundingClientRect();
        this._previewPopper.style.left =
          boundary.left + currentScale - this._previewPopper.offsetWidth/2 + 'px';
        this._previewPopper.style.top = boundary.top - this._previewPopper.offsetHeight - 8 + 'px';
      } else {
        this._previewPopper.style.display = 'none';
      }
    };

    this._mouseLeaveDebFunc = debounce(() => {
      this._previewPopper.style.display = 'none';
      this._mousein = false;
      this._checkAutoPlay();
    }, 500);

    this._canvas.onmouseout = this._canvas.onmouseleave = this._mouseLeaveDebFunc;

    this._canvas.ondblclick = ev => {
      const time = this._getMouseDatetime(ev.clientX, this._currentWidth);
      time && this.setDateTime(time.value, true);
    };
  }

  private _getTimeTickWidth(time: string) {
    let width = 0;
    let isFind = false;
    for (let a = 0; a < this._times.length; a++) {
      for (let b = 0; b < this._times[a].data.length; b++) {
        if (this._times[a].data[b].value === time) {
          let length = this._times[a].data.length;
          if (a === this._times.length - 1) {
            length = Math.max(length - 1, 1);
          }
          width = a * this._options.scale.space + (this._options.scale.space / length) * b;
          isFind = true;
          break;
        }
      }
      if (isFind) {
        break;
      }
    }

    return width;
  }

 

  setData(data: string[]) {
    this._currentTime = undefined;
    data = cloneEasy(data);
    data.sort(function (a, b) {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    this._originTimes = data;
    this._times = convertList(data, this._options.scale.type);

    if (data.length) {
      this._canvas.style.width = this._times.length * this._options.scale.space + 'px';
      this.setDateTime(first(data)!, false);
    } else {
      this.clear();
    }
    
    return this;
  }

  private draw() {
    clearTimeout(this._timerObv);
    this._options?.beforeDraw?.();
    const maxWidth = this._getMaxWidth();
    let width = this._canvasRoom.offsetWidth;

    if (this._canvasRoom.offsetWidth > maxWidth) {
      width = maxWidth;
      this._offsetX.current = 0;
      this._offsetX.pre = 0;
    }    

    this._canvas.width = width;
    this._canvas.height = this._canvasHeight;
    this._canvas.style.width = width + 'px';
    this._canvas.style.height = this._canvasHeight + 'px';
    this._canvasRoom.style.height = this._canvasHeight + 'px';
    this._ctx.fillStyle = 'transparent';
    this._ctx.fillRect(0, 0, width, this._canvasHeight);

    this._drawScales();
    this._drawProgress();
  }

  private _formatScale(time: TimeItem) {
    if (this._options.scale.formatter) {
      return this._options.scale.formatter(time.value, time.index);
    } else {
      const t = convertTime(new Date(time.value).getTime());
      if (this._options.scale.type === 'year') {
        return `${padStart(t.year, 4, '0')}年`;
      } else if (this._options.scale.type === 'month') {
        return `${padStart(t.year, 4, '0')}年${padStart(t.month, 2, '0')}月`;
      } else if (this._options.scale.type === 'day') {
        return `${padStart(t.month, 2, '0')}月${padStart(t.day, 2, '0')}日`;
      } else if (this._options.scale.type === 'hour') {
        return `${padStart(t.day, 2, '0')}日${padStart(t.hour, 2, '0')}时`;
      } else if (this._options.scale.type === 'minute') {
        return `${padStart(t.hour, 2, '0')}时${padStart(t.minute, 2, '0')}分`;
      } else {
        return time.value;
      }
    }
  }

  private _getMouseDatetime(mouseX: number, pointX: number) {
    const boundary = this._canvas.getBoundingClientRect();
    let width = Math.round(mouseX - boundary.left) - this._offsetX.current;
    let index01 = Math.floor(width / this._options.scale.space);
    let data = this._times[index01];
    if (!data) return;
    let index02 = 0;

    if (width < pointX) {
      index02 = Math.floor(
        (width % this._options.scale.space) / (this._options.scale.space / data.data.length)
      );
    } else {
      index02 = Math.ceil(
        (width % this._options.scale.space) / (this._options.scale.space / data.data.length)
      );
      if (index02 > data.data.length - 1) {
        index01++;
        index02 = 0;
        data = this._times[index01];
      }
    }

    if (!data?.data?.[index02]) {
      index01 = this._times.length - 1;
      data = this._times[index01];
      index02 = data.data.length - 1;
    }

    return data.data[index02];
  }

  private _getMaxWidth() {
    let res = this._times.length * this._options.scale.space;
    if (last(this._times)?.data.length === 1) {
      res -= this._options.scale.space;
    }

    return res;
  }

  private _drawProgress() {
    if (!this._currentTime) {
      return;
    }    
 
    const penAdj = this._options.progress.size / 2;

    this._ctx.beginPath();
    this._ctx.lineWidth = this._options.progress.size;
    this._ctx.lineCap = 'round';
    this._ctx.strokeStyle = this._options.progress.backgroundStaticColor;
    this._ctx.moveTo(penAdj, penAdj);
    this._ctx.lineTo(this._canvas.offsetWidth - penAdj, penAdj);
    this._ctx.stroke();
    this._ctx.closePath();

    const currentScale = this._currentWidth + this._offsetX.current;
    let end = currentScale;
    if (end >= 0) {
      const innerPenWidth = Math.max(this._options.progress.size, 2)
      const innerPenAdj = innerPenWidth/2
      end = end - innerPenAdj;
      end = Math.min(this._canvas.offsetWidth - penAdj, end)
      end = Math.max(end, penAdj)
      this._ctx.beginPath();
      this._ctx.lineWidth = innerPenWidth;
      this._ctx.strokeStyle = this._options.progress.backgroundActiveColor;
      this._ctx.moveTo(penAdj, penAdj);
      this._ctx.lineTo(end, penAdj);
      this._ctx.stroke();
      this._ctx.closePath();
      
    }

    if (this._currentTime && currentScale <= this._canvasRoom.offsetWidth && currentScale >= 0) {
      this._currentPopper.style.display = 'block';
      if (!this._currentTime.tipLabel) {
        this._currentTime.tipLabel =
          this._options.label.formatter?.(this._currentTime.value, this._currentTime.index) ??
          this._currentTime.value;
      }
      this._currentPopper.innerText = this._currentTime.tipLabel;
      const boundary = this._canvas.getBoundingClientRect();
      this._currentPopper.style.left =
        boundary.left + currentScale - this._currentPopper.offsetWidth / 2 + 'px';
      this._currentPopper.style.top = boundary.top - this._currentPopper.offsetHeight - 8 + 'px';
    } else {
      this._currentPopper.style.display = 'none';
    }
  }

  private _drawScales() {
    this._ctx.lineCap = 'butt';
    this._ctx.textBaseline = 'ideographic';
    this._ctx.fillStyle = this._options.scale.fontColor;
    this._ctx.font = `${this._options.scale.font.size}px ${this._options.scale.font.family}`;
    this._ctx.lineWidth = 1;
    this._ctx.strokeStyle = this._options.scale.lineColor;
    this._ctx.beginPath();
    for (let index = 1; index < this._times.length; index++) {
      // 如果最后一个时间子项只有一个，则不绘制刻度及长度
      if (index === this._times.length - 1 && last(this._times)?.data.length === 1) {
        continue;
      }

      const scaleTime = this._times[index].data[0];
      let x = this._options.scale.space * index - 0.5 + this._offsetX.current;
      this._ctx.moveTo(x, 0 + this._options.progress.size+this._options.progress.padding);
      this._ctx.lineTo(x, this._options.scale.height + this._options.progress.size + this._options.progress.padding);
      this._ctx.stroke();

      // 绘制文本
      if (!scaleTime.scaleLabel) {
        scaleTime.scaleLabel = this._formatScale(scaleTime);
      }
      const txtWidth = this._ctx.measureText(scaleTime.scaleLabel).width;
      this._ctx.fillText(scaleTime.scaleLabel, x - Math.floor(txtWidth / 2), this._canvasHeight);
    }
    this._ctx.closePath();
  }

  private _scrollToCurrent() {
    if (!this._currentTime) return;
    
    this._pressX = 0;
    this._offsetX.pre = 0;
    this._offsetX.current = this._offsetX.pre;

    // @ts-ignore
    this._onMouesmove({
      clientX: -this._currentWidth
    } as any);

    this._offsetX.pre = this._offsetX.current;
  }

  setDateTime(data: string, isMouseEvent?: boolean) {
    clearTimeout(this._timerAuto);
    if (this._currentTime?.value === data) return;
    if (this._locking) {
      console.error(`时间设置失败： "${data}"。上一个切换未完成！`);
      return this;
    }
    if (
      !this._originTimes.some(function (value) {
        return value === data;
      })
    ) {
      console.error(`时间设置失败： "${data}" 不在列表中`);
      return this;
    }

    this._currentTime = findTimeItem(this._times, data);    

    if (!this._currentTime) {
      this.clear();
      return this;
    }

    this._currentWidth = this._getTimeTickWidth(this._currentTime.value)

    if (isMouseEvent) {
      const currentScale = this._currentWidth + this._offsetX.current;
      const diff = currentScale - this._canvasRoom.offsetWidth
      if(currentScale<0) {
        this._offsetX.current -= currentScale
        this._offsetX.pre -= currentScale
      } else if(diff>0) {
        this._offsetX.current -= diff
        this._offsetX.pre -= diff
      }
      
      this.draw();
    } else {
      this._scrollToCurrent();
    }

    if (this._options?.onChange) {
      this._locking = true;
      const query = {
        value: this._currentTime.value,
        start: first(this._originTimes)!,
        end: last(this._originTimes)!,
        prev: this._getPrevTime(),
        next: this._getNextTime()
      };
      this._options.onChange(query, () => {
        this._locking = false;
        this._checkAutoPlay();
      });
    }

    return this;
  }

  clear() {
    // this.stop()
    clearTimeout(this._timerObv);
    clearTimeout(this._timerAuto)
    this._mousein = false
    this._locking = false
    this._originTimes = []
    this._currentWidth = 0
    this._pressX = 0
    this._ctx.clearRect(0, 0, this._canvasRoom.offsetWidth, this._canvasHeight);
    this._currentPopper.style.display = 'none';
    this._previewPopper.style.display = 'none';
    this._canvas.style.width = '0px';
    this._currentTime = undefined;
    document.removeEventListener('mouseup', this._onMouseup);
    document.removeEventListener('mousemove', this._onMouesmove);
  }

  dispose() {    
    this.stop()
    this._mouseLeaveDebFunc?.cancel();
    this._obvHandler();
    this.clear();
  }
}
