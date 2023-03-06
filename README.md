### 带刻度的时间轴

![image](./sources/demo.png)

CanvasTimeLine.d.ts 声明文件
```ts
declare class CanvasTimeLine {
  constructor(canvas: HTMLCanvasElement, options?: Partial<CanvasTimeLine.Options>);

  setDateTime(data: string): this;
  setRange(start: string, end: string): this;
}
```