declare module "*.less" {
  const classes: { [key: string]: string };
  export default classes;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

type Schema = Any;

/** 领域模型，MyBricks引擎接收的数据格式 */
type DomainModel = {
  id: string;
  title: string;
  domainAry: {
    id: string;
    title: string;
    fields: {
      name: string;
      title: string;
      schema: Schema;
    }[];
    services: {
      name: string;
      title: string;
      method: "get" | "post";
      type: "list" | "get" | "create" | "update" | "delete";
      params: {
        name: string;
        title: string;
        in: "path" | "query" | "header" | "body";
        schema: Schema;
        /** 声明只读 */
        ["x-read-only"]?: boolean;
        /** 替换name */
        ["x-replace-name"]?: string;
      }[];
      responses: Schema;
    }[];
  }[];
};
