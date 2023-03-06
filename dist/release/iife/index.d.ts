declare namespace CanvasTimeLine {
  /**
   * 键值对格式的数据
   * */
  export interface Style {
    backgroundColor: string;
    scaleEnableColor: string;
    scaleDisabledColor: string;
    mouseInfoColor: string;
    font: string;
    centerColor: string;
  }

  export type Step = 'second' | 'minute';

  export interface Options {
    style: Partial<Style>;
    precision: Step;
    onChange: (datetime: string) => void;
  }
}

declare class CanvasTimeLine {
  constructor(canvas: HTMLCanvasElement, options?: Partial<CanvasTimeLine.Options>);

  setDateTime(data: string): this;
  setRange(start: string, end: string): this;
}
