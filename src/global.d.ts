declare module "*.less" {
  const classes: { [key: string]: string };
  export default classes;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

type Schema = Any;

/** 领域模型 */
type DomainModel = {
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
    params: {
      name: string;
      title: string;
      in: "path" | "query" | "header" | "body";
      /** 隐藏 - [TODO] 声明不可编辑，表单容器做判断，展示只读？ */
      hidden?: boolean;
      schema: Schema;
    }[];
    responses: Schema;
  }[];
};
