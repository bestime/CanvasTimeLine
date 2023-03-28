import { cloneEasy, observeDomResize, padStart } from '@bestime/utils';
import { debounce, first, last, max, mergeWith, throttle } from 'lodash-es';

import convertList from './libs/convertList';
import { convertTime } from './libs/tool';

const progressHeight = 6;
const height = 26;

export default class CanvasTimeLineTheme02 {
  _times: ReturnType<typeof convertList> = [];
  _options: CanvasTimeLineTheme02.Options;
  _canvas: HTMLCanvasElement;
  _ctx: CanvasRenderingContext2D;
  _element: HTMLDivElement;
  _pressX = 0;
  _currentWidth = 0;
  _originTimes: string[] = [];
  _offsetX = {
    pre: 0,
    current: 0
  };
  _playing = false;
  _currentPopper: HTMLDivElement;
  _previewPopper: HTMLDivElement;
  _playBtn: HTMLDivElement;
  _canvasRoom: HTMLDivElement;
  _bodyPopper: HTMLDivElement;
  currentTime = '';
  _locking = false;
  _timerAuto: any;
  _timerObv: any;
  _mousein = false;
  _obvHandler: ReturnType<typeof observeDomResize>;

  constructor(element: HTMLDivElement, options?: Partial<CanvasTimeLineTheme02.Options>) {
    element.classList.add('canvas-timeLine-theme02');
    this._onMouesmove = this._onMouesmove.bind(this);
    this._onMouseup = this._onMouseup.bind(this);
    const canvas = document.createElement('canvas');
    this._currentPopper = document.createElement('div');
    this._currentPopper.className = 'current';
    this._previewPopper = document.createElement('div');
    this._previewPopper.className = 'preview';
    this._playBtn = document.createElement('div');
    this._playBtn.innerText = '播放';
    this._playBtn.className = 'play';
    this._canvasRoom = document.createElement('div');
    this._canvasRoom.className = 'canvas-room';
    this._element = element;

    this._bodyPopper = document.createElement('div');
    this._bodyPopper.className = 'body';

    // this._emitTime = debounce(this._emitTime.bind(this), 500)
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d')!;

    this._options = mergeWith(
      {
        scale: 'day',
        scaleSpace: 70,
        autoPlayInterval: 1000,
        style: {
          font: '12px Microsoft YaHei',
          progressBarBackgroundColor: '#35323f',
          progressBarActiveColor: '#4492d5',
          scaleLineColor: '#fff',
          scaleFontColor: '#fff'
        }
      },
      options
    );

    this._initDrag();

    element.appendChild(this._bodyPopper);
    this._bodyPopper.appendChild(this._playBtn);
    this._canvasRoom.appendChild(canvas);
    this._bodyPopper.appendChild(this._canvasRoom);
    this._bodyPopper.appendChild(this._currentPopper);
    this._bodyPopper.appendChild(this._previewPopper);

    this._obvHandler = observeDomResize(
      this._element,
      () => {
        this._canvas.style.width = this._times.length * this._options.scaleSpace + 'px';
        clearTimeout(this._timerObv);
        this._timerObv = setTimeout(() => {
          this._scrollToCurrent();
        }, 30);
      },
      ['width', 'position'],
      100
    );

    this._playBtn.onclick = () => {
      clearTimeout(this._timerAuto);
      this._playing = !this._playing;
      if (!this._playing) {
        this._playBtn.innerHTML = '播放';
        this._bodyPopper.classList.remove('playing');
        return this;
      }
      this._playBtn.innerHTML = '暂停';
      this._bodyPopper.classList.add('playing');
      this._checkAutoPlay();
    };
  }

  _checkAutoPlay() {
    clearTimeout(this._timerAuto);
    if (this._playing && !this._mousein && this._options.autoPlayInterval > 0) {
      this._timerAuto = setTimeout(() => {
        const time = this._findNextTime();
        this.setDateTime(time, false);
      }, this._options.autoPlayInterval);
    }
  }

  _getPrevTime() {
    let time = '';
    for (let a = this._times.length - 1; a >= 0; a--) {
      for (let b = this._times[a].data.length - 1; b >= 0; b--) {
        if (this._times[a].data[b] === this.currentTime) {
          if (b === 0) {
            if (a === 0) {
              time = this.currentTime;
            } else {
              time = last(this._times[a - 1].data)!;
            }
          } else {
            time = this._times[a].data[b - 1];
          }
        }
      }
    }
    return time;
  }

  _getNextTime() {
    let time = '';
    for (let a = 0; a < this._times.length; a++) {
      for (let b = 0; b < this._times[a].data.length; b++) {
        if (this._times[a].data[b] === this.currentTime) {
          if (b === this._times[a].data.length - 1) {
            if (a === this._times.length - 1) {
              time = this.currentTime;
            } else {
              time = this._times[a + 1].data[0];
            }
          } else {
            time = this._times[a].data[b + 1];
          }
        }
      }
    }
    return time;
  }

  _findNextTime() {
    let time = '';
    for (let a = 0; a < this._times.length; a++) {
      for (let b = 0; b < this._times[a].data.length; b++) {
        if (this._times[a].data[b] === this.currentTime) {
          if (b === this._times[a].data.length - 1) {
            if (a === this._times.length - 1) {
              time = this._times[0].data[0];
            } else {
              time = this._times[a + 1].data[0];
            }
          } else {
            time = this._times[a].data[b + 1];
          }
        }
      }
    }
    return time;
  }

  _onMouseup() {
    this._offsetX.pre = this._offsetX.current;
    document.removeEventListener('mouseup', this._onMouseup);
    document.removeEventListener('mousemove', this._onMouesmove);
  }
  _onMouesmove(ev: MouseEvent) {
    const x = ev.clientX - this._pressX;

    if (x > 0) {
      this._offsetX.current = Math.min(x + this._offsetX.pre, 0);
    } else if (x < 0) {
      let current = Math.max(
        x + this._offsetX.pre,
        -(this._times.length * this._options.scaleSpace - this._canvasRoom.offsetWidth)
      );
      this._offsetX.current = Math.min(current, 0);
    } else {
      this._offsetX.current = x + this._offsetX.pre;
    }
    this.draw();
  }

  _initDrag() {
    this._canvas.onmousedown = ev => {
      this._mousein = true;
      this._pressX = ev.clientX;
      document.removeEventListener('mouseup', this._onMouseup);
      document.removeEventListener('mousemove', this._onMouesmove);
      document.addEventListener('mouseup', this._onMouseup);
      document.addEventListener('mousemove', this._onMouesmove);
    };

    this._canvas.onmousemove = ev => {
      this._mousein = true;
      const time = this.getMouseDatetime(ev.clientX, this._currentWidth);
      if (time) {
        const width = this._getCurrentLeft(time);

        const currentScale = width + this._offsetX.current;
        this._previewPopper.innerText = this._options.labelFormat
          ? this._options.labelFormat(time)
          : time;
        this._previewPopper.style.display = 'block';
        const boundary = this._canvas.getBoundingClientRect();
        this._previewPopper.style.left =
          boundary.left + currentScale - this._previewPopper.offsetWidth / 2 + 'px';
        this._previewPopper.style.top = boundary.top - this._previewPopper.offsetHeight - 8 + 'px';
      } else {
        this._previewPopper.style.display = 'none';
      }
    };

    this._canvas.onmouseout = this._canvas.onmouseleave = debounce(() => {
      this._previewPopper.style.display = 'none';
      this._mousein = false;
      this._checkAutoPlay();
    }, 200);

    this._canvas.ondblclick = ev => {
      const time = this.getMouseDatetime(ev.clientX, this._currentWidth);
      time && this.setDateTime(time, true);
    };
  }

  _getCurrentLeft(time: string) {
    let width = 0;
    let isFind = false;
    for (let a = 0; a < this._times.length; a++) {
      for (let b = 0; b < this._times[a].data.length; b++) {
        if (this._times[a].data[b] === time) {
          let length = this._times[a].data.length;
          if (a === this._times.length - 1) {
            length--;
          }
          width = a * this._options.scaleSpace + (this._options.scaleSpace / length) * b;
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
    data = cloneEasy(data);
    data.sort(function (a, b) {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    this._originTimes = data;
    this._times = convertList(data, this._options.scale);

    if (data.length) {
      this._canvas.style.width = this._times.length * this._options.scaleSpace + 'px';
      this.setDateTime(first(data)!, false);
      // this.setDateTime('2023-03-23 06:15:47', false)
    }

    return this;
  }

  draw() {
    const maxWidth = this._times.length * this._options.scaleSpace;

    let width = this._canvasRoom.offsetWidth;
    if (this._canvasRoom.offsetWidth > maxWidth) {
      width = maxWidth;
      this._offsetX.current = 0;
      this._offsetX.pre = 0;
    }

    this._canvas.width = width;
    this._canvas.height = height;
    this._canvas.style.width = width + 'px';
    this._canvas.style.height = height + 'px';
    this._canvasRoom.style.height = height + 'px';
    this._ctx.fillStyle = 'transparent';
    this._ctx.fillRect(0, 0, width, height);

    this._drawProgress();
    this._drawScales();
  }

  _formatScale(value: string) {
    if (this._options.scaleFormat) {
      return this._options.scaleFormat(value);
    }
    const t = convertTime(new Date(value).getTime());

    if (this._options.scale === 'day') {
      return `${padStart(t.month, 2, '0')}月${padStart(t.day, 2, '0')}日`;
    } else if (this._options.scale === 'hour') {
      return `${padStart(t.day, 2, '0')}日${padStart(t.hour, 2, '0')}时`;
    } else {
      return value;
    }
  }

  getMouseDatetime(mouseX: number, pointX: number) {
    const boundary = this._canvas.getBoundingClientRect();
    const width = Math.round(mouseX - boundary.left) - this._offsetX.current;

    let index01 = Math.floor(width / this._options.scaleSpace);
    let data = this._times[index01];
    if (!data) return;
    let index02 = 0;

    if (width < pointX) {
      index02 = Math.floor(
        (width % this._options.scaleSpace) / (this._options.scaleSpace / data.data.length)
      );
    } else {
      index02 = Math.ceil(
        (width % this._options.scaleSpace) / (this._options.scaleSpace / data.data.length)
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
    const time = data.data[index02];
    return time;
  }

  _drawProgress() {
    const width = this._getCurrentLeft(this.currentTime);
    const maxWidth = this._times.length * this._options.scaleSpace;

    this._currentWidth = width;

    const currentScale = width + this._offsetX.current;

    this._ctx.beginPath();
    this._ctx.lineWidth = progressHeight;
    this._ctx.lineCap = 'round';
    this._ctx.strokeStyle = this._options.style.progressBarBackgroundColor;
    this._ctx.moveTo(this._offsetX.current + progressHeight / 2, progressHeight / 2);
    this._ctx.lineTo(this._offsetX.current + maxWidth - progressHeight / 2, progressHeight / 2);
    this._ctx.stroke();
    this._ctx.closePath();

    const starat = this._offsetX.current + progressHeight / 2;
    let end = currentScale;
    if (end >= 0) {
      end -= progressHeight / 2;
      this._ctx.beginPath();
      this._ctx.lineWidth = progressHeight;
      this._ctx.strokeStyle = this._options.style.progressBarActiveColor;
      this._ctx.moveTo(starat, progressHeight / 2);
      this._ctx.lineTo(end, progressHeight / 2);
      this._ctx.stroke();
      this._ctx.closePath();
    }

    if (this.currentTime && currentScale <= this._canvasRoom.offsetWidth && currentScale >= 0) {
      this._currentPopper.style.display = 'block';
      this._currentPopper.innerText = this._options.labelFormat
        ? this._options.labelFormat(this.currentTime)
        : this.currentTime;
      const boundary = this._canvas.getBoundingClientRect();
      this._currentPopper.style.left =
        boundary.left + currentScale - this._currentPopper.offsetWidth / 2 + 'px';
      this._currentPopper.style.top = boundary.top - this._currentPopper.offsetHeight - 8 + 'px';
    } else {
      this._currentPopper.style.display = 'none';
    }
  }

  _drawScales() {
    this._ctx.lineCap = 'butt';

    for (let index = 1; index < this._times.length; index++) {
      this._ctx.beginPath();
      this._ctx.lineWidth = 1;
      this._ctx.strokeStyle = this._options.style.scaleLineColor;
      let x = this._options.scaleSpace * index - 0.5 + this._offsetX.current;
      this._ctx.moveTo(x, 0 + progressHeight);
      this._ctx.lineTo(x, 6 + progressHeight);
      this._ctx.stroke();

      this._ctx.closePath();

      this._ctx.beginPath();
      this._ctx.fillStyle = this._options.style.scaleFontColor;
      this._ctx.font = this._options.style.font;
      const text = this._formatScale(this._times[index].value);
      const txtWidth = this._ctx.measureText(text).width;

      this._ctx.fillText(text, x - Math.floor(txtWidth / 2), 18 + progressHeight);
      this._ctx.closePath();
    }
  }

  _scrollToCurrent() {
    const width = this._getCurrentLeft(this.currentTime) - progressHeight / 2;

    this._pressX = 0;
    this._offsetX.pre = 0;
    this._offsetX.current = this._offsetX.pre;

    // @ts-ignore
    this._onMouesmove({
      clientX: -width
    } as any);

    this._offsetX.pre = this._offsetX.current;
  }

  setDateTime(data: string, isMouseEvent?: boolean) {
    if (this.currentTime && this.currentTime === data) return;
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

    this.currentTime = data!;

    if (isMouseEvent) {
      this.draw();
    } else {
      this._scrollToCurrent();
    }

    if (this._options?.onChange) {
      this._locking = true;
      const query = {
        value: this.currentTime,
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

  dispose() {
    this._obvHandler();
    clearTimeout(this._timerObv);
    clearTimeout(this._timerAuto);
    document.removeEventListener('mouseup', this._onMouseup);
    document.removeEventListener('mousemove', this._onMouesmove);
  }
}
