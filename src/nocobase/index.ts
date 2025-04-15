import { APIClient } from "@nocobase/sdk";
import { asyncTryCatch } from "@luckybytes/utils";
import convertSwaggerToDomainModal from "./convertSwaggerToDomainModal";
import testjson from "./test.json";

type Connect = DomainModelNocobase["connect"];

class Nocobase {
  private _APIClient: APIClient;

  constructor(private connect: Connect) {
    /** 初始化API */
    this._APIClient = new APIClient({
      baseURL: connect.origin,
    });
  }

  getDomainModels() {
    return convertSwaggerToDomainModal(testjson as Swagger);
    // if (!this.login()) {
    //   return [];
    // }

    // const { _APIClient } = this;

    // const [swaggerGetError, swaggerGetSuccess] = await asyncTryCatch(
    //   _APIClient.request.bind(_APIClient),
    //   {
    //     method: "get",
    //     url: "/swagger:get",
    //   },
    // );

    // if (swaggerGetError) {
    //   return [];
    // }

    // return convertSwaggerToDomainModal(swaggerGetSuccess.data as Swagger);
  }

  /** 登录 */
  async login() {
    const { _APIClient } = this;
    /** 验证是否登录 */
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

    const { auth } = _APIClient;
    /** 账号密码登录 */
    const [, signInSuccess] = await asyncTryCatch(auth.signIn.bind(auth), {
      account: this.connect.account,
      password: this.connect.password,
    });
    if (signInSuccess) {
      return true;
    }

    return false;
  }
}

export default Nocobase;

export type Parameters = {
  name: string;
  in: "query" | "path" | "header";
  description: string;
  schema?: Schema;
  content?: {
    "application/json": {
      schema: Schema;
    };
  };
};

export type Schemas = Schema;

export type Swagger = {
  paths: Record<
    string,
    Record<
      string,
      {
        /** 暂时认为只有一个tag */
        tags: [string];

        /** url、query 参数 */
        parameters?: Array<{ $ref: string } | Parameters>;

        /** body 参数 */
        requestBody?: {
          required?: boolean; // 目前看如果有这个属性值一定为true
          content: {
            "application/json": {
              schema: { $ref: string } | Schema;
            };
          };
        };

        /** 返回值 */
        responses?: {
          200: {
            content?: {
              "application/json": {
                schema: { $ref: string } | Schema;
              };
            };
          };
        };
      }
    >
  >;
  components: {
    parameters: Record<string, Parameters>;
    schemas: Record<string, Schema>;
  };
};
