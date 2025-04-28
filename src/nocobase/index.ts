import { asyncTryCatch } from "@luckybytes/utils";
import axios from "axios";
import { getLocaleText } from "./locale";
import { fieldConvert } from "./utils";
import type { Axios } from "../type";
import type { DomainModelNocobase, Connect, Collections } from "./type";

class Nocobase {
  constructor(private _connect: Connect) {}

  /** 鉴权 */
  async authCheck() {
    return await authCheck(this._connect);
  }
}

/** 鉴权 */
const authCheck = async (connect: DomainModelNocobase["connect"]) => {
  /** 验证token是否过期 */
  const [error, checkSuccess] = await asyncTryCatch(axios as Axios, {
    url: `${connect.baseURL}/auth:check`,
    method: "get",
    headers: {
      authorization: `Bearer ${connect.token}`,
    },
    withCredentials: false,
  });

  if (checkSuccess) {
    return true;
  }

  console.error(`[nocobase - /auth:check] ${error}`);

  return false;
};

/** 获取领域模型列表 */
const getDomainModels = async (domainModel: DomainModelNocobase) => {
  const { id, connect } = domainModel;
  // const domainModels: DomainModel[] = [];
  // 获取数据源列表
  const dataSourceList = await getDataSourceList(connect);
  const domainModels: DomainModel[] = [];

  await Promise.all(
    dataSourceList.map(async (dataSource, index) => {
      const domainAry: DomainModel["domainAry"] = [];
      const collectionList = await getCollectionList(connect, dataSource);
      collectionList
        .filter(({ hidden }) => !hidden)
        .map(async (collection) => {
          const fields = collection.fields
            .filter((field) => {
              return field.uiSchema;
            })
            .map((field) => {
              return fieldConvert(field);
            });

          const recordProperties = fields
            .filter((field) => {
              return !field.hidden;
            })
            .reduce<Record<string, Schema>>((pre, cur) => {
              pre[cur.name] = {
                type: cur.uiSchema!.type,
                title: cur.uiSchema!.title,
              };
              return pre;
            }, {});

          domainAry.push({
            id: `${id}.${collection.name}`,
            title: getLocaleText(collection.title) || collection.name,
            fields: fields
              .filter((field) => {
                return !field.hidden;
              })
              .map((field) => {
                return {
                  name: field.name,
                  title: field.uiSchema!.title,
                  schema: {
                    type: field.uiSchema!.type,
                  },
                };
              }),
            services: [
              // list
              {
                name: `/${collection.name}:list`,
                title: `/${collection.name}:list`,
                method: "get",
                type: "list",
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
                type: "get",
                params: [
                  {
                    name: "id",
                    title: "ID",
                    in: "query",
                    schema: {
                      type: "number",
                    },
                    ["x-read-only"]: true,
                    ["x-replace-name"]: "filterByTk",
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
                type: "create",
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
                        type: field.uiSchema!.type,
                      },
                      uiSchema: {
                        component: field.uiSchema!["x-component"],
                        validator: field.uiSchema!["x-validator"],
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
                type: "update",
                params: [
                  {
                    name: "id",
                    title: "ID",
                    in: "query",
                    schema: {
                      type: "number",
                    },
                    ["x-read-only"]: true,
                    ["x-replace-name"]: "filterByTk",
                  } as DomainModel["domainAry"][0]["services"][0]["params"][0],
                ].concat(
                  fields
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
                          type: field.uiSchema!.type,
                        },
                        uiSchema: {
                          component: field.uiSchema!["x-component"],
                          validator: field.uiSchema!["x-validator"],
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
                type: "delete",
                params: [
                  {
                    name: "id",
                    title: "ID",
                    in: "query",
                    schema: {
                      type: "number",
                    },
                    ["x-read-only"]: true,
                    ["x-replace-name"]: "filterByTk",
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
          });
        });

      domainModels[index] = {
        id: dataSource.key,
        title: getLocaleText(dataSource.displayName || dataSource.key),
        domainAry,
      };
    }),
  );

  return domainModels;
};

type DataSource = {
  key: string;
  displayName: string;
};

/** 获取数据源列表 */
const getDataSourceList = async (connect: DomainModelNocobase["connect"]) => {
  const [error, success] = await asyncTryCatch(axios as Axios<DataSource[]>, {
    url: `${connect.baseURL}/dataSources:list`,
    method: "get",
    headers: {
      authorization: `Bearer ${connect.token}`,
    },
    withCredentials: false,
    params: {
      paginate: false,
    },
  });

  if (error) {
    console.error(`[nocobase - /dataSources:list] ${error}`);
    return [];
  }

  return success.data.data;
};

/** 获取数据表列表 */
const getCollectionList = async (
  connect: DomainModelNocobase["connect"],
  dataSource: DataSource,
) => {
  const [error, success] = await asyncTryCatch(axios as Axios<Collections>, {
    url: `${connect.baseURL}/dataSources/${dataSource.key}/collections:list`,
    method: "get",
    headers: {
      authorization: `Bearer ${connect.token}`,
    },
    withCredentials: false,
    params: {
      paginate: false,
      appends: ["fields", "category"],
      filter: JSON.stringify({ hidden: { $isFalsy: true } }),
    },
  });

  if (error) {
    console.error(`[nocobase - /collections:list] ${error}`);
    return [];
  }

  return success.data.data
    .sort((a, b) => {
      return a.sort > b.sort ? 1 : -1;
    })
    .map((collection) => {
      return {
        ...collection,
        fields: collection.fields.sort((a, b) => {
          return a.__sort > b.__sort ? 1 : -1;
        }),
      };
    });
};

export default Nocobase;

export { authCheck, getDomainModels };

export type { DomainModelNocobase };
