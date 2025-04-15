import React from "react";

import Render from "./components/Render";
import Nocobase from "./nocobase";

type RenderParams = {
  data: Data;
};

type OnLoadParams = {
  data: Data;
  domainModel: {
    getAll: () => Promise<[]>;
  };
};

const domainPlugin = () => {
  return {
    name: "@mybricks/plugin-domain",
    title: "领域模型",
    author: "MyBricks Team",
    "author.zh": "MyBricks团队",
    version: "0.0.1",
    description: "领域模型",
    data: {
      domainModels: [
        {
          type: "nocobase",
          connect: {
            origin: "https://a_08e0ip11mv5.v7.demo-cn.nocobase.com/api",
            account: "admin@nocobase.com",
            password: "admin123",
          },
        },
      ],
    },
    contributes: {
      geoView: {
        domainModel: {
          type: "default",
          render() {},
        },
      },
      // sliderView: {
      //   tab: {
      //     title: "领域模型",
      //     render(params: RenderParams) {
      //       return <Render data={params.data} />;
      //     },
      //   },
      // },
    },
    // activate(params: OnLoadParams) {
    //   console.log("params => ", params);
    //   console.log("🚀 获取领域模型 => ", params.data);

    //   params.data.domainModels.map((domainModel) => {
    //     if (domainModel.type === "nocobase") {
    //       return new Promise(async (resolve) => {
    //         // console.log("domainModel => ", domainModel);
    //         const nocobase = new Nocobase(domainModel.connect);
    //         const domainModelNocobases = await nocobase.getDomainModels();
    //         // console.log(
    //         //   "❌ domainModelNocobases 结果 => ",
    //         //   domainModelNocobases,
    //         // );
    //         resolve(domainModelNocobases);
    //       });
    //       // const nocobaseApi = new NocobaseApi(
    //       //   domainModel.connect.origin,
    //       //   domainModel.connect.account,
    //       //   domainModel.connect.password
    //       // );
    //       // nocobaseApi
    //       //   .get("/api/v1/openapi.json")
    //       //   .then((res) => {
    //       //     console.log("获取到的结果 => ", res);
    //       //   })
    //       //   .catch((err) => {
    //       //     console.log("获取失败 => ", err);
    //       //   });
    //     }
    //   });
    // },
    onLoad(params: OnLoadParams) {
      // @ts-expect-error 测试用
      params.domainModel.getAll = () => {
        const nocobase = new Nocobase({
          origin: "https://a_08e0ip11mv5.v7.demo-cn.nocobase.com/api",
          account: "admin@nocobase.com",
          password: "admin123",
        });
        const domainModelNocobases = nocobase.getDomainModels();
        return domainModelNocobases;
        // return [
        //   {
        //     id: "users2",
        //     title: "users2",
        //     fields: [
        //       {
        //         name: "id",
        //         title: "用户ID",
        //         type: "integer",
        //       },
        //       {
        //         name: "nickname",
        //         title: "昵称",
        //         type: "string",
        //       },
        //       {
        //         name: "username",
        //         title: "用户名",
        //         type: "string",
        //       },
        //       {
        //         name: "email",
        //         title: "email",
        //         type: "string",
        //       },
        //       {
        //         name: "phone",
        //         title: "手机号码",
        //         type: "string",
        //       },
        //       {
        //         name: "password",
        //         title: "密码",
        //         type: "string",
        //       },
        //       {
        //         name: "createdAt",
        //         title: "创建时间",
        //         type: "string",
        //       },
        //       {
        //         name: "updatedAt",
        //         title: "更新时间",
        //         type: "string",
        //       },
        //     ],
        //     services: [
        //       {
        //         name: "/users:list",
        //         title: "/users:list",
        //         default: true,
        //         method: "get",
        //         params: [],
        //         returnType: {
        //           type: "object",
        //           properties: {
        //             data: "number",
        //           },
        //         },
        //       },
        //       {
        //         name: "/users:get",
        //         title: "/users:get",
        //         default: false,
        //         method: "get",
        //         params: [
        //           {
        //             name: "filterByTk",
        //             title: "user id",
        //             type: "integer",
        //           },
        //         ],
        //         returnType: {
        //           type: "object",
        //           properties: {
        //             id: {
        //               type: "integer",
        //               description: "用户ID",
        //             },
        //             nickname: {
        //               type: "string",
        //               description: "昵称",
        //             },
        //             username: {
        //               type: "string",
        //               description: "用户名",
        //             },
        //             email: {
        //               type: "string",
        //               description: "email",
        //             },
        //             phone: {
        //               type: "string",
        //               description: "手机号码",
        //             },
        //             password: {
        //               type: "string",
        //               description: "密码",
        //             },
        //             createdAt: {
        //               type: "string",
        //               format: "date-time",
        //               description: "创建时间",
        //             },
        //             updatedAt: {
        //               type: "string",
        //               format: "date-time",
        //               description: "更新时间",
        //             },
        //           },
        //         },
        //       },
        //       {
        //         name: "/users:create",
        //         title: "/users:create",
        //         default: false,
        //         method: "post",
        //         params: [
        //           {
        //             name: "id",
        //             title: "用户ID",
        //             type: "integer",
        //           },
        //           {
        //             name: "nickname",
        //             title: "昵称",
        //             type: "string",
        //           },
        //           {
        //             name: "username",
        //             title: "用户名",
        //             type: "string",
        //           },
        //           {
        //             name: "email",
        //             title: "email",
        //             type: "string",
        //           },
        //           {
        //             name: "phone",
        //             title: "手机号码",
        //             type: "string",
        //           },
        //           {
        //             name: "password",
        //             title: "密码",
        //             type: "string",
        //           },
        //           {
        //             name: "createdAt",
        //             title: "创建时间",
        //             type: "string",
        //           },
        //           {
        //             name: "updatedAt",
        //             title: "更新时间",
        //             type: "string",
        //           },
        //         ],
        //         returnType: {
        //           type: "object",
        //           properties: {
        //             id: {
        //               type: "integer",
        //               description: "用户ID",
        //             },
        //             nickname: {
        //               type: "string",
        //               description: "昵称",
        //             },
        //             username: {
        //               type: "string",
        //               description: "用户名",
        //             },
        //             email: {
        //               type: "string",
        //               description: "email",
        //             },
        //             phone: {
        //               type: "string",
        //               description: "手机号码",
        //             },
        //             password: {
        //               type: "string",
        //               description: "密码",
        //             },
        //             createdAt: {
        //               type: "string",
        //               format: "date-time",
        //               description: "创建时间",
        //             },
        //             updatedAt: {
        //               type: "string",
        //               format: "date-time",
        //               description: "更新时间",
        //             },
        //           },
        //         },
        //       },
        //       {
        //         name: "/users:update",
        //         title: "/users:update",
        //         default: false,
        //         method: "post",
        //         params: [
        //           {
        //             name: "filterByTk",
        //             title: "user id",
        //             type: "integer",
        //           },
        //           {
        //             name: "id",
        //             title: "用户ID",
        //             type: "integer",
        //           },
        //           {
        //             name: "nickname",
        //             title: "昵称",
        //             type: "string",
        //           },
        //           {
        //             name: "username",
        //             title: "用户名",
        //             type: "string",
        //           },
        //           {
        //             name: "email",
        //             title: "email",
        //             type: "string",
        //           },
        //           {
        //             name: "phone",
        //             title: "手机号码",
        //             type: "string",
        //           },
        //           {
        //             name: "password",
        //             title: "密码",
        //             type: "string",
        //           },
        //           {
        //             name: "createdAt",
        //             title: "创建时间",
        //             type: "string",
        //           },
        //           {
        //             name: "updatedAt",
        //             title: "更新时间",
        //             type: "string",
        //           },
        //         ],
        //         returnType: {
        //           type: "object",
        //           properties: {
        //             id: {
        //               type: "integer",
        //               description: "用户ID",
        //             },
        //             nickname: {
        //               type: "string",
        //               description: "昵称",
        //             },
        //             username: {
        //               type: "string",
        //               description: "用户名",
        //             },
        //             email: {
        //               type: "string",
        //               description: "email",
        //             },
        //             phone: {
        //               type: "string",
        //               description: "手机号码",
        //             },
        //             password: {
        //               type: "string",
        //               description: "密码",
        //             },
        //             createdAt: {
        //               type: "string",
        //               format: "date-time",
        //               description: "创建时间",
        //             },
        //             updatedAt: {
        //               type: "string",
        //               format: "date-time",
        //               description: "更新时间",
        //             },
        //           },
        //         },
        //       },
        //       {
        //         name: "/users:destroy",
        //         title: "/users:destroy",
        //         default: false,
        //         method: "post",
        //         params: [
        //           {
        //             name: "filterByTk",
        //             title: "role name",
        //             type: "string",
        //           },
        //         ],
        //         returnType: {
        //           type: "object",
        //           properties: {
        //             data: "number",
        //           },
        //         },
        //       },
        //     ],
        //   },
        // ];
      };
    },
  };
};

export default domainPlugin;
