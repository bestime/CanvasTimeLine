declare namespace CanvasTimeLineTheme02 {

  export type BTDeepPartial<T = any> = {
    [P in keyof T]?: T[P] extends Function
      ? T[P]
      : T[P] extends object
      ? BTDeepPartial<T[P]>
      : T[P];
  };
  /**
   * 键值对格式的数据
   * */
  export interface Style {
    font: string;
    progressBarBackgroundColor: string,
    progressBarActiveColor: string,
    scaleLineColor: string
    scaleFontColor: string
  }

  export type Scale = 'day'|'hour'

  
export interface SelectItem {
  value: string,
  start: string,
  end: string,
  prev: string,
  next: string,
}
  export interface Options {
    scale: Scale;
    scaleSpace: number
    scaleFormat?: (datetime: string) => string
    labelFormat?: (datetime: string) => string
    style: Style;
    autoPlayInterval: number
    onChange?: (time: SelectItem, next: () => void) => void;
  }

  export type InputOptions = CanvasTimeLineTheme02.BTDeepPartial<CanvasTimeLineTheme02.Options>
}

declare class CanvasTimeLineTheme02 {
  constructor(canvas: HTMLCanvasElement, options?: CanvasTimeLineTheme02.InputOptions);

  setDateTime(data: string): this;
  dispose(): void;
  setData(data: string[]): this
}
