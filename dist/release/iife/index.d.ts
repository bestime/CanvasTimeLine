declare namespace CanvasTimeLineTheme02 {
  type BTDeepPartial<T = any> = {
    [P in keyof T]?: T[P] extends Function
      ? T[P]
      : T[P] extends object
      ? BTDeepPartial<T[P]>
      : T[P];
  };

  export type Scale = 'day' | 'hour' | 'minute' | 'month' | 'year';

  export interface SelectItem {
    /** 当前选中的时间 */
    value: string;
    /** 开始时间 */
    start: string;
    /** 结束时间 */
    end: string;
    /** 上一个时间 */
    prev: string;
    /** 下一个时间 */
    next: string;
  }

  export interface Options {
    scale: {
      /** 刻度类型 */
      type: Scale;
      /** 刻度高度 */
      height: number;
      /** 刻度线颜色 */
      lineColor: string;
      /** 刻度文本颜色 */
      fontColor: string;
      /** 刻度间隔距离 */
      space: number;
      /** 刻度线底部距离 */
      bottom: number;
      /** 刻度格式化 */
      formatter?: (datetime: string) => string;
      /** 刻度字体 */
      font: {
        size: number;
        family: string;
      };
    };
    progress: {
      /** 进度条高度 */
      size: number;
      /** 进度条背景色 */
      backgroundStaticColor: string;
      /** 进度条高亮背景色 */
      backgroundActiveColor: string;
    };
    label: {
      /** label左侧间距，不填则居中 */
      leftSpace?: number;
      /** label格式化 */
      formatter: (datetime: string) => string;
    };

    autoplay: {
      /** 开启自动播放 */
      enabled: boolean;
      /** 自动播放时间间隔 */
      interval: number;
    };

    beforeDraw?: () => void

    /** 时间选择回调 */
    onChange?: (time: SelectItem, next: () => void) => void;
  }

  export type InputOptions = BTDeepPartial<Options>;
}

declare class CanvasTimeLineTheme02 {
  constructor(element: HTMLDivElement, options?: CanvasTimeLineTheme02.InputOptions);

  /**
   * 设置当前时间
   * @param data - 时间
   * @returns 当前实例
   */
  setDateTime(data: string): this;

  /**
   * 销毁实例
   */
  dispose(): void;

  /**
   * 设置时间列表
   * @param data - 时间列表
   * @returns 当前实例
   */
  setData(data: string[]): this;

  /**
   * 播放
   */
  play(): this;

  /**
   * 暂停
   */
  stop(): this;
}
