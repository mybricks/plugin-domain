import React, { useRef, useMemo, useState } from "react";
import { Form, Input, Button, message, Badge } from "antd";
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

  // [TODO] 测试loading，测试结果
  const [loading, setLoading] = useState(false);
  const [checkPass, setCheckPass] = useState(false);

  /** 连接测试 */
  const connectTest = (successNext?: () => void) => {
    setLoading(true);
    const nocobase = new Nocobase({
      baseURL: conetxt.current.baseURL,
      token: conetxt.current.token,
    });
    nocobase.authCheck().then((result) => {
      if (result) {
        message.success("连接成功");
        setCheckPass(true);
        successNext?.();
      } else {
        message.error(
          `[nocobase - /auth:check] 鉴权未通过，请检查baseURL以及token配置。`,
        );
        setCheckPass(false);
      }
      setLoading(false);
    });
  };

  useMemo(() => {
    if (
      props.data.domainModels[0] &&
      props.data.domainModels[0].type === "nocobase"
    ) {
      conetxt.current.id = props.data.domainModels[0].id;
      conetxt.current.baseURL = props.data.domainModels[0].connect.baseURL;
      conetxt.current.token = props.data.domainModels[0].connect.token;
      conetxt.current.type = "update";
      connectTest();
    } else {
      conetxt.current.id = uuid();
    }
  }, []);

  return (
    <div className={css.pluginContainer}>
      <div className={css.pluginTopBar}>
        <div className={css.pluginTitle}>领域模型</div>
      </div>

      <div className={css.tmp}>
        <div style={{ fontSize: 12, fontWeight: "bold" }}>NocoBase</div>
        <Form layout="vertical" size="small">
          <Form.Item label="接口地址" name="baseURL">
            <Input
              placeholder="https://xxxx/api"
              defaultValue={conetxt.current.baseURL}
              onChange={(e) => {
                conetxt.current.baseURL = e.target.value;
              }}
            />
          </Form.Item>
          <Form.Item label="密钥" name="token">
            <Input
              placeholder="token"
              type="password"
              defaultValue={conetxt.current.token}
              onChange={(e) => {
                conetxt.current.token = e.target.value;
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              style={{ marginTop: 8 }}
              loading={loading}
              icon={
                loading ? null : (
                  <Badge status={checkPass ? "success" : "error"} />
                )
              }
              onClick={() => {
                connectTest(() => {
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
                });
              }}
            >
              连接测试
            </Button>
          </Form.Item>
        </Form>
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
