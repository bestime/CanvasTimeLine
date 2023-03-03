
declare namespace CanvasTimeLine {
  /**
   * 键值对格式的数据
   * */
  export interface Style {
    backgroundColor: string,
  }

  export type Step = 'second' | 'minute'

  export interface Options {
    style: Style,
    precision: Step
  }
}
