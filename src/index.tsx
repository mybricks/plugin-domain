import React from "react";
import context from "./context";
import Render from "./components/Render";
import { pluginIcon } from "./components/Icon";
import DomainModelExecutor from "./runtime/DomainModelExecutor";
import { getDomainModels as getNocobaseDomainModels } from "./nocobase";
import type { DomainModelNocobase } from "./nocobase";

type TabRenderParams = {
  data: Data;
};

type DomainModelOther = {
  id: string;
  type: "other";
};

type Data = {
  domainModels: (DomainModelNocobase | DomainModelOther)[];
};

type OnLoadParams = {
  data: Data;
  domainModel: {
    getAll: () => Promise<DomainModel[]>;
  };
};

type ToJSONParams = {
  data: Data;
};

const domainPlugin = () => {
  let domainModelExecutor = null as unknown as DomainModelExecutor;

  return {
    name: "@mybricks/plugin-domain",
    title: "领域模型",
    author: "MyBricks Team",
    "author.zh": "MyBricks团队",
    version: "0.0.1",
    description: "领域模型",
    data: {
      domainModels: [],
    },
    contributes: {
      geoView: {
        domainModel: {
          type: "default",
          render() {},
        },
      },
      sliderView: {
        tab: {
          title: "领域模型",
          icon: pluginIcon,
          render(params: TabRenderParams) {
            return <Render data={params.data} />;
          },
        },
      },
    },
    onLoad(params: OnLoadParams) {
      params.domainModel.getAll = async () => {
        const domainModels: DomainModel[] = [];

        await Promise.all(
          params.data.domainModels.map(async (domainModel) => {
            const cacheDomainModels = context.cache.getDomainModels(
              domainModel.id,
            );
            if (cacheDomainModels) {
              // 读缓存
              domainModels.push(...cacheDomainModels);
            } else {
              if (domainModel.type === "nocobase") {
                const nocobaseDomainModels =
                  await getNocobaseDomainModels(domainModel);
                context.cache.setDomainModels(
                  domainModel.id,
                  nocobaseDomainModels,
                );
                domainModels.push(...nocobaseDomainModels);
              }
            }
          }),
        );

        return domainModels;
      };
    },
    toJSON(params: ToJSONParams) {
      domainModelExecutor = new DomainModelExecutor(params.data);
      return params.data;
    },
    callDomainModel(...args: Parameters<typeof domainModelExecutor.call>) {
      return domainModelExecutor?.call(...args);
    },
  };
};

export default domainPlugin;

export type { Data };
