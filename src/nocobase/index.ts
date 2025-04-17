import { asyncTryCatch } from "@luckybytes/utils";
import { DomainModelNocobase } from "./type";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { getLocaleText } from "./locale";

type Axios<R = unknown> = (
  config: AxiosRequestConfig<unknown>,
) => Promise<AxiosResponse<{ data: R }, Any>>;

type Connect = DomainModelNocobase["connect"] & {
  [key: string]: Any;
};

/**
 * TODO
 * 1. schema映射为mybricks规范，目前默认全是string
 * 2. 逐步补充可用的params
 * 3. 失败 {"errors":[{"message":"ID must be unique"}]}
 */

/** 数据源 */
type Collections = {
  name: string;
  title: string;
  fields: Fields;
  /**
   * true - 不展示的表
   */
  hidden: boolean;
}[];

/** 字段列表 */
type Fields = {
  name: string;
  uiSchema?: {
    title: string;
    "x-read-pretty"?: boolean;
  };
}[];

class Nocobase {
  constructor(private _connect: Connect) {}

  async getDomainModels() {
    const domainModels: DomainModel[] = [];

    // 仅获取所有主数据源
    const [error, success] = await asyncTryCatch(axios as Axios<Collections>, {
      url: `${this._connect.baseURL}/collections:listMeta`,
      method: "get",
      headers: {
        authorization: `Bearer ${this._connect.token}`,
      },
      withCredentials: false,
    });

    if (error) {
      console.error(`[nocobase - /collections:listMeta] ${error}`);
      return [];
    }

    success.data.data
      .filter(({ hidden }) => !hidden)
      .map(async (collection, index) => {
        const fields = collection.fields
          .filter((field) => {
            return field.uiSchema;
          })
          .map((field) => {
            field.uiSchema!.title =
              getLocaleText(field.uiSchema!.title) || field.name;
            return field;
          });

        const recordProperties = fields.reduce<Record<string, Schema>>(
          (pre, cur) => {
            pre[cur.name] = {
              type: "string",
              title: cur.uiSchema!.title,
            };
            return pre;
          },
          {},
        );

        domainModels[index] = {
          id: collection.name,
          title: getLocaleText(collection.title) || collection.name,
          fields: fields.map((field) => {
            return {
              name: field.name,
              title: field.uiSchema!.title,
              schema: {
                type: "string",
              },
            };
          }),
          services: [
            // list
            {
              name: `/${collection.name}:list`,
              title: `/${collection.name}:list`,
              method: "get",
              params: [
                {
                  name: "pageSize",
                  title: "pageSize",
                  in: "query",
                  schema: {
                    type: "number",
                  },
                },
                {
                  name: "page",
                  title: "page",
                  in: "query",
                  schema: {
                    type: "number",
                  },
                },
              ],
              responses: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: recordProperties,
                    },
                  },
                  meta: {
                    type: "object",
                    properties: {
                      count: {
                        type: "number",
                      },
                      page: {
                        type: "number",
                      },
                      pageSize: {
                        type: "number",
                      },
                      totalPage: {
                        type: "number",
                      },
                    },
                  },
                },
                required: ["data"],
              },
            },
            // get
            {
              name: `/${collection.name}:get`,
              title: `/${collection.name}:get`,
              method: "get",
              params: [
                {
                  name: "filterByTk",
                  title: "filterByTk",
                  in: "query",
                  schema: {
                    type: "number",
                  },
                },
              ],
              responses: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: recordProperties,
                  },
                },
              },
            },
            // create
            {
              name: `/${collection.name}:create`,
              title: `/${collection.name}:create`,
              method: "post",
              params: fields
                .filter((filed) => {
                  // 目前根据数据结构分析如下判断为主外键字段以及系统字段，不需要在创建时传递
                  return !filed.uiSchema!["x-read-pretty"];
                })
                .map((field) => {
                  return {
                    name: field.name,
                    title: field.uiSchema!.title,
                    in: "body",
                    schema: {
                      type: "string",
                    },
                  };
                }),
              responses: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: recordProperties,
                  },
                },
              },
            },
            // update
            {
              name: `/${collection.name}:update`,
              title: `/${collection.name}:update`,
              method: "post",
              params: [
                {
                  name: "filterByTk",
                  title: "filterByTk",
                  in: "query",
                  schema: {
                    type: "number",
                  },
                } as DomainModel["services"][0]["params"][0],
              ].concat(
                fields
                  .filter((filed) => {
                    // 目前根据数据结构分析如下判断为主外键字段以及系统字段，不需要在更新时传递
                    return !filed.uiSchema!["x-read-pretty"];
                  })
                  .map((field) => {
                    return {
                      name: field.name,
                      title: field.uiSchema!.title,
                      in: "body",
                      schema: {
                        type: "string",
                      },
                    };
                  }),
              ),
              responses: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: recordProperties,
                  },
                },
              },
            },
            // destroy
            {
              name: `/${collection.name}:destroy`,
              title: `/${collection.name}:destroy`,
              method: "post",
              params: [
                {
                  name: "filterByTk",
                  title: "filterByTk",
                  in: "query",
                  schema: {
                    type: "number",
                  },
                },
              ],
              responses: {
                type: "object",
                properties: {
                  data: {
                    enum: [0, 1],
                  },
                },
              },
            },
          ],
        };
      });

    return domainModels;
  }

  /** 鉴权 */
  async authCheck() {
    /** 验证token是否过期 */
    const [error, checkSuccess] = await asyncTryCatch(axios as Axios, {
      url: `${this._connect.baseURL}/auth:check`,
      method: "get",
      headers: {
        authorization: `Bearer ${this._connect.token}`,
      },
      withCredentials: false,
    });

    if (checkSuccess) {
      return true;
    }

    console.error(`[nocobase - /auth:check] ${error}`);

    return false;
  }
}

export default Nocobase;

export type { DomainModelNocobase };
