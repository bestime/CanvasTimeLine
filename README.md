### 带刻度的时间轴

- 在线示例(https://bestime.github.io/CanvasTimeLine/)
- 预览图片
  ![image](./sources/demo.png)

CanvasTimeLine.d.ts 声明文件
```ts
declare class CanvasTimeLine {
  constructor(canvas: HTMLCanvasElement, options?: Partial<CanvasTimeLine.Options>);

  setDateTime(data: string): this;
  setRange(start: string, end: string): this;
}
```