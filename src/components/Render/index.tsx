import React, { useRef, useMemo } from "react";
import { Input, Button, message } from "antd";
import Nocobase from "../../nocobase";
import { uuid } from "../../utils";
import type { Data } from "../../index";

import css from "./index.module.less";

type RenderProps = {
  data: Data;
};

const Render = (props: RenderProps) => {
  const conetxt = useRef({
    id: "",
    baseURL: "",
    token: "",
    type: "create",
  });

  useMemo(() => {
    if (
      props.data.domainModels[0] &&
      props.data.domainModels[0].type === "nocobase"
    ) {
      conetxt.current.baseURL = props.data.domainModels[0].connect.baseURL;
      conetxt.current.token = props.data.domainModels[0].connect.token;
      conetxt.current.type = "update";
    } else {
      conetxt.current.id = uuid();
    }
  }, []);

  return (
    <div className={css.pluginContainer}>
      <div className={css.pluginTopBar}>
        <div className={css.pluginTitle}>领域模型</div>
        {/* <button
          className={css.addDomainModelButton}
          onClick={handleaAddDomainModelButtonClick}
        >
          添加模型
        </button> */}
      </div>

      <div className={css.tmp}>
        <div>nocobase</div>
        <Input
          placeholder="域名(https://xxxx/api)"
          size="small"
          defaultValue={conetxt.current.baseURL}
          onChange={(e) => {
            conetxt.current.baseURL = e.target.value;
          }}
        />
        <Input
          placeholder="token"
          size="small"
          defaultValue={conetxt.current.token}
          onChange={(e) => {
            conetxt.current.token = e.target.value;
          }}
        />
        <Button
          size="small"
          onClick={() => {
            const nocobase = new Nocobase({
              baseURL: conetxt.current.baseURL,
              token: conetxt.current.token,
              storagePrefix: `NOCOBASE_${conetxt.current.id}_`,
            });

            nocobase.authCheck().then((result) => {
              if (result) {
                if (conetxt.current.type === "create") {
                  props.data.domainModels.push({
                    id: uuid(),
                    type: "nocobase",
                    connect: {
                      baseURL: conetxt.current.baseURL,
                      token: conetxt.current.token,
                    },
                  });
                } else {
                  props.data.domainModels[0] = {
                    id: conetxt.current.id,
                    type: "nocobase",
                    connect: {
                      baseURL: conetxt.current.baseURL,
                      token: conetxt.current.token,
                    },
                  };
                }
                message.success("连接成功");
              } else {
                message.error(
                  `[nocobase - /auth:check] 鉴权未通过，请检查baseURL以及token配置。`,
                );
              }
            });
          }}
        >
          连接测试
        </Button>
      </div>
      {/* <div className={css.domainModelList}>
        {props.data.domainModels.map(() => {
          return <div>领域模型列表项</div>;
        })}
      </div> */}
    </div>
  );
};

export default Render;
