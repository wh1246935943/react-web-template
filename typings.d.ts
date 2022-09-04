declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}

declare type DataType =
  | 'boolean'
  | 'number'
  | 'string'
  | 'function'
  | 'array'
  | 'date'
  | 'regExp'
  | 'undefined'
  | 'null'
  | 'object'
  | 'formData';

type Moment = import('moment').Moment;

declare interface TimeInterval {
  endTime: string;
  startTime: string;
  timeMoment: Moment[];
  format: (m: Moment, t: string) => string;
}

interface Window {
  getTimeInterval: (param: number, dateFormat: string) => TimeInterval;
  imgError: (e: Event, src?: string) => void;
  typeOf: (params: any) => DataType;
  getUnreadTotal: () => void;
  fwProjectConfig: any;
}
declare var typeOf: Window['typeOf'];
declare var imgError: Window['imgError'];
declare var getTimeInterval: Window['getTimeInterval'];
declare var getUnreadTotal: Window['getUnreadTotal'];
declare var fwProjectConfig: Window['fwProjectConfig'];

interface Array<T> {
  delItem: (param: any) => number;
}
