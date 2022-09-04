// type RenderType = 'input' | 'select' | 'custom';

// interface RenderTypeMap {
//     'input': string;
//     'select': 'string';
//     'custom': any;
// }

// interface FormConfig {
//     renderType: RenderType;
//     name: string;
//     required: boolean;
// }

// const formVirtualConfig = [
//     {
//         renderType: 'input',
//         name: 'foo',
//         required: true,
//     },
//     {
//         renderType: 'custom',
//         name: 'bar',
//         required: false,
//     },
// ] as const;

// type ToFormFields<Type extends RenderType, Req extends boolean, Name extends string> = Req extends true ? Required<Record<Name, RenderTypeMap[Type]>> : Partial<Record<Name, RenderTypeMap[Type]>>;

// type T = typeof formVirtualConfig;
// type FormFields = {
//     [P in keyof T as P extends `${number}` ? T[P]['required'] extends true ? T[P]['name'] : never : never]: RenderTypeMap[T[P]['renderType']];
// } &
// {
//     [P in keyof T as P extends `${number}` ? T[P]['required'] extends false ? T[P]['name'] : never : never]?: RenderTypeMap[T[P]['renderType']];
// }
