import React from "react";
import Render from "./components/Render";
import { pluginIcon } from "./components/Icon";
import Nocobase, { DomainModelNocobase } from "./nocobase";

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
      // [TODO] 后面多个领域模型后，再改
      const _cache: {
        domainModel?: DomainModel[];
      } = {};
      params.domainModel.getAll = async () => {
        if (_cache.domainModel) {
          return _cache.domainModel;
        }
        const domainModels: DomainModel[] = [];

        await Promise.all(
          params.data.domainModels.map(async (domainModel) => {
            if (domainModel.type === "nocobase") {
              const { id, connect } = domainModel;
              const nocobase = new Nocobase({
                ...connect,
                storagePrefix: `NOCOBASE_${id}_`,
              });
              const domainModelNocobases = await nocobase.getDomainModels();
              domainModels.push(
                ...domainModelNocobases.map((domainModel) => {
                  return {
                    ...domainModel,
                    id: `${id}.${domainModel.id}`,
                  };
                }),
              );
            }
          }),
        );

        if (domainModels.length) {
          _cache.domainModel = domainModels;
        }

        return domainModels;
      };
    },
    toJSON(params: ToJSONParams) {
      return params.data;
    },
  };
};

export default domainPlugin;

export type { Data };
