export var setBrowserTab: (param?: { title: string; icon: any }) => void;

export var getPageQuery: () => any;

interface TimerParam {
  callback: () => {};
  param: any;
  time: number;
  pagePath: string;
}
export var timer: (timerParam: TimerParam) => void;

export var buildTree: (data: Array<any>, props?: any) => void;
