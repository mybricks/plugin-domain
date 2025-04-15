import type { Swagger, Parameters } from "./index";

const retrieveInfomationFromSwaggerByRef = (swagger: Swagger, $ref: string) => {
  let result = swagger as Any;
  $ref
    .replace("#/", "")
    .split("/")
    .forEach((key) => {
      result = result[key];
    });

  return result;
};

const convertSwaggerToDomainModal = (swagger: Swagger) => {
  type Params = (Omit<Parameters, "in"> & {
    in?: Parameters["in"];
    title: string;
  })[];
  type FieldsMap = Record<
    string,
    {
      name: string;
      title: string;
      schema: Schema;
    }
  >;
  type Services = {
    name: string;
    title: string;
    default: boolean;
    params: Params;
    returnType: Any;
  }[];

  console.log("🚀 swagger => ", swagger);
  const { paths } = swagger;
  const tagToServicesMap: Record<
    string,
    {
      fieldsMap: FieldsMap;
      services: Services;
    }
  > = {};

  Object.entries(paths).forEach(([path, service]) => {
    const method = service[Object.keys(service)[0]];
    const tag = method.tags?.[0] || "default";
    let isDefault = false;

    if (!tagToServicesMap[tag]) {
      tagToServicesMap[tag] = {
        fieldsMap: {},
        services: [],
      };
      // 默认第一个是默认服务
      isDefault = true;
    }
    const { services, fieldsMap } = tagToServicesMap[tag];
    const params: Params = [];

    // url、query 参数
    if (method.parameters) {
      method.parameters.forEach((param) => {
        if ("$ref" in param) {
          param = retrieveInfomationFromSwaggerByRef(
            swagger,
            param.$ref,
          ) as Parameters;

          params.push({
            ...param,
            title: param.description,
            schema: param.schema || param.content?.["application/json"].schema,
          });
        } else {
          params.push({
            ...param,
            title: param.description,
          });
        }
      });
    }

    // body 参数
    if (method.requestBody) {
      let requestBodySchema =
        method.requestBody.content["application/json"].schema;

      if ("$ref" in requestBodySchema) {
        requestBodySchema = retrieveInfomationFromSwaggerByRef(
          swagger,
          requestBodySchema.$ref,
        );
        if (
          requestBodySchema.type === "object" &&
          requestBodySchema.properties
        ) {
          Object.entries(requestBodySchema.properties).forEach(
            ([property, info]: [string, Any]) => {
              if (!fieldsMap[property]) {
                fieldsMap[property] = {
                  name: property,
                  title: info.description
                    ? `${property}（${info.description}）`
                    : property,
                  schema: info,
                };
              }
              params.push({
                name: property,
                title: info.description,
                description: info.description,
                schema: info,
              });
            },
          );
        }
      }
    }

    // 返回值
    let returnType: Schema = {
      type: "any",
    };
    if (method.responses?.[200]?.content) {
      const schema = method.responses[200].content["application/json"].schema;
      if ("$ref" in schema) {
        returnType = retrieveInfomationFromSwaggerByRef(swagger, schema.$ref);
      } else if (schema.type === "array") {
        if ("$ref" in schema.items) {
          returnType = {
            ...schema,
            items: retrieveInfomationFromSwaggerByRef(
              swagger,
              schema.items.$ref,
            ),
          };
        } else {
          returnType = schema;
        }
      }
    }
    if (tag === "apiKeys") {
      console.log("returnType => ", returnType);
      console.log(
        666,
        method.responses?.[200]?.content?.["application/json"].schema,
      );
    }
    if (returnType.type === "object") {
      Object.entries(returnType.properties).forEach(
        ([property, info]: [string, Any]) => {
          if (!fieldsMap[property]) {
            fieldsMap[property] = {
              name: property,
              title: info.description
                ? `${property}（${info.description}）`
                : property,
              schema: info,
            };
          }
        },
      );
    } else if (returnType.type === "array" && returnType.items.properties) {
      Object.entries(returnType.items.properties).forEach(
        ([property, info]: [string, Any]) => {
          if (!fieldsMap[property]) {
            fieldsMap[property] = {
              name: property,
              title: info.description
                ? `${property}（${info.description}）`
                : property,
              schema: info,
            };
          }
        },
      );
    }

    // 添加服务
    services.push({
      name: path,
      title: path,
      default: isDefault,
      params,
      returnType,
    });
  });

  const domainModels: {
    id: string;
    title: string;
    fields: { name: string; title: string; schema: Schema }[];
    services: Services;
  }[] = [];

  console.log("tagToServicesMap => ", tagToServicesMap);

  Object.entries(tagToServicesMap).forEach(([tag, { fieldsMap, services }]) => {
    domainModels.push({
      id: tag,
      title: tag,
      fields: Object.entries(fieldsMap).map(([, filed]) => {
        return filed;
      }),
      services,
    });
  });

  return domainModels;
};

export default convertSwaggerToDomainModal;
