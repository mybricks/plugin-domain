import { APIClient } from "@nocobase/sdk";
import { asyncTryCatch } from "@luckybytes/utils";
import { DomainModelNocobase } from "./type";

type Connect = DomainModelNocobase["connect"] & {
  [key: string]: Any;
};

/**
 * TODO
 * 1. schema映射为mybricks规范，目前默认全是string
 * 2. 逐步补充可用的params
 * 3. 失败 {"errors":[{"message":"ID must be unique"}]}
 */

class Nocobase {
  private _APIClient: APIClient;

  constructor(connect: Connect) {
    /** 初始化API */
    this._APIClient = new APIClient({
      baseURL: connect.baseURL,
      storagePrefix: connect.storagePrefix,
      withCredentials: false,
    });

    this._APIClient.auth.token = connect.token;
  }

  async getDomainModels() {
    const authCheckSuccess = await this.authCheck();
    if (!authCheckSuccess) {
      return [];
    }

    /** 数据源 */
    type Collections = {
      name: string;
      title: string;
    }[];

    /** 字段列表 */
    type Fields = {
      name: string;
      uiSchema?: {
        "x-read-pretty"?: boolean;
      };
    }[];

    const domainModels: DomainModel[] = [];

    // 仅获取所有主数据源
    const {
      data: { data: collections },
    } = (await this._APIClient.resource("collections").list({
      paginate: false,
      sort: ["sort"],
      filter: { hidden: { $isFalsy: true } },
    })) as { data: { data: Collections } };

    await Promise.all(
      collections.map(async (collection, index) => {
        const {
          data: { data: fields },
        } = (await this._APIClient
          .resource("collections.fields", collection.name)
          .list({
            paginate: false,
            sort: ["sort"],
            filter: {
              $or: [
                { "interface.$not": null },
                { "options.source.$notEmpty": true },
              ],
            },
          })) as { data: { data: Fields } };

        const recordProperties = fields.reduce<Record<string, Schema>>(
          (pre, cur) => {
            pre[cur.name] = {
              type: "string",
            };
            return pre;
          },
          {},
        );

        domainModels[index] = {
          id: collection.name,
          title: collection.title.startsWith("{{t")
            ? collection.name
            : collection.title,
          fields: fields.map((field) => {
            return {
              name: field.name,
              title: field.name,
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
                  if (filed.uiSchema) {
                    return !filed.uiSchema["x-read-pretty"];
                  }

                  return true;
                })
                .map((field) => {
                  return {
                    name: field.name,
                    title: field.name,
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
                    if (filed.uiSchema) {
                      return !filed.uiSchema["x-read-pretty"];
                    }

                    return true;
                  })
                  .map((field) => {
                    return {
                      name: field.name,
                      title: field.name,
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
      }),
    );

    return domainModels;
  }

  /** 鉴权 */
  async authCheck() {
    const { _APIClient } = this;
    /** 验证token是否过期 */
    const [, checkSuccess] = await asyncTryCatch(
      _APIClient.request.bind(_APIClient),
      {
        method: "get",
        url: "/auth:check",
      },
    );

    if (checkSuccess) {
      return true;
    }

    console.error("[nocobase - /auth:check] 鉴权未通过，请检查token配置。");

    return false;
  }
}

// class APICollections {
//   constructor(private _APIClient: APIClient) {}
// }

export default Nocobase;

export type { DomainModelNocobase };
