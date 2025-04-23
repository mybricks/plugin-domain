export type DomainModelNocobase = {
  id: string;
  type: "nocobase";
  connect: {
    /** https://xxxx/api */
    baseURL: string;
    token: string;
  };
};

export type Connect = DomainModelNocobase["connect"] & {
  [key: string]: Any;
};

/** 数据源 */
export type Collections = {
  name: string;
  title: string;
  fields: Fields;
  /**
   * true - 不展示的表
   */
  hidden: boolean;
}[];

/** 字段列表 */
export type Fields = {
  name: string;
  type: string;
  /**
   * true - 不展示的字段
   */
  hidden?: boolean;
  uiSchema?: {
    title: string;
    type: string;
    /** 组件 */
    "x-component": string;
    /** 校验 */
    "x-validator"?: string;
    /**
     * true - 不参与表单提交
     */
    "x-read-pretty"?: boolean;
  };
}[];
