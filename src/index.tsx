import React from "react";
import Render from "./components/Render";
import { pluginIcon } from "./components/Icon";
import Nocobase, { DomainModelNocobase } from "./nocobase";

type TabRenderParams = {
  data: Data;
};

type DomainModelOther = {
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
        // {
        //   id: "iiii", // 需要区分不同的nocobase
        //   type: "nocobase",
        //   connect: {
        //     baseURL: "http://127.0.0.1:13001/api",
        //     token:
        //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRlbXAiOnRydWUsImlhdCI6MTc0NDc3MTc2MSwic2lnbkluVGltZSI6MTc0NDc3MTc2MTk5OCwiZXhwIjoxNzQ0ODU4MTYxLCJqdGkiOiIyMGIyN2I1Yi0yNTZmLTQzMDYtYTllZi0xNDc4NThkMTk0N2EifQ.YCs_ZBtNa02E4MPuC60ohqMo48w0Wu_rDn52ziqebB0",
        //   },
        // },
      ],
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
        return domainModels;
      };
    },
  };
};

export default domainPlugin;

export type { Data };
