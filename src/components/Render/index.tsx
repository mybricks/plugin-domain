import React from "react";

import css from "./index.module.less";

type RenderProps = {
  data: Data;
};

const Render = (props: RenderProps) => {
  console.log("⏳ Render props => ", props);

  const handleaAddDomainModelButtonClick = () => {
    console.log("点击了添加模型");
  };

  return (
    <div className={css.pluginContainer}>
      <div className={css.pluginTopBar}>
        <div className={css.pluginTitle}>领域模型</div>
        <button
          className={css.addDomainModelButton}
          onClick={handleaAddDomainModelButtonClick}
        >
          添加模型
        </button>
      </div>
      <div className={css.domainModelList}>
        {props.data.domainModels.map(() => {
          return <div>领域模型列表项</div>;
        })}
      </div>
    </div>
  );
};

export default Render;
