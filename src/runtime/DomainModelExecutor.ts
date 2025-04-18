import axios from "axios";
import type { Data } from "../index";

type CallOptions = {
  /** 模型 */
  model: {
    /** 实例ID */
    id: string;
    /** 模型ID */
    defId: string;
    /** 服务 */
    service: DomainModel["services"][0];
  };
  /** 参数 */
  params: Any;
  /** 配置 */
  configs: {
    /**
     * 调用类型
     * call: 仅调用服务
     * registerProxy: 注册服务监听
     * registerStatic: 注册静态数据推送
     */
    callType: "register" | "call";

    /**
     * 注册模式
     * selfCall: 自调用服务
     * staticPush: 静态数据推送
     */
    registerMode: "selfCall" | "staticPush";

    /**
     * 自动调用一次
     * @default true
     */
    autoCallOnce: boolean;
  };
};

type Pipeline = (error: Any, loading: boolean, result?: Any) => void;

type Service = Record<
  string,
  {
    value: Any;
    registrations: Set<{
      pipeline: Pipeline;
      call: (newParams: Any) => void;
      destroy: () => void;
      model: CallOptions["model"];
      configs: CallOptions["configs"];
      _cache: {
        params: CallOptions["params"];
      };
    }>;
    service: CallOptions["model"]["service"];
  }
>;

type Instance = {
  service: Service;
};

type InstanceMap = Record<string, Instance>;

const EmptyValue = Symbol("DomainModel_EmptyValue");

class DomainModelExecutor {
  private _domainModelMap: Record<string, Data["domainModels"][0]> = {};
  private _instanceMap: InstanceMap = {};

  constructor(data: Data) {
    data.domainModels.forEach((domainModel) => {
      this._domainModelMap[domainModel.id] = domainModel;
    });
  }

  call(options: CallOptions, pipeline: Pipeline) {
    const { model, params, configs } = options;
    const {
      callType = "call",
      autoCallOnce = true,
      registerMode = "selfCall",
    } = configs;
    const { defId, service } = model;
    const domainModel = this._domainModelMap[defId.split(".")[0]];

    const _service = this.getOrCreateService(
      this.getOrCreateInstance(model.id),
      model.service,
    );

    const registration = {
      pipeline,
      call: (newParams: Any) => {
        if (!domainModel) {
          pipeline(new Error(`未查询到相应的领域模型 - ${defId}`), false);
          return;
        }
        _service.value = EmptyValue;

        if (service.method === "get") {
          // [TEMP] get只需要触发注册类型为静态数据推送的pipeline
          _service.registrations.forEach((serviceRegistration) => {
            if (serviceRegistration.call !== registration.call) {
              if (serviceRegistration.configs.registerMode === "staticPush") {
                serviceRegistration.pipeline(null, true);
              }
            }
          });
        }

        // [TODO] configs.next 防止循环调用，验证下，是否会出现死循环
        registration._cache.params = newParams;
        if (domainModel.type === "nocobase") {
          let url = domainModel.connect.baseURL + service.name;
          const params: Record<string, Any> = {};
          const data: Record<string, Any> = {};
          const headers: Record<string, Any> = {
            authorization: `Bearer ${domainModel.connect.token}`,
          };

          const newParamsKeySet = new Set(Object.keys(newParams));
          service.params.forEach(({ name, in: po }) => {
            if (name === "filterByTk") {
              params[name] = newParams[name] || newParams["id"];
              newParamsKeySet.delete("id");
              newParamsKeySet.delete("filterByTk");
            } else {
              if (po === "body") {
                data[name] = newParams[name];
              } else if (po === "path") {
                url = url.replace(`{${name}}`, newParams[name]);
              } else if (po === "query") {
                params[name] = newParams[name];
              } else if (po === "header") {
                headers[name] = newParams[name];
              }
              newParamsKeySet.delete(name);
            }
          });

          pipeline(null, true);

          axios({
            url,
            method: service.method,
            params,
            data,
            headers,
            withCredentials: false,
          })
            .then((result) => {
              pipeline(null, false, result.data);
              if (service.method === "post") {
                // [TEMP] 所有post均认为是update，执行完成后调用所有get调用
                const _instance = this.getOrCreateInstance(model.id);
                Object.entries(_instance.service).forEach(
                  ([, { service, registrations }]) => {
                    if (service.method === "get") {
                      registrations.forEach((serviceRegistration) => {
                        if (
                          serviceRegistration.configs.registerMode ===
                          "selfCall"
                        ) {
                          serviceRegistration.call(
                            serviceRegistration._cache.params,
                          );
                        }
                      });
                    }
                  },
                );
              } else if (service.method === "get") {
                // [TEMP] get只需要触发注册类型为静态数据推送的pipeline
                _service.value = result.data;
                _service.registrations.forEach((serviceRegistration) => {
                  if (serviceRegistration.call !== registration.call) {
                    if (
                      serviceRegistration.configs.registerMode === "staticPush"
                    ) {
                      serviceRegistration.pipeline(null, false, result.data);
                    }
                  }
                });
              }
            })
            .catch((error) => {
              pipeline(error, false);
            });
        }
      },
      destroy: () => {
        _service.registrations.delete(registration);
      },
      model,
      configs,
      _cache: {
        params,
      },
    };

    if (callType === "register") {
      // 注册
      _service.registrations.add(registration);
      if (registerMode === "staticPush" && _service.value !== EmptyValue) {
        pipeline(null, false, _service.value);
      }
    }

    if (autoCallOnce) {
      // 自动调用一次
      registration.call(params);
    }

    return registration;
  }

  /** 获取或创建模型 */
  private getOrCreateInstance(instanceId: string) {
    if (!this._instanceMap[instanceId]) {
      this._instanceMap[instanceId] = {
        service: {},
      };
    }
    return this._instanceMap[instanceId];
  }

  /** 获取或创建服务 */
  private getOrCreateService(
    instance: Instance,
    service: CallOptions["model"]["service"],
  ) {
    if (!instance.service[service.name]) {
      instance.service[service.name] = {
        value: EmptyValue,
        registrations: new Set(),
        service,
      };
    }
    return instance.service[service.name];
  }
}

export default DomainModelExecutor;
